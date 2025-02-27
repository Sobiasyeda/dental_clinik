from flask import (request, Blueprint, jsonify, session, make_response,url_for,
                   redirect,send_from_directory,current_app)
from .models import (User, UserRole,
                     Procedures, PriceList, PatientRegistrationInfo, \
    BookingEncounter, TreatmentEncounter, Expenses, RootCanal, Access, SystemAdminAccess,PatientDocuments
                     ,ReminderSent,Diagnosis, DiagnosisEncounters,DiagnosisEncountersCopy,UserFacebook)
from .extensions import db, mail
from sqlalchemy import and_, or_, not_, func
from datetime import date
import pandas as pd
from datetime import datetime, timedelta
from fuzzywuzzy import fuzz
import jwt
from sqlalchemy import desc
from .auth_decorators import token_required, role_required
from dotenv import load_dotenv
import os
import base64
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
from werkzeug.utils import secure_filename
from io import BytesIO
import requests
import hashlib,hmac,json
from .tasks import (send_email_via_gmail,
                    send_whatsapp_messages,
                    onboardingBusinessCustomers,
                    documentsUploadToAWS
                    )

import boto3
from botocore.exceptions import NoCredentialsError
from .config import Config

load_dotenv()

main = Blueprint('main', __name__)

SECRET_KEY = os.environ.get("SECRET_KEY")
s= URLSafeTimedSerializer(SECRET_KEY)


ACTIVE = "active"
INACTIVE = "inactive"
COMPLETED="completed"
DISCHARGED="discharged"
PRINT="print"
TREATMENT_PLAN="treatment_plan"




# delete patient info if requested by user
def base64_url_decode(input_str):
    """Decodes a base64 URL-safe encoded string."""
    input_str += '=' * (4 - len(input_str) % 4)
    return base64.urlsafe_b64decode(input_str.encode())

def parse_signed_request(signed_request):
    """Parses and validates the signed request from Facebook."""
    try:
        encoded_sig, payload = signed_request.split('.', 1)
        sig = base64_url_decode(encoded_sig)
        data = json.loads(base64_url_decode(payload).decode())

        expected_sig = hmac.new(
            current_app.config['APP_SECRET'].encode(), payload.encode(), hashlib.sha256
        ).digest()

        if sig != expected_sig:
            return None  # Invalid signature

        return data  # Return the parsed data
    except Exception as e:
        print("Error parsing signed request:", e)
        return None

@main.route('/data-deletion',methods=['POST'])
def data_deletion():
    """Handles data deletion requests from Facebook."""
    signed_request = request.form.get('signed_request')
    if not signed_request:
        return jsonify({'error':'Missing signed_request'}),400

    data = parse_signed_request(signed_request)

    if not data or "user_id" not in data:
        return jsonify({'error':'Invalid signed_request'}),400

    user_id = data["user_id"]
    user = UserFacebook.query.filter_by(user_id=user_id).first()
    # add email column in User Facebook table
    email=user.email
    #TODO:Implement logic to delete user data from database
    print(f"Deleting data for user {user_id}")

    # generate a tracking URL and confimration code
    confirmation_code = f"delete_{user_id}"
    status_url =f"https://smilescraft.com/deletion-status?id={confirmation_code}"
    #prepare email parameters
    subject ="App Delete Status"
    email_content=f"Your request to delete data app has been received.\n\n"\
    f"Tracking code:{confirmation_code}\n"\
    f"You can check the status here:{status_url}"
    send_email_via_gmail.delay(email,token=None,subject=subject,path=status_url,text='',email_content=email_content)


@main.route('/deletion-status',methods=['GET'])
def deletion_status():
    """Page for users to check deletion request status."""
    confirmation_code = request.args.get("id")
    if not confirmation_code:
        return "Invalid confirmation code",400
    return f"Your data deletion request with ID {confirmation_code} has been processed",200




# store images / videos in aws s3 and download them when needed
BUCKETEER_BUCKET_NAME=os.getenv('BUCKETEER_BUCKET_NAME')
ALLOWED_EXTENSIONS={'jpg','jpeg','png','tif','tiff','bmp','webp','pdf','gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS

def get_document_url(bucket_name, file_name):
    if file_name:
        s3_client = boto3.client('s3',
                                 aws_access_key_id = os.getenv('BUCKETEER_AWS_ACCESS_KEY_ID'),
                                 aws_secret_access_key = os.getenv('BUCKETEER_AWS_SECRET_ACCESS_KEY')
                                 )
        try:
            url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket_name, 'Key': file_name},
                ExpiresIn=300
            )
            return url
        except Exception as e:
            print(f"Error generating presigned URL: {e}")
            return None
    return

@main.route("/view_docs",methods=['POST'])
@token_required
@role_required([Config.DOCTOR,Config.ASSISTANT,Config.ADMIN,Config.NURSE])
def view_docs(current_user):
    data=request.json
    patient_id=data.get('patient_id')
    user_id=current_user['user_id']
    user = User.query.filter_by(id=user_id).first()
    clinic_name = user.clinicName
    patient = PatientRegistrationInfo.query.filter_by(id=patient_id,clinic_name=clinic_name).first()
    patient_name=patient.name
    patient_father = patient.father
    patient_family = patient.family

    all_documents = PatientDocuments.query.filter_by(patient_id=patient_id,clinic_name=clinic_name).all()
    response=[]
    for document in all_documents:
        presigned_url=get_document_url(BUCKETEER_BUCKET_NAME,document.file_path)
        response.append({
            'file_name':os.path.basename(document.file_path),
            'file_path':presigned_url if presigned_url else "Error generalting URL",
            'upload_date':document.upload_date.strftime("%Y-%m-%d"),
            'name':patient_name,
            'father':patient_father,
            'family':patient_family
        })
    return jsonify(response)


@main.route("/upload_documents",methods=['POST'])
@token_required
@role_required([Config.DOCTOR,Config.ASSISTANT,Config.ADMIN,Config.NURSE])
def upload_documents(current_user):
    if request.method == 'POST':
        patient_id= request.form.get("patientId")
        upload_photo=request.form.get("upload_photo")
        user_id=current_user["user_id"]
        user = User.query.filter_by(id=user_id).first()
        clinic_name=user.clinicName
        patient=PatientRegistrationInfo.query.filter_by(id=patient_id).first()

        if 'file' not in request.files:
            return jsonify({'message':'No file part!'}),400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message':'No selected file!'}),400
        filename = secure_filename(file.filename)
        print("file name",filename)

        if not allowed_file(filename):
            return jsonify({'message':'File type not allowed!'}),400
        #extract original file extension
        file_extension = filename.rsplit('.',1)[-1].lower()

        #convert filename to correct format before storing in DB
        if file_extension == 'dcm':
            filename = filename.rsplit('.',1)[0] + '.png'
        elif file_extension in ('jpg','jpeg','png','tif','bmp','webp','tiff','gif'):
            filename=filename.rsplit('.',1)[0] + '.webp'
        elif file_extension == 'pdf':
            pass
        try:
            # 1- offload upload , store it in AWS S3 and let celery send it as this will delay message if kept here
            file_bytes = file.read()
            encoded_file = base64.b64encode(file_bytes).decode('utf-8')
            documentsUploadToAWS.delay(encoded_file,filename)

            if upload_photo:
                #update patient image path
                patient.patient_image=filename
                db.session.commit()
            else:
                #same document in database
                new_document = PatientDocuments(
                    patient_id=patient_id,
                    file_path=filename,
                    document_type=file.mimetype,
                    uploaded_by=user_id,
                    clinic_name=clinic_name
                )
                db.session.add(new_document)
                db.session.commit()
            return jsonify({'message':'File uploaded successfully'}),200
        except NoCredentialsError:
            return jsonify({'message':'Credentials not available !'}),409
        except Exception as e:
            return jsonify({'message': f'Failed to upload file: {str(e)}'}), 500


# 1- you keep react running and you run flask at the same time (open a new tab browser) on http://127.0.0.1:5000/authorize
# This route initiates the OAuth 2.0 authorization process by redirecting the user
# to Google's authorization endpoint.
# @main.route('/authorize')
# def authorize():
#     auth_url = (
#         "https://accounts.google.com/o/oauth2/auth"
#         "?response_type=code"
#         f"&client_id={Config.GOOGLE_CLIENT_ID}"
#         f"&redirect_uri={Config.REDIRECT_URI}"
#         "&scope=https://www.googleapis.com/auth/gmail.send"
#         "&access_type=offline"
#         "&prompt=consent"
#     )
#     return redirect(auth_url)

# 2- i need to exchange the authorization code with access token and refresh token
#this is where you will get the token
# @main.route('/oauth2callback')
# def oauth2callback():
#     code = request.args.get('code')
#     token_url = "https://oauth2.googleapis.com/token"
#     token_data = {
#         'code': code,
#         'client_id': Config.GOOGLE_CLIENT_ID,
#         'client_secret': Config.GOOGLE_CLIENT_SECRET,
#         'redirect_uri': Config.REDIRECT_URI,#The URI to which Google will send the user after they authorize your app.
#         'grant_type': 'authorization_code'
#     }
#     token_response = requests.post(token_url,data=token_data) # Constructs a POST request to Google's token endpoint to exchange the authorization code for an access token and refresh token.
#     token_json = token_response.json()
#     refresh_token=token_json.get('refresh_token')
#     return f"Refresh token:{refresh_token}"


def create_token(user_id, role, user_name):
    payload = {
        'user_id': user_id,
        'role': role,
        'user_name': user_name,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token


@main.route('/', defaults={'path': ''})
@main.route('/<path:path>',methods=['GET'])
def serve_static(path):
    return send_from_directory('static', 'index.html')


# /login Route: Handles the login POST requests for logging in users, keeping your existing logic.
@main.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        # Basic validations
        if '@' not in email:
            return jsonify({'message': 'Email Missing @', 'status': 'invalid'})
        if len(password) <= 8:
            return jsonify({'message': 'Invalid Password', 'status': 'invalid'})

        # Check user
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            if user.status == ACTIVE:
                user_role = user.role
                user_id = user.id
                user_name = user.name
                user_family = user.family
                user_full_name = f"{user_name} {user_family}"
                token = create_token(user.id, user.role, user_full_name)
                return jsonify({
                    'status': 'success',
                    'token': token,
                    'userid': user_id,
                    'role': user_role,
                    'user': user_full_name
                })
            else:
                return jsonify({'message': 'User not active', 'status': 'invalid'})
        # If no user found
        return jsonify({'message': 'Invalid email or password', 'status': 'invalid'})

    except Exception as e:
        current_app.logger.error(f"Error during login: {str(e)}")
        return jsonify({'message': 'Internal Server Error', 'status': 'error'}), 500


@main.route('/viewauth', methods=['GET','POST'])
@token_required
def view_auth(current_user):
    data = request.json
    page = data.get('page')
    user_id = current_user["user_id"]
    user_role = current_user["role"]
    user = User.query.filter_by(id=user_id).first()
    if user and user.status == ACTIVE:
        clinic_name = user.clinicName
        access_role = Access.query.filter(and_(
            Access.role == user_role,
            Access.clinic_name == clinic_name
        )).first()

        if access_role:
            for column in Access.__table__.columns:
                column_name = column.name
                if column_name == page:
                    if getattr(access_role, column_name) == 1:
                        return jsonify({'message': 'Access granted'})
                    else:
                        return jsonify({'message': 'Access denied'}), 403
            return jsonify({'message': 'Incorrect page access'}), 405
        return jsonify({'message': 'No permission'}), 406
    return jsonify({'User not found or inactive'}), 407

@main.route('/systemadmin', methods=['GET', 'POST'])
@token_required
@role_required([Config.SYSTEMADMIN])
def system_admin(current_user):
    if request.method =='POST':
        data = request.json
        page = data.get('page')
        user_id = current_user['user_id']
        user = User.query.filter_by(id=user_id).first()
        if user and user.status == ACTIVE:
            access_role = SystemAdminAccess.query.filter_by(user_id=user_id).first()
            if access_role:
                for column in SystemAdminAccess.__table__.columns:
                    column_name = column.name
                    if column_name == page:
                        if getattr(access_role, column_name) == 1:
                            return jsonify({'message': 'Access granted'})
                        else:
                            return jsonify({'message': 'Access denied'}), 406
                return jsonify({'message': 'Incorrect page access'}), 405
            return jsonify({'message': 'No permission'}), 403
        return jsonify({'User not found or inactive'}), 404
    return jsonify({'message':'Medhod not allowed'}),405


@main.route('/storeRoles', methods=['POST'])
@token_required
@role_required([Config.ADMIN,Config.SYSTEMADMIN,Config.DOCTOR,Config.ASSISTANT])
def store_roles(current_user):
    if request.method == 'POST':
        data = request.json
        clinic_name = data.get('clinicName')
        if not clinic_name:
            return jsonify({'message': 'Clinic Name is required'}), 400

        role_page_data = {k: v for k, v in data.items() if k != 'clinicName'}

        # Dictionary to hold the roles and their page accesses
        role_access = {}

        for key, page_name in role_page_data.items():
            role_type, unique_id = key.split('-', 1)  # Extract role from key

            # Initialize the role if not already in the dictionary, all are set to False in the beginning
            if role_type not in role_access:
                role_access[role_type] = {
                    'register_patient': False,
                    'calendar': False,
                    'emr': False,
                    'diagnosis':False,
                    'past_history': False,
                    'treatment_plan': False,
                    'reports': False,
                    'bill_details': False,
                    'old_bill': False,
                    'old_bills':False,
                    'current_patients':False,
                    'expenses': False,
                    'stock': False,
                    'dashboard': False,
                    'main_admin': False,
                    'add_user': False,
                    'change_user_status': False,
                    'price_list': False,
                    'access_roles': False

                }

            # right after placing all pages as False, check the pages send from front end
            # and Update the corresponding page access
            if page_name in role_access[role_type]:
                print("michel")
                role_access[role_type][page_name] = True

        # Upsert the data into the database
        for role, access_data in role_access.items():
            access_entry = Access.query.filter_by(clinic_name=clinic_name, role=role).first()

            if access_entry:
                #this is the later post requests(not the first one) you send to update roles
                access_entry.register_patient = access_data['register_patient']
                access_entry.calendar = access_data['calendar']
                access_entry.emr = access_data['emr']
                access_entry.diagnosis=access_data['diagnosis']
                access_entry.past_history = access_data['past_history']
                access_entry.treatment_plan = access_data['treatment_plan']
                access_entry.reports = access_data['reports']
                access_entry.bill_details = access_data['bill_details']
                access_entry.old_bill = access_data['old_bill']
                access_entry.old_bills = access_data['old_bills']
                access_entry.current_patients = access_data['current_patients']
                access_entry.expenses = access_data['expenses']
                access_entry.stock = access_data['stock']
                access_entry.dashboard = access_data['dashboard']
                access_entry.main_admin = access_data['main_admin']
                access_entry.add_user = access_data['add_user']
                access_entry.change_user_status = access_data['change_user_status']
                access_entry.price_list = access_data['price_list']
                access_entry.access_roles = access_data['access_roles']

            else:
                #this is first post request you send to store the roles
                access_entry = Access(
                    clinic_name=clinic_name,
                    role=role,
                    register_patient=access_data['register_patient'],
                    calendar=access_data['calendar'],
                    emr=access_data['emr'],
                    diagnosis=access_data['diagnosis'],
                    past_history=access_data['past_history'],
                    treatment_plan = access_data['treatment_plan'],
                    reports=access_data['reports'],
                    bill_details=access_data['bill_details'],
                    old_bill=access_data['old_bill'],
                    old_bills=access_data['old_bills'],
                    current_patients=access_data['current_patients'],
                    expenses=access_data['expenses'],
                    stock=access_data['stock'],
                    dashboard=access_data['dashboard'],
                    main_admin=access_data['main_admin'],
                    add_user=access_data['add_user'],
                    change_user_status=access_data['change_user_status'],
                    price_list=access_data['price_list'],
                    access_roles=access_data['access_roles']
                )
                db.session.add(access_entry)
        db.session.commit()
        return jsonify({'message': 'Roles stored successfully'}), 200



@main.route('/search-patient', methods=['GET', 'POST'])
@token_required
@role_required([Config.DOCTOR, Config.ASSISTANT, Config.ADMIN, Config.NURSE])
def searchPatient(current_user):
    if request.method == 'POST':
        data = request.json
        user_id = current_user["user_id"]
        user = User.query.filter_by(id=user_id).first()
        if user and user.status == ACTIVE:
            clinic_name = user.clinicName
            name = data.get('search')
            input = name.capitalize()

            # search for patients who are part of their clinic
            patients = PatientRegistrationInfo.query.filter_by(clinic_name=clinic_name).all()
            fuzzy_matches = []

            for patient in patients:
                similarity_ratio = fuzz.partial_ratio(input, patient.name)
                if similarity_ratio >= 80:
                    fuzzy_matches.append(patient)

            if fuzzy_matches:
                result_data = []
                for patient in fuzzy_matches:
                    procedures = TreatmentEncounter.query.filter(and_(
                        TreatmentEncounter.patientId == patient.id,
                    )).all()

                    presigned_url= get_document_url(os.getenv('BUCKETEER_BUCKET_NAME'),patient.patient_image)

                    if procedures:
                        patient_data = {
                            'email':patient.email,
                            'name': patient.name,
                            'father': patient.father,
                            'family': patient.family,
                            'phone': patient.phone,
                            'dob': patient.dob,
                            'id': patient.id,
                            'allergy': patient.allergy,
                            'photo':presigned_url,
                            'procedures': [{'toothNum': procedure.toothNumber,
                                            'procedure': procedure.procedure,
                                            'status': procedure.status,
                                            'encounterDate': procedure.statusDate,
                                            'notes': procedure.notes,
                                            'treat_encount_id':procedure.id,
                                            'fees':procedure.fees,
                                            'status_date':procedure.statusDate,
                                            'provider':procedure.provider,
                                            'discount':procedure.discount,
                                            'bill_number':procedure.billSequenceNumber,
                                            'net_price':procedure.netPrice,
                                            'amount_paid':procedure.amountPaid if procedure.amountPaid is not None else 0,
                                            'write_off':procedure.writeOff if procedure.writeOff is not None else 0,
                                            'remaining_balance':procedure.remainingBalance,
                                            'clinic_name':procedure.clinicName}
                                           for procedure in
                                           procedures],

                        }
                    else:
                        patient_data = {
                            'email':patient.email,
                            'name': patient.name,
                            'father': patient.father,
                            'family': patient.family,
                            'phone': patient.phone,
                            'dob': patient.dob,
                            'id': patient.id,
                            'allergy': patient.allergy,
                            'photo':presigned_url,
                            'procedures': [],
                        }
                    result_data.append(patient_data)
                print("result data",result_data)
                return jsonify(result_data)
            else:
                return jsonify({'message': 'Patient Not Found!'}), 401
        else:
            return jsonify({'message': 'User Not Found !'}), 500


@main.route('/getSystemAdmins', methods=['GET', 'POST'])
@token_required
@role_required([Config.SYSTEMADMIN])
def getSystemAdmins(current_user):
    if request.method == 'GET':
        user_role=current_user['role']
        system_admin = User.query.filter_by(role=user_role).all()
        complete_name = []
        for name in system_admin:
            complete_name.append(
                name.name + " " + name.family
            )
        return jsonify(complete_name)


@main.route('/getRoles', methods=['GET'])
@token_required
@role_required([Config.DOCTOR,Config.SYSTEMADMIN,Config.ADMIN,Config.ASSISTANT])
def getRoles(current_user):
    if request.method == 'GET':
        user_role=current_user['role']
        if user_role != Config.SYSTEMADMIN:
            role = UserRole.query.all()
            role_list = []
            for r in role:
                if r.description != Config.SYSTEMADMIN:
                    role_list.append({
                        'role': r.description
                    })
            return jsonify(role_list)
        else:
            role=UserRole.query.all()
            role_list=[]
            for r in role:
                role_list.append({
                    'role':r.description
                })
            return jsonify(role_list)


@main.route("/getAllClinics", methods=['GET'])
@token_required
@role_required([Config.SYSTEMADMIN,Config.ADMIN,Config.DOCTOR,Config.ASSISTANT])
def getAllClinics(current_user):
    if request.method == 'GET':
        user_id=current_user['user_id']
        user = User.query.filter_by(id=user_id).first()
        if user and user.status == ACTIVE:
            if user.role!=Config.SYSTEMADMIN:
                clinic_name = user.clinicName
                return jsonify(clinic_name)
            else:
                # For system admin, get all distinct, non-empty clinic names
                clinics = db.session.query(User.clinicName) \
                    .filter(User.clinicName.isnot(None), User.clinicName != '') \
                    .distinct() \
                    .all()
                clinic_names=[clinic[0] for clinic in clinics]
                return jsonify(clinic_names)
        else:
            return jsonify({'message': 'User Not Found !'}), 404


@main.route('/pages', methods=['GET'])
@token_required
@role_required([Config.SYSTEMADMIN,Config.ADMIN,Config.DOCTOR,Config.ASSISTANT])
def pages(current_user):
    if request.method == 'GET':
        user_id=current_user['user_id']
        user = User.query.filter_by(id=user_id).first()
        if user and user.status == ACTIVE:
            pages_names = [column.name for column in Access.__table__.columns if
                           (column.name != 'id' and column.name != 'clinic_name'
                           )]
            return jsonify(pages_names)
        else:
            return jsonify({'message': 'User not available'}), 401


@main.route('/Systempages', methods=['GET'])
@token_required
@role_required([Config.SYSTEMADMIN,Config.ADMIN,Config.DOCTOR,Config.ASSISTANT,Config.NURSE])
def Systempages(current_user):
    if request.method == 'GET':
        user_id=current_user["user_id"]
        system_user = User.query.filter_by(id=user_id).first()
        if system_user and system_user.status == ACTIVE:
            pages_n = [column.name for column in SystemAdminAccess.__table__.columns if
                       (column.name != 'id' and column.name != 'user_id')]
            return jsonify(pages_n)
        else:
            return jsonify({'message': 'User not available'}), 401


@main.route('/handleSystemAdminAccess', methods=['GET', 'POST'])
@token_required
@role_required([Config.SYSTEMADMIN])
def handle_system_access(current_user):
    if request.method == 'POST':
        data = request.json
        admin_name = data.get('select-admin-name')
        admin_id = current_user["user_id"]
        if not admin_name:
            return jsonify({'message': 'Admin Name is required'}), 401
        system_user = User.query.filter_by(id=admin_id).first()
        if system_user and system_user.status == ACTIVE:
            page_data = {k: v for k, v in data.items() if k != 'select-admin-name' and k != 'id'}
            page_access = {
                'main_system_admin': False,
                'add_system_admin': False,
                'access_system_admin': False,
                'add_clinic_user': False,
                'add_sub_users': False,
                'change_clinic_user_status': False,
                'set_clinic_prices': False,
                'clinic_access_roles': False,
                'set_clinic_procedures': False,
                'reset_user_password': False
            }

            for key, page_name in page_data.items():
                if page_name in page_access:
                    page_access[page_name] = True

            access_entry = SystemAdminAccess.query.filter_by(user_id=admin_id).first()
            if access_entry:
                access_entry.main_system_admin = page_access['main_system_admin']
                access_entry.add_system_admin = page_access['add_system_admin']
                access_entry.access_system_admin = page_access['access_system_admin']
                access_entry.add_clinic_user = page_access['add_clinic_user']
                access_entry.add_sub_users = page_access['add_sub_users']
                access_entry.change_clinic_user_status = page_access['change_clinic_user_status']
                access_entry.set_clinic_prices = page_access['set_clinic_prices']
                access_entry.clinic_access_roles = page_access['clinic_access_roles']
                access_entry.set_clinic_procedures = page_access['set_clinic_procedures']
                access_entry.reset_user_password = page_access['reset_user_password']
            else:
                access_entry = SystemAdminAccess(
                    user_id=admin_id,
                    main_system_admin=page_access['main_system_admin'],
                    add_system_admin=page_access['add_system_admin'],
                    access_system_admin=page_access['access_system_admin'],
                    add_clinic_user=page_access['add_clinic_user'],
                    add_sub_users=page_access['add_sub_users'],
                    change_clinic_user_status=page_access['change_clinic_user_status'],
                    set_clinic_prices=page_access['set_clinic_prices'],
                    clinic_access_roles=page_access['clinic_access_roles'],
                    set_clinic_procedures=page_access['set_clinic_procedures'],
                    reset_user_password=page_access['reset_user_password']
                )
                db.session.add(access_entry)
            db.session.commit()
            return jsonify({'message': 'Access added succesfully'}), 200
        else:
            return jsonify({'message': 'User not available'}), 401



@main.route("/get_previous_diagnosis",methods=['POST'])
@token_required
@role_required([Config.DOCTOR])
def get_previous_diagnosis(current_user):
    if request.method =="POST":
        data = request.json
        patient_id=data["patient_id"]
        user_id=current_user["user_id"]
        user = User.query.filter_by(id=user_id).first()
        clinic_name=user.clinicName
        previous_diagnosis=[]
        diagnosis_encounter = DiagnosisEncounters.query.filter(and_(
            DiagnosisEncounters.patient_id == patient_id,
            DiagnosisEncounters.clinic_name == clinic_name
        )).all()

        for diagnosis in diagnosis_encounter:
            previous_diagnosis.append({
                'description':diagnosis.diagnosis_description,
                'tooth_number': diagnosis.tooth_number
            })
        return jsonify(previous_diagnosis)

@main.route("/store_copy_diagnosis",methods=['POST'])
@token_required
@role_required([Config.DOCTOR])
def store_copy_diagnosis(current_user):
    if request.method =='POST':
        data=request.json
        user_id = current_user["user_id"]
        user = User.query.filter_by(id=user_id).first()
        clinic_name=user.clinicName
        date_today = date.today()
        patient_id=data.get("patient_id")
        diagnosis_data=data.get("diagnosis")

        if not diagnosis_data or not patient_id:
            return jsonify({"message":'Patient Id and diagnosis are not available !'})
        # check if the description sent from backend for that patient is already available in table

        # collect all existing diagnosis for this patient and clinic
        existing_diagnosis = DiagnosisEncountersCopy.query.filter_by(
            patient_id=patient_id,
            clinic_name=clinic_name
        ).all()

        # build a set of incoming diagnosis keys for comparison
        incoming_diagnosis = set(
            (tooth_number,description)
            for tooth_number,diagnosis in diagnosis_data.items()
            for description in diagnosis
        )
        # remove rows not in incoming diagnosis
        for existing in existing_diagnosis:
            if(existing.tooth_number,existing.diagnosis_description) not in incoming_diagnosis:
                db.session.delete(existing)


        for tooth_number, diagnosis in diagnosis_data.items():
            if not diagnosis:  # Handle empty arrays
                # Check if the tooth already exists with no diagnosis
                existing_empty = DiagnosisEncountersCopy.query.filter_by(
                    patient_id=patient_id,
                    clinic_name=clinic_name,
                    tooth_number=tooth_number
                ).first()

                # Add a record if not present
                if not existing_empty:
                    empty_diagnosis = DiagnosisEncountersCopy(
                        patient_id=patient_id,
                        user_id=user_id,
                        clinic_name=clinic_name,
                        diagnosis_description=None,  # No diagnosis description for empty arrays
                        tooth_number=tooth_number,
                        date=date_today
                    )
                    db.session.add(empty_diagnosis)
            else:
                for description in diagnosis:
                    existing_diagnosis = DiagnosisEncountersCopy.query.filter_by(
                        patient_id=patient_id,
                        clinic_name=clinic_name,
                        tooth_number=tooth_number,
                        diagnosis_description=description
                    ).first()

                    if not existing_diagnosis or description == "extracted":
                        # Remove previous diagnosis from table in case extraction is sent to backend
                        if description == "extracted":
                            DiagnosisEncountersCopy.query.filter_by(
                                patient_id=patient_id,
                                clinic_name=clinic_name,
                                tooth_number=tooth_number
                            ).delete()
                        new_diagnosis = DiagnosisEncountersCopy(
                            patient_id=patient_id,
                            user_id=user_id,
                            clinic_name=clinic_name,
                            diagnosis_description=description,
                            tooth_number=tooth_number,
                            date=date_today
                        )
                        db.session.add(new_diagnosis)
        db.session.commit()
        return jsonify({'message':'Diagnosis copy updated successfully'})


@main.route("/getStoredCopyDiagnosis",methods=['POST'])
@token_required
@role_required([Config.DOCTOR])
def getStoredCopyDiagnosis(current_user):
    if request.method=='POST':
        data=request.json
        print("data",data)
        patient_id=data['patient_id']
        user_id=current_user['user_id']
        user=User.query.filter_by(id=user_id).first()
        clinic_name=user.clinicName
        stored_copy_diagnosis=[]
        diagnosis_copy_encounter = DiagnosisEncountersCopy.query.filter(and_(
            DiagnosisEncountersCopy.patient_id==patient_id,
            DiagnosisEncountersCopy.clinic_name==clinic_name
        )).all()
        for copy in diagnosis_copy_encounter:
            stored_copy_diagnosis.append({
                'description':copy.diagnosis_description,
                'tooth_number':copy.tooth_number
            })
        return jsonify(stored_copy_diagnosis)

@main.route("/store_diagnosis",methods=['POST'])
@token_required
@role_required([Config.DOCTOR])
def store_diagnosis(current_user):
    if request.method == "POST":
        user_id= current_user["user_id"]
        data = request.json
        user = User.query.filter_by(id=user_id).first()
        clinic_name = user.clinicName
        patient_id= data.get("patient_id")
        for key, value in data.items():
            if key.startswith('diagnosis-'):
                diagnosis_description = value
                number_key = key.replace('diagnosis-','number-')
                tooth_number = data.get(number_key)

                if diagnosis_description and tooth_number:
                    new_diagnosis = DiagnosisEncounters(
                        patient_id=patient_id,
                        user_id=user_id,
                        clinic_name=clinic_name,
                        diagnosis_description = diagnosis_description,
                        tooth_number=tooth_number,
                        date=date.today()
                    )
                    db.session.add(new_diagnosis)
        db.session.commit()
        return jsonify({'message':'Diagnosis added successfully'}),200
    return jsonify({'message':'Incorrect Method!'})


@main.route('/get_diagnosis',methods=['GET'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR,Config.ASSISTANT,Config.NURSE])
def get_diagnosis(current_user):
    if request.method == "GET":
        diagnosis = Diagnosis.query.all()
        diagnosis_list=[]
        for d in diagnosis:
            diagnosis_list.append({
                'diag':d.diagnosisDescription,
                'id':d.id
            })
        return jsonify(diagnosis_list)
    else:
        return jsonify({'message':'Incorrect request method!'})


@main.route('/getClinics', methods=['GET'])
@token_required
@role_required([Config.SYSTEMADMIN,Config.ADMIN,Config.DOCTOR,Config.ASSISTANT])
def getClinics(current_user):
    if request.method == 'GET':
        user_id=current_user['user_id']
        user = User.query.filter_by(id=user_id).first()
        if user and user.status == ACTIVE:
            clinic_name = user.clinicName
            return jsonify(clinic_name)

        else:
            return jsonify({'message': 'Unable to fetch user'}), 500


#store client whatsapp phone id, code and WABA ID in data base
@main.route('/storeWAData',methods=['POST'])
@token_required
@role_required([Config.SYSTEMADMIN, Config.DOCTOR,Config.ASSISTANT])
def storeWAData(current_user):
    if request.method == 'POST':
        user_id=current_user['user_id']
        data = request.json
        phone_number_id=data.get('phone_number_id')
        waba_id = data.get('waba_id')
        token_code = data.get('code')

        if not phone_number_id or not waba_id or not token_code:
            return jsonify({'message':'Missing required fields'})

        user = User.query.filter_by(id=user_id).first()
        clinic_name=user.clinicName
        if user and user.status == ACTIVE:
            user_facebook=UserFacebook(
                user_id=user_id,
                clinic_name=clinic_name,
                wa_phone_number_id=phone_number_id,
                waba_id=waba_id,
                token_code=token_code
            )
            db.session.add(user_facebook)
            db.session.commit()
            # call celery task for onboarding
            APP_ID = Config.APP_ID
            APP_SECRET = Config.APP_SECRET
            onboardingBusinessCustomers.delay(APP_ID,APP_SECRET,phone_number_id,waba_id,token_code)

            return jsonify({'message':'Data stored successfully!'})

        return jsonify({'message':'Inactive User'})
    return jsonify({'message':'Incorrect method!'})

# below is webhook to receive clients whatsapp, it is added in my app dashboard
@main.route("/whatsapp",methods=['GET','POST'])
def whatsapp():
    if request.method == 'GET':
        # Meta will send a verification request with a 'hub.challenge' parameter
        # You need to check if the 'hub.verify_token' matches your expected token
        verify_token = 'webhook'
        challenge = request.args.get('hub.challenge')
        token = request.args.get('hub.verify_token')

        if token == verify_token:
            return challenge  # Return challenge to confirm webhook
        else:
            return 'Invalid verify token', 403
    elif request.method == 'POST':
        # Handle incoming webhook POST requests (messages, status updates, etc.)
        data = request.json
        # Process the incoming data here
        print("data",data)
        return '', 200



#3- the access token is used when sending requests to API google, when expired
# the refresh token ran again to create a new access taken
@main.route('/add-user', methods=['POST', 'GET'])
@token_required
@role_required([Config.SYSTEMADMIN,Config.ADMIN,Config.DOCTOR])
def adduser(current_user):
    if request.method == 'POST':
        data = request.json
        user_role=current_user["role"]
        name = data.get('name').capitalize().strip()
        family = data.get('family').capitalize().strip()
        father = data.get('father').capitalize()
        phone = data.get('phone')
        email = data.get('email')
        password = data.get('password')
        # clinicRooms = data.get("clinic_rooms")
        role = data.get('role')
        code = data.get('code')
        mapping_id = data.get('mapping_nurse')
        tel = code + phone
        clinicName = data.get('clinicName').capitalize().strip()
        #create the token by serializing the email
        token = s.dumps(email,salt='email-confirm')
        findUser = User.query.filter_by(email=email).first()

        # check if user logged in a system admin
        if user_role == Config.SYSTEMADMIN:
            #check if the email sent in the form for the clinic user to be added is a valid email and active status
            if(findUser and findUser.status == ACTIVE):
                return jsonify({'message': 'User is already available!'}), 400
            # in case a user is added but did not confirm the link in email and timed out,
            # register again to send email
            elif(findUser and findUser.status == INACTIVE):
                findUser.clinicName=clinicName,
                findUser.role=role,
                findUser.doctor_id=mapping_id,
                findUser.name=name,
                findUser.family=family,
                findUser.father=father,
                findUser.phone=phone,
                findUser.email=email,
                findUser.status=INACTIVE
                findUser.set_password(password)
                db.session.commit()
                subject = "Confirm Email"
                path = "confirm_email"
                text="email"
                send_email_via_gmail.delay(email, token, subject, path,text,email_content=None)
                return jsonify({'message':'User registered successfully'}),200
            #Add new user for the first time
            newuser = User(
                name=name,
                family=family,
                father=father,
                phone=tel,
                email=email,
                role=role,
                status=INACTIVE,
                clinicName=clinicName,
                doctor_id=mapping_id
            )
            newuser.set_password(password)
            db.session.add(newuser)
            db.session.commit()
            subject = "Confirm Email"
            path = "confirm_email"
            text="email"
            send_email_via_gmail.delay(email,token,subject,path,text,email_content=None)
            return jsonify({'message':'User registration successful'}),200
        else:
            # if the user is not a system admin, they need to send email to smiles
            # craft for us to add new user
            if (findUser and findUser.status == ACTIVE):
                return jsonify({'message': 'User is already available!'}), 400
            # smiles craft already sent an email but the user did not activate, resend an email again as
            # previous has expired
            elif(findUser and findUser.status == INACTIVE):
                smiles_craft_email = Config.MAIL_USERNAME
                subject = "Resend Activation Email to User"
                email_content = f"Please activate user credentials:"\
                    f"Name:{name}-family:{family}-father:{father}-phone:{tel}-role:{role}\n"\
                        f"-mappingNurse:{mapping_id}-email:{email} - clinicName:{clinicName}"

                send_email_via_gmail.delay(smiles_craft_email, token=None, subject=subject,
                                           path='', text='',
                                           email_content=email_content)
                return jsonify({'message':'User did not activate his email, we will send him/her new email for activation'})
            # send email to user to activate his login credentials
            else:
                smiles_craft_email=Config.MAIL_USERNAME
                subject="Add New User"
                email_content = (f"Name:{name}-family:{family}-father:{father}-phone:{tel}-role:{role}-"
                        f"mappingNurse:{mapping_id}-email:{email}-clinicName:{clinicName}")
                text=clinicName
                send_email_via_gmail.delay(smiles_craft_email,token=None,subject=subject,
                                           path='',text='',
                                           email_content=email_content)

                return jsonify({'message':'Successfuly received ! we will shortly add the user to your clinic'})


@main.route('/confirm_email/<token>')
def confirm_email(token):
    try:
        #get the email by decoding the token
        email = s.loads(token,salt='email-confirm',max_age=172800)
        user = User.query.filter_by(email=email).first()
        if user:
            user.status=ACTIVE
            db.session.commit()
            react_app_url=os.getenv('REACT_APP_URL')
            return redirect(react_app_url)
        else:
            return jsonify({'User Not Found'},404)
    except SignatureExpired:
        return jsonify({'message':'The link has expired'}),400
    except BadTimeSignature:
        return jsonify({'message':'The link is invalid'}),400


@main.route('/pass-token', methods=['GET', 'POST'])
def getPasswordToken():
    if request.method == 'POST':
        data = request.json
        email = data.get('email')
        token=s.dumps(email,salt='change-password')
        user = User.query.filter_by(email=email).first()
        if user and user.status == ACTIVE:
            subject ="Change Password"
            path="change-password"
            text="password"

            send_email_via_gmail.delay(email,token,subject,path,text,email_content=None)
            return {'status':'success','email':email,'message':'Successfully sent! Please check your Email'}
        else:
            return jsonify({'message':'User not available!'}),400

@main.route('/change-password/<token>',methods=['GET','POST'])
def change_password(token):
    try:
        email = s.loads(token,salt='change-password',max_age=3600)
        redirect_url = f"{os.getenv('REACT_APP_URL')}/pass-token/change-password?email={email}"
        return redirect(redirect_url)
    except SignatureExpired:
        return jsonify({'message':'The link has expired'}),400
    except BadTimeSignature:
        return jsonify({'message':'Invalid link'}),400


@main.route('/final-password',methods=['GET','POST'])
def final_password():
    if request.method=='POST':
        data=request.json
        email=data.get('email')
        password = data.get('newPass')
        confirm_password = data.get('confirmPass')
        if password != confirm_password:
            return jsonify({'message':'Password do not match'}),404
        user = User.query.filter_by(email=email).first()
        if user and user.status==ACTIVE:
            user.set_password(password)
            db.session.commit()
            return jsonify({'message':'Password successfully changed'}),200
        else:
            return jsonify({'message':'Incorrect user!'}),400

@main.route('/deact', methods=['POST', 'GET'])
@token_required
@role_required([Config.SYSTEMADMIN,Config.ADMIN,Config.DOCTOR,Config.ASSISTANT])
def deactUser(current_user):
    if request.method == 'POST':
        data = request.json
        email = data.get('email')
        confirm_email = data.get('confirmEmail')
        if email != confirm_email:
            return jsonify({'message': 'Emails do not match'}), 405
        findUser = User.query.filter_by(email=email).first()
        if (findUser and findUser.status == ACTIVE):
            findUser.status = INACTIVE
            db.session.commit()
            return jsonify({'message': 'User is now deactivated'}), 200
        elif (findUser and findUser.status == INACTIVE):
            return jsonify({'message': 'Cannot Deactivate ! User already deactivated'}), 400


@main.route('/react', methods=['POST', 'GET'])
@token_required
@role_required([Config.SYSTEMADMIN,Config.ADMIN,Config.DOCTOR,Config.ASSISTANT])
def reactUser(current_user):
    if request.method == 'POST':
        data = request.json
        email = data.get('email')
        confirm_email = data.get('confirmEmail')

        if email != confirm_email:
            return jsonify({'message': 'Emails do not match'}), 405

        findUser = User.query.filter_by(email=email).first()
        if (findUser and findUser.status == INACTIVE):
            findUser.status = ACTIVE
            db.session.commit()
            return jsonify({'message': 'User is now reactivated'}), 200
        elif (findUser and findUser.status == ACTIVE):
            return jsonify({'message': 'User is already Active !'}), 400



@main.route('/get-cities', methods=['GET'])
def get_cities():
    # Safely construct the path relative to the current file's directory
    root_dir = os.path.dirname(os.path.abspath(__file__))  # Adjust as needed
    filepath = os.path.join(root_dir, '..', 'list_of_cities.xlsx')  # Adjust based on actual file location
    df = pd.read_excel(filepath)
    city_list = df['City'].tolist()
    city_tuples = [('', 'Select')] + [(city) for city in city_list]
    if (city_tuples):
        return jsonify(city_tuples)


@main.route('/get_all_teeth', methods=['GET'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR])
def get_all_teeth(current_user):
    if request.method == 'GET':
        all_teeth = RootCanal.query.all()
        result_data = []
        for tooth in all_teeth:
            result_data.append({
                'tooth_number': tooth.tooth_number,
                'tooth_path': tooth.tooth_path,
                'composite_circle':tooth.composite_circle
            })
        return jsonify(result_data)
    else:
        return jsonify({'message': 'unable to fetch images'}), 500


@main.route('/addProcedures', methods=['GET', 'POST'])
@token_required
@role_required([Config.SYSTEMADMIN])
def addProcedures(current_user):
    if request.method == 'POST':
        data = request.json
        procedure_data = {}
        for key, value in data.items():
            if key.startswith('description-proc'):
                unique_id = key[len('description-proc'):]
                procedure_data.setdefault(unique_id, {})['description'] = value

        for unique_id, procedure in procedure_data.items():
            proc = Procedures.query.filter_by(procedureDescription=procedure['description']).first()
            if proc:
                return jsonify({'message': 'Cannot be Added ! Procedure is already available'}), 405
            new_procedure = Procedures(
                procedureDescription=procedure['description'],
            )
            db.session.add(new_procedure)
        db.session.commit()
        return jsonify({'message': 'Procedures Added Successfully'}), 200


@main.route("/clinic-names", methods=['GET'])
@token_required
@role_required([Config.SYSTEMADMIN,Config.ADMIN,Config.DOCTOR,Config.ASSISTANT])
def clinicNames(current_user):
    if request.method == 'GET':
        clinics = User.query.all()
        clinic_set = {c.clinicName for c in clinics if c.clinicName}
        clinic_list = list(clinic_set)
        return jsonify(clinic_list)


@main.route("/specific-clinic", methods=['GET'])
@token_required
@role_required([Config.SYSTEMADMIN,Config.ADMIN,Config.DOCTOR,Config.ASSISTANT])
def specific_clinic(current_user):
    if request.method == 'GET':
        user_id=current_user['user_id']
        print("user_id",user_id)
        user = User.query.filter_by(id=user_id).first()
        clinic_name = user.clinicName
        print("clinic namessss",clinic_name)
        return jsonify(clinic_name)


@main.route('/getProcedures', methods=['GET'])
@token_required
@role_required([Config.SYSTEMADMIN,Config.ADMIN,Config.DOCTOR,Config.ASSISTANT])
def getProcedures(current_user):
    if request.method == 'GET':
        procedures = Procedures.query.all()
        result_data = []
        for procedure in procedures:
            result_data.append({
                'description': procedure.procedureDescription,
            })
        return jsonify(result_data)
    else:
        return jsonify({'message': 'Unable to fetch data'}), 500


@main.route("/getClinicPriceList",methods=['GET'])
@token_required
@role_required([Config.SYSTEMADMIN,Config.ADMIN,Config.DOCTOR,Config.ASSISTANT])
def getClinicPriceList(current_user):
    if request.method =='GET':
        user_id=current_user['user_id']
        user = User.query.filter_by(id=user_id).first()
        if user and user.status==ACTIVE:
            clinicName = user.clinicName
            pricing = PriceList.query.filter_by(clinic_name=clinicName).all()
            price_list=[]
            for price in pricing:
                price_list.append({
                    'Procedure':price.description,
                    'Price':price.price,
                    'Clinic_Name':price.clinic_name,
                    'User_Name':price.user_name
                })
            return jsonify(price_list)
        else:
            return jsonify({'message':'Invalid User'})

@main.route('/pricelist', methods=['GET', 'POST'])
@token_required
@role_required([Config.SYSTEMADMIN,Config.ADMIN,Config.DOCTOR,Config.ASSISTANT])
def pricelist(current_user):
    if request.method == 'POST':
        data = request.json
        user_id=current_user['user_id']
        user = User.query.filter_by(id=user_id).first()
        if user and user.status == ACTIVE:
            procedure_data = {}
            for key, value in data.items():
                if key.startswith('procedure-desc'):
                    unique_id = key[len('procedure-desc'):]
                    procedure_data.setdefault(unique_id, {})['description'] = value
                if key.startswith('procedure-price'):
                    unique_id = key[len('procedure-price'):]
                    procedure_data.setdefault(unique_id, {})['price'] = value
                if key.startswith('clinic-name'):
                    unique_id = key[len('clinic-name'):]
                    procedure_data.setdefault(unique_id,{})['clinic-name'] = value

            for unique_id, procedure in procedure_data.items():
                existing_procedure = PriceList.query.filter(
                    and_(
                        PriceList.description == procedure['description'],
                        PriceList.clinic_name == procedure['clinic-name'])).first()
                if existing_procedure:
                    existing_procedure.price = procedure.get('price', existing_procedure.price)
                    existing_procedure.date = date.today()
                    existing_procedure.clinic_name = procedure.get('clinic-name',existing_procedure.clinic_name)
                    existing_procedure.user_id = user_id
                    existing_procedure.user_name = user.name + " " + user.family
                else:
                    new_procedure = PriceList(
                        user_id=user_id,
                        description=procedure['description'],
                        price=procedure['price'],
                        date=date.today(),
                        clinic_name=procedure['clinic-name'],
                        user_name=user.name + " " + user.family
                    )
                    db.session.add(new_procedure)
            db.session.commit()
            return jsonify({'message': 'Prices added successfully'}), 200
        else:
            return jsonify({'message': 'Not Allowed to Add Prices'}), 400


@main.route('/procedures_stored', methods=['GET'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR])
def procedures_stored(current_user):
    if request.method == 'GET':
        user_id=current_user['user_id']
        userFullName = User.query.filter_by(id=user_id).first()
        if userFullName and userFullName.status == ACTIVE:
            clinic_name = userFullName.clinicName
            getAllProcedures = PriceList.query.filter_by(clinic_name=clinic_name).all()
            procedures_list = []
            for procedure in getAllProcedures:
                procedure_dict = {
                    'description': procedure.description,
                    'price': procedure.price,
                    'user_name': procedure.user_name,
                    'id': procedure.id,
                    'clinic_name': procedure.clinic_name,
                    'user_id': procedure.user_id
                }
                procedures_list.append(procedure_dict)
            return jsonify(procedures_list)
        else:
            return jsonify({'message': 'Invalid User'}), 404


def add_new_patient(name,family,father,dob,phone,gender,email,allergy,clinic):
    """Helper function to add a new patient"""
    new_patient = PatientRegistrationInfo(
        name=name,
        family=family,
        father=father,
        dob=dob,
        phone=phone,
        gender=gender,
        email=email,
        allergy=allergy,
        clinic_name=clinic
    )
    db.session.add(new_patient)
    db.session.commit()
    return jsonify({'message':'Successfully Registered','status':200})

@main.route('/register-patient', methods=['GET', 'POST'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR,Config.ASSISTANT,Config.NURSE])
def registerPatient(current_user):
    if request.method == 'POST':
        data = request.json
        print("data",data)
        user_id=current_user["user_id"]
        name = data.get('name')
        family = data.get('family')
        print("family",family)
        father = data.get('father')
        print("father",father)
        edit=data.get("edit")
        dob = data.get('dob')
        phone = data.get('phone')
        phone_code = data.get('code')
        final_phone = str(phone_code) + str(phone)
        gender = data.get('gender')
        email = data.get('email')
        allergy = data.get('allergy')
        allergy = allergy.capitalize()
        dob_datetime = datetime.strptime(dob, "%Y-%m-%d")
        dob_formatted = dob_datetime.strftime("%d-%B-%Y")
        name = name.capitalize()
        family = family.capitalize()
        father = father.capitalize()

        clinic = User.query.filter_by(id=user_id).first()
        clinic_name = clinic.clinicName

        available = PatientRegistrationInfo.query.filter(
            and_(
                PatientRegistrationInfo.dob == dob_formatted,
                PatientRegistrationInfo.phone == final_phone,
                PatientRegistrationInfo.name == name
            )
        ).first()

        #already available in the database
        if available and not edit:
            return jsonify({'message':'Cannot Be Registered! Already Registered','status':401})

        # Add new patient
        if not available and not edit:
            return add_new_patient(name,family,father,
                                   dob_formatted,final_phone,gender,email,allergy,clinic_name)

        # update patient records
        if edit:
            available_edit = PatientRegistrationInfo.query.filter(
                and_(
                    PatientRegistrationInfo.name==name,
                    PatientRegistrationInfo.family==family,
                    PatientRegistrationInfo.father==father
                )
            ).first()
            if available_edit:
                available_edit.name=name,
                available_edit.family=family,
                available_edit.father=father,
                available_edit.dob=dob_formatted,
                available_edit.phone=final_phone,
                available_edit.gender = gender,
                available_edit.email=email,
                available_edit.allergy=allergy,
                available_edit.clinic_name=clinic_name
                db.session.commit()
                return jsonify({'message':'Successfully Edited','status': 201})
            else:
                return add_new_patient(name, father, family, dob_formatted,
                                       final_phone, gender, email, allergy, clinic_name)

        return jsonify({'message': 'Cannot Be Registered! Already Registered', 'status': 401})


def addPayload(phone,first_name,doctor_name,clinic_name,date_formatted,formatted_time,clinic_phone_number):
    message="booking_reminder"
    payload={
        "messaging_product":"whatsapp",
        "to":phone,
        "type":"template",
        "template":{
            "name":message,
            "language":{"code":"en_US"},
            "components":[
                {
                    "type":"body",
                    "parameters":[
                        {"type":"text","parameter_name":"first_name","text":first_name},
                        {"type":"text","parameter_name":"doctor_name","text":doctor_name},
                        {"type":"text","parameter_name":"clinic_name","text":clinic_name},
                        {"type":"text","parameter_name":"date","text":date_formatted},
                        {"type":"text","parameter_name":"time","text":formatted_time},
                        {"type":"text","parameter_name":"clinic_phone_number","text":clinic_phone_number},
                        {"type":"text","parameter_name":"clinic","text":clinic_name}

                    ]
                }
            ]
        }
    }
    return payload
@main.route('/encounter', methods=['GET', 'POST'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR,Config.ASSISTANT,Config.NURSE])
def encounter(current_user):
    if request.method == 'POST':
        user_id = current_user["user_id"]
        data = request.json
        encounter_id = data.get('eventId')
        eventIdAtDelete = data.get('eventIdAtDelete')
        booking_reminder=data.get("booking-reminder")
        logged_in_user = User.query.filter_by(id=user_id).first()

        if not logged_in_user:
            return jsonify({'message': 'User not found'}), 404

        if eventIdAtDelete:
            row_to_delete = BookingEncounter.query.filter_by(encounter_id=eventIdAtDelete).first()
            if row_to_delete:
                db.session.delete(row_to_delete)
                db.session.commit()
                return jsonify({'message': 'Event Deleted', 'status': 'deleted'})
            else:
                return jsonify({'message': 'Not found', 'status': 'not found'})

        first_name = data.get('name')
        family = data.get('family')
        dob = data.get('dob')
        dob_datetime = datetime.strptime(dob, "%Y-%m-%d")
        dob_formatted = dob_datetime.strftime("%d-%B-%Y")
        phone = data.get('phone')
        date = data.get('date')
        print("data",date)
        date_obj = datetime.strptime(date,"%Y-%m-%d")
        date_formatted=date_obj.strftime("%Y-%b-%d")
        # start time is used to add the time on the booking modal
        time = data.get('start')
        end_time = data.get('end')
        # when i modify the booking slot by editing time, i am receving time without sec ..like this 10:00 but when i drag and drop the booking slot... time is 10:00:00 which is correct
        if len(time.split(':'))==2:
            time=time +":00"
        if len(end_time.split(':'))==2:
            end_time=end_time + ":00"
        time_obj = datetime.strptime(time,"%H:%M:%S")
        formatted_time = time_obj.strftime("%I:%M %p")


        if date is not None:
            constructed_start_time = date + "T" + time + "+03:00"
            print("constructed start time",constructed_start_time)
            constructed_end_time = date + 'T' + end_time + "+03:00"
            print("constructed end time",constructed_end_time)
        else:
            constructed_start_time = ""
            constructed_end_time = ""

        procedure = data.get('proc')
        doctor_id = data.get('resourceId')
        get_clinic_phone_number = User.query.filter_by(id=doctor_id).first()
        clinic_phone_number = get_clinic_phone_number.phone
        doctor_name = data.get('doctor')
        booking_confirmation = data.get('booking-reminder')

        clinic_name = logged_in_user.clinicName

        # check if the encounter already exist
        encounter_div = BookingEncounter.query.filter(
            and_(
                BookingEncounter.visit_date == date,
                BookingEncounter.start_time == constructed_start_time,
                BookingEncounter.end_time == constructed_end_time,
                BookingEncounter.patient_name == first_name,
                BookingEncounter.patient_family_name == family,
                BookingEncounter.phone == phone,
                BookingEncounter.doctor_id == doctor_id,
                BookingEncounter.booking_confirmation == booking_confirmation
            )
        ).first()

        patient = PatientRegistrationInfo.query.filter(
            and_(
                PatientRegistrationInfo.dob == dob_formatted,
                PatientRegistrationInfo.name == first_name,
                PatientRegistrationInfo.family == family,
                PatientRegistrationInfo.phone == phone
            )
        ).first()

        encounter_div_id = BookingEncounter.query.filter_by(encounter_id=encounter_id).first()

        if patient:
            # encounter is already available in our database
            if encounter_div_id:
                if encounter_div:
                    return jsonify({'message': 'No changes in Appointment data', 'status': 'invalid'})
                else:
                    if booking_reminder:
                        addWhatsAppPayload = addPayload(phone, first_name, doctor_name, clinic_name, date_formatted,
                                                        formatted_time, clinic_phone_number)
                        send_whatsapp_messages.delay(addWhatsAppPayload)
                        notification_sent = True
                    else:
                        notification_sent= False

                    BookingEncounter.query.filter_by(encounter_id=encounter_id).delete()
                    db.session.commit()
                    add_new_encounter(patient.id,
                                      encounter_id,
                                      date,
                                      constructed_start_time,
                                      constructed_end_time,
                                      first_name,
                                      family,
                                      phone,
                                      procedure,
                                      doctor_id,
                                      doctor_name,
                                      booking_confirmation,
                                      dob,
                                      user_id,
                                      clinic_name,
                                      notification_sent)

            # first time encounter in our database
            else:
                if booking_reminder:
                    addWhatsAppPayload = addPayload(phone,first_name,doctor_name,clinic_name,date_formatted,formatted_time,clinic_phone_number)
                    send_whatsapp_messages.delay(addWhatsAppPayload)
                    notification_sent = True
                else:
                    notification_sent = False

                add_new_encounter(patient.id,
                                  encounter_id,
                                  date,
                                  constructed_start_time,
                                  constructed_end_time,
                                  first_name,
                                  family,
                                  phone,
                                  procedure,
                                  doctor_id,
                                  doctor_name,
                                  booking_confirmation,
                                  dob,
                                  user_id,
                                  clinic_name,
                                  notification_sent)
            # first response that come quickly to front end changing color to green in case whatsapp is sent
            response = {
                'start': constructed_start_time,
                'end': constructed_end_time,
                'name': first_name,
                'family': family,
                'id': encounter_id,
                'extendedProps':{
                    'procedure':procedure,
                    'isBookingWhatsappSent':notification_sent
                },
                'dob': dob,
                'phone': phone,
                'doctor':doctor_name,
                'visit_date':date,
                'resourceId': doctor_id
            }
            print("response",response)
            return jsonify(response)
        return jsonify({'message': 'Patient Not registered !', 'status': 'invalid'}), 403
    return jsonify({'message': 'Invalid submission', 'status': 'invalid'})

def add_new_encounter(patient_id,
                      encounter_id,
                      date,
                      constructed_start_time,
                      constructed_end_time,
                      name,
                      family,
                      phone,
                      procedure,
                      doctor_id,
                      doctor_name,
                      booking_confirmation,
                      dob,
                      user_id,
                      clinic_name,
                      notification_sent):
    new_encounter = BookingEncounter(
        patient_id=patient_id,
        encounter_id=encounter_id,
        visit_date=date,
        start_time=constructed_start_time,
        end_time=constructed_end_time,
        patient_name=name,
        patient_family_name=family,
        phone=phone,
        procedure=procedure,
        doctor_id=doctor_id,
        doctor_name=doctor_name,
        booking_confirmation=booking_confirmation,
        dob=dob,
        user_id=user_id,
        clinic_name=clinic_name,
        whatsapp_booking=notification_sent
    )
    db.session.add(new_encounter)
    db.session.commit()

@main.route('/get_doctors', methods=['GET','POST'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR,Config.ASSISTANT,Config.NURSE,Config.SYSTEMADMIN])
def get_doctors(current_user):
    user_id = current_user["user_id"]
    user_role = current_user["role"]
    user = User.query.filter_by(id=user_id).first()

    if user:
        if user_role in [Config.DOCTOR]:
            return jsonify({'name': user.name, "family": user.family, "id": user.id})
        elif user_role == Config.NURSE:
            mapped_doctor_id = user.doctor_id
            dr_id = User.query.filter_by(id=mapped_doctor_id).first()
            if dr_id.status == ACTIVE:
                return jsonify({"name": dr_id.name, "family": dr_id.family, "id": dr_id.id})
            else:
                return jsonify({"message": "Dr is Inactive"}), 201
        elif user_role == Config.SYSTEMADMIN:
            all_doctors=User.query.filter_by(role=Config.SYSTEMADMIN).all()
            doctors_list=[{"name":i.name,"family":i.family,"id":i.id} for i in all_doctors if i.status==ACTIVE]
            return jsonify(doctors_list)

        else:
            clinic_name = user.clinicName
            all_rows = User.query.filter_by(clinicName=clinic_name).all()
            doctors_list = [{"name": i.name, "family": i.family, "id": i.id} for
                            i in all_rows if i.role == Config.DOCTOR]
            return jsonify(doctors_list)


def get_encounters(encounters_data, all_doctor_encounters):
    for encounter in all_doctor_encounters:
        encounters_data.append({
            'start': encounter.start_time,
            'end': encounter.end_time,
            'id': encounter.encounter_id,
            'dob': encounter.dob,
            'phone': encounter.phone,
            "name": encounter.patient_name,
            "family": encounter.patient_family_name,
            "doctor": encounter.doctor_name,
            "visit_date": encounter.visit_date,
            "resourceId": encounter.doctor_id,
            'extendedProps':{
                'procedure':encounter.procedure,
                'isBookingWhatsappSent':encounter.whatsapp_booking,
                'isAppointmentWhatsappSent':encounter.whatsapp_appointment

            }
        })
    return encounters_data


# no need to add @rolesrequired in getAllEvents, there is already role based control access within the code
@main.route('/getAllEvents', methods=['GET', 'POST'])
@token_required
def getAllEvents(current_user):
    if request.method == 'GET':
        user_logged_in = current_user["user_id"]
        user_role = current_user["role"]
        logged_in_user = User.query.filter_by(id=user_logged_in).first()

        if not logged_in_user:
            return jsonify({'message': 'User not found'}), 404

        clinic_name = logged_in_user.clinicName

        # if the user logged in is a doctor, the doctor will see his patients only
        # who are booked by anyone (nurse, assistant,himself)
        if user_role in [Config.DOCTOR]:
            doctor_id = logged_in_user.id
            all_doctor_encounters = BookingEncounter.query.filter_by(doctor_id=doctor_id).all()
            encounters_data = []
            get_encounters(encounters_data, all_doctor_encounters)
            print("encounters_data",encounters_data)
            return jsonify(encounters_data)
        # if the user logged in is a nurse, go check this nurse is mapped to which doctor
        # and get all the encounters of that doctor
        elif user_role in [Config.NURSE]:
            doctor_mapped_id = logged_in_user.doctor_id
            all_doctor_encounters = BookingEncounter.query.filter_by(doctor_id=doctor_mapped_id).all()
            encounters_data = []
            get_encounters(encounters_data, all_doctor_encounters)
            return jsonify(encounters_data)

        # if the user logged in is an admin or a clinic assistant, show all encounters for the whole clinic
        all_events = BookingEncounter.query.filter_by(clinic_name=clinic_name).all()
        result_data = []
        get_encounters(result_data, all_events)
        return jsonify(result_data)
    else:
        return jsonify({'message': 'Error in getting the events to calendar'}), 500

@main.route('/getPendingBills',methods=['GET'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR,Config.ASSISTANT,Config.NURSE])
def getPendingBills(current_user):
    if request.method == 'GET':
        user_id=current_user["user_id"]
        user = User.query.filter_by(id=user_id).first()
        clinic_name=user.clinicName

        # Only show pending balances for completed treatments and not in process
        all_pending_bills=TreatmentEncounter.query.filter(and_(
            TreatmentEncounter.clinicName == clinic_name,
            TreatmentEncounter.remainingBalance>0,
            TreatmentEncounter.status == COMPLETED
        )).all()
        bills_list=[]
        for bill in all_pending_bills:
            patient=PatientRegistrationInfo.query.filter_by(id=bill.patientId).first()
            patient_full_name=f"{patient.name} {patient.father} {patient.family}"
            patient_phone_number = patient.phone

            bill_info={
                "encounter_date":bill.statusDate.strftime("%d-%B-%Y") if bill.statusDate else None,
                "patient_name":patient_full_name,
                "phone_number":patient_phone_number,
                "outstanding_balance": "$" + " " + str(bill.remainingBalance),
                "encounter_id":bill.id
            }
            bills_list.append(bill_info)
        return jsonify(bills_list)

@main.route('/getCurrentBills',methods=['GET'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR,Config.ASSISTANT,Config.NURSE])
def getCurrentBills(current_user):
    if request.method == 'GET':
        user_id = current_user["user_id"]
        user = User.query.filter_by(id=user_id).first()
        clinic_name = user.clinicName
        # patients to be seen in clinic for payment are todays patients only
        today = datetime.today().strftime('%Y-%m-%d')
        bill_details = []
        patient_balances ={}

        # patient waiting to pay at the reception
        findTodayBills = TreatmentEncounter.query.filter(
            and_(
                TreatmentEncounter.clinicName == clinic_name,
                TreatmentEncounter.statusDate == today,
                TreatmentEncounter.status != TREATMENT_PLAN,
                or_(
                    TreatmentEncounter.patient_disposition.is_(None),
                    TreatmentEncounter.patient_disposition != DISCHARGED
                )
            )

        ).all()

        # for those waiting to pay, get their outstanding balance from previous visits
        for todaysBills in findTodayBills:
            patient_id = todaysBills.patientId
            if patient_id:
                outstanding_bills = TreatmentEncounter.query.filter(
                    and_(
                        TreatmentEncounter.statusDate != today,
                        TreatmentEncounter.status != TREATMENT_PLAN,
                        TreatmentEncounter.patient_disposition == DISCHARGED,
                        TreatmentEncounter.patientId==patient_id
                    )
                ).all()
                for bill in outstanding_bills:
                    if patient_id not in patient_balances:
                        patient_balances[patient_id]=0
                    patient_balances[patient_id] += float(bill.remainingBalance or 0)

        # send info to frontend
        for bill in findTodayBills:
            patient = PatientRegistrationInfo.query.filter_by(id=bill.patientId).first()
            if patient:
                patient_id = bill.patientId
                total_remaining_balance = patient_balances.get(patient_id,0)
                patient_name = patient.name
                patient_father = patient.father
                patient_family = patient.family
                patient_dob = patient.dob
                patient_phone = patient.phone
                bill_id = bill.id
                formatted_date = bill.statusDate.strftime("%d %b %Y")
                bill_details.append({
                    'name': patient_name,
                    'father': patient_father,
                    'family': patient_family,
                    'dob': patient_dob,
                    'phone': patient_phone,
                    'date': formatted_date,
                    'id': bill_id,
                    'patientId': bill.patientId,
                    'photo':patient.patient_image,
                    'total_remaining_balance':total_remaining_balance
                })
        print("bill details",bill_details)
        return jsonify(bill_details)

@main.route('/get-bill', methods=['GET', 'POST'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR,Config.ASSISTANT,Config.NURSE])
def getBill(current_user):
    if request.method == 'POST':
        data = request.json
        patientId = data.get('patientId')

        findPatientInfo = PatientRegistrationInfo.query.filter_by(id=patientId).first()
        patientName = findPatientInfo.name
        familyName = findPatientInfo.family
        fatherName = findPatientInfo.father
        phone = findPatientInfo.phone
        today = datetime.today().strftime("%Y-%m-%d")

        # i am keeping the bills for that specific patient ID which does not include treatment plan status
        # and has a remaining balance > 0 and has a discount of 100%, patient should see the discount if 100%,
        # but if the discount is provided in previous dates it won't show in today's bill , only previous bills
        # with outstanding balances will show
        findBill = TreatmentEncounter.query.filter(
            TreatmentEncounter.patientId == patientId,
            TreatmentEncounter.status != TREATMENT_PLAN,
            TreatmentEncounter.statusDate == today
        ).order_by(desc(TreatmentEncounter.billSequenceNumber)).all()
        bill_details = []

        for bill in findBill:
            formatted_date = bill.statusDate.strftime("%d %b %Y")
            paidAmount = float(bill.amountPaid) if bill.amountPaid is not None else 0.0
            priceNet = float(bill.netPrice) if bill.netPrice is not None else 0.0
            remainingBalance = float(bill.remainingBalance) if bill.remainingBalance is not None else 0.0
            bill_details.append({
                'discount': bill.discount,
                'billNumber': bill.billSequenceNumber,
                'fees': bill.fees,
                'netPrice': priceNet,
                'date': formatted_date,
                'toothNumber': bill.toothNumber,
                'procedure': bill.procedure,
                'id': bill.id,
                'remainingBalance': remainingBalance,
                'previousPayment': paidAmount,
                'name': patientName,
                'family': familyName,
                'father': fatherName,
                'phone': phone,
                'doctor': bill.provider,
                'status': bill.status,
                'notes': bill.notes
            })
        return jsonify(bill_details)


@main.route("/store_reminders",methods=['GET','POST'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR,Config.ASSISTANT,Config.NURSE])
def store_reminders(current_user):
    if request.method == 'POST':
        data = request.json
        user_id=current_user['user_id']
        clinic = User.query.filter_by(id=user_id).first()
        clinic_name=clinic.clinicName
        get_clinic_phone=User.query.filter(and_(
            User.clinicName==clinic_name,
            User.role==os.getenv('DOCTOR')

        )).first()
        clinic_phone=get_clinic_phone.phone
        date = datetime.today().date()

        # in case i want to deactivate the reminder
        deactivate = data.get("deactivate")
        deactivate_reminder_data={}

        # in case i want to add reminder/s
        processed_data ={}
        if deactivate is None:
            for key, value in data.items():
                element_name=key.split('-',1)[0]
                processed_data[element_name]=value
            name=processed_data['name']
            print("name",name)
            doctor=processed_data['doctor']
            phone=processed_data['phone']
            proc=processed_data['proc']
            patientId=processed_data['patient']
            get_patient_first_name = PatientRegistrationInfo.query.filter_by(id=patientId).first()
            patient_first_name = get_patient_first_name.name
            reminder=processed_data['reminder']

            if reminder == os.getenv('REMINDER1'):
                # reminder 1 is previously sent, cannot send it again
                check_reminder = ReminderSent.query.filter_by(patientId=patientId).first()
                if check_reminder and check_reminder.reminder_one_date is not None:
                    return jsonify({'message':'Reminder 1 was previously sent,cannot send it twice'}),400
                # reminder 1 is not sent yet, you can send it now
                reminder_one_date = date
                reminder_sent = ReminderSent(
                    name=name,
                    doctor=doctor,
                    phone=phone,
                    proc=proc,
                    reminder_one_date=reminder_one_date,
                    patientId=patientId,
                    clinic_name=clinic_name
                )
                db.session.add(reminder_sent)
                db.session.commit()
                message = "cleaning_teeth_reminder"
                payload = {
                    "messaging_product": "whatsapp",
                    "to": phone,
                    "type": "template",
                    "template": {
                        "name": message,
                        "language": {"code": "en_US"},
                        "components": [
                            {
                                "type": "body",
                                "parameters": [
                                    {"type": "text", "parameter_name": "patient", "text": patient_first_name},
                                    {"type": "text", "parameter_name": "clinic_name", "text": clinic_name},
                                    {"type": "text", "parameter_name": "clinic_phone_number", "text": clinic_phone},
                                    {"type": "text", "parameter_name": "clinic", "text": clinic_name}

                                ]
                            }
                        ]
                    }
                }
                send_whatsapp_messages.delay(payload)
                return jsonify({'message': 'Reminder 1 is sent succesfully!'}), 200

            elif reminder == os.getenv('REMINDER2'):
                get_patient = ReminderSent.query.filter_by(patientId=patientId).first()
                # reminder 1 and reminder 2 are previously sent. cannot send reminder 2 again
                if (get_patient and
                        get_patient.reminder_one_date is not None and
                        get_patient.reminder_two_date is not None):
                    return jsonify({'message':'Reminder 2 was previously sent!, cannot send it twice'}),400

                # reminder 1 previously sent and reminder 2 is not sent yet
                elif (get_patient and
                      get_patient.reminder_one_date is not None and
                      get_patient.reminder_two_date is None):
                    reminder_one = get_patient.reminder_one_date
                    reminder_two = date
                    get_patient.patientId = patientId,
                    get_patient.name=name,
                    get_patient.doctor=doctor,
                    get_patient.phone=phone,
                    get_patient.proc=proc,
                    get_patient.reminder_one_date=reminder_one,
                    get_patient.reminder_two_date=reminder_two
                    db.session.commit()
                    message = "cleaning_teeth_reminder"
                    payload = {
                        "messaging_product": "whatsapp",
                        "to": phone,
                        "type": "template",
                        "template": {
                            "name": message,
                            "language": {"code": "en_US"},
                            "components": [
                                {
                                    "type": "body",
                                    "parameters": [
                                        {"type": "text", "parameter_name": "patient", "text": patient_first_name},
                                        {"type": "text", "parameter_name": "clinic_name", "text": clinic_name},
                                        {"type": "text", "parameter_name": "clinic_phone_number", "text": clinic_phone},
                                        {"type": "text", "parameter_name": "clinic", "text": clinic_name}

                                    ]
                                }
                            ]
                        }
                    }
                    send_whatsapp_messages.delay(payload)
                    return jsonify({'message':'Reminder 2 is successfuly sent !'}),200

                # reminder 1 is not sent and i am sending reminder 2 . do not allow --- should send first reminder 1
                else :
                    return jsonify({'message':'Reminder 1 must be sent first !'}),400
            else:
                return jsonify({'message':'Incorrect Reminders'}),400
        elif deactivate == os.getenv('DEACTIVATE_REMINDER'):
            for key, value in data.items():
                element=key.split('-',1)[0]
                deactivate_reminder_data[element]=value
            patientId=deactivate_reminder_data['patient']
            get_patient=ReminderSent.query.filter_by(patientId=patientId).first()
            # reminder is already available, i want to extract that reminder and i want to deactivate it
            if get_patient:
                get_patient.deactivate_reminder=True
                db.session.commit()
                return jsonify({'message':'Reminders are disabled !'})
            # reminder is not available and i need to add the reminder with deactivated status
            name = deactivate_reminder_data['name']
            doctor = deactivate_reminder_data['doctor']
            phone = deactivate_reminder_data['phone']
            proc = deactivate_reminder_data['proc']
            patientId = deactivate_reminder_data['patient']
            deactivate_reminder = True
            deact_reminder = ReminderSent(
                name=name,
                doctor=doctor,
                phone=phone,
                proc=proc,
                patientId=patientId,
                deactivate_reminder=deactivate_reminder
            )
            db.session.add(deact_reminder)
            db.session.commit()
            return jsonify({'message': 'Reminders deactivated !'}), 400
        return jsonify({'message':'Incorrect request'}),401
    return jsonify({'message':'Incorrect method !'})

@main.route('/get_reminders',methods=['GET'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR,Config.ASSISTANT,Config.NURSE])
def get_reminders(current_user):
    if request.method == 'GET':
        user = current_user['user_id']
        print("user",user)
        clinic = User.query.filter_by(id=user).first()
        print("clinic",clinic)
        clinic_name= clinic.clinicName
        print("clinic name",clinic_name)
        today_date = datetime.today().date()
        print("today date",today_date)
        one_months_ago = today_date - timedelta(days=1*30)
        three_months_ago = today_date - timedelta(days=3 * 30)
        six_months_ago = today_date - timedelta(days=6*30)
        treatments_reminders=[]
        print("treatment reminders")

        #Query all patients the clinic has treated
        patients = db.session.query(TreatmentEncounter.patientId).filter_by(clinicName=clinic_name).distinct().all()
        print("patients",patients)
        # Loop through each patient
        for patient_id in patients:
            # Get the most recent treatment encounter for the patient
            last_treatment = TreatmentEncounter.query.filter_by(patientId=patient_id[0],clinicName=clinic_name)\
            .order_by(TreatmentEncounter.statusDate.desc()).first()

            if not last_treatment:
                continue

            #check if i already sent a reminder to this patient and get me reminder row
            reminder = ReminderSent.query.filter_by(patientId=last_treatment.patientId).first()
            reminder_status = False
            if reminder:
                reminder_status = reminder.deactivate_reminder
                first_reminder_date=reminder.reminder_one_date
                if reminder.reminder_one_date:
                    formatted_date_reminder_one = reminder.reminder_one_date.strftime("%d-%B-%Y")
                else:
                    formatted_date_reminder_one = None

                second_reminder_date = reminder.reminder_two_date
                if reminder.reminder_two_date:
                    formatted_date_reminder_two=reminder.reminder_two_date.strftime("%d-%B-%Y")
                else:
                    formatted_date_reminder_two = None

            else:
                first_reminder_date = None
                second_reminder_date=None

            reminder_procedure = None
            # the below code addersses 3 scenarios :
            # scenario 1 : last treatment date exceeded 6 months + 30 + 90 days are none, reminder row will appear
            #scenario 2 : last treatment date exceeded 6 months and reminder 1 exceeded 30 days from when it was sent or reminder 1 None, reminder will re-appear
            # scenario 3: last treatment date > 6 months and reminder 1 exceeded 30 days from when it was sent or None,
            # and reminder 2 exceeded 90 days from when it wa sent or None
            if (last_treatment.statusDate <= six_months_ago
                        and (first_reminder_date is None or first_reminder_date <= one_months_ago)
            and(second_reminder_date is None or second_reminder_date <= three_months_ago)
            and reminder_status is False
            ):
                reminder_procedure = os.getenv('REMINDER_PROCEDURE')

            if reminder_procedure:
                patient = last_treatment.patient
                treatments_reminders.append({
                    'name': patient.name,
                    'father':patient.father,
                    'family':patient.family,
                    'phone':patient.phone,
                    'patientId': patient.id,
                    'procedure':reminder_procedure,
                    'last_visit':last_treatment.statusDate,
                    'doctor':last_treatment.provider,
                    'reminder_one_date':formatted_date_reminder_one if reminder else None,
                    'reminder_two_date':formatted_date_reminder_two if reminder else None
                })
        if treatments_reminders:
            return jsonify(treatments_reminders),200
        else:
            return jsonify({'message':'No Available Reminders !'}),201
    else:
        return jsonify({'message':'Incorrect method'}),400

def calculate_discount(fees,discount):
    fees=float(fees)
    discount=float(discount)
    if discount == 0:
        return "$0.00"
    elif discount >0:
        discounted_amount = fees * discount
        return f"$ {discounted_amount:.2f}"
    else:
        return "$0.00"



@main.route('/treatment-plan', methods=['GET', 'POST'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR,Config.ASSISTANT,Config.NURSE])
def treatmentPlan(current_user):
    if request.method == 'POST':
        user_id = current_user["user_id"]
        user_name = current_user["user_name"]
        user = User.query.filter_by(id=user_id).first()
        clinic_name = user.clinicName

        try:
            data = request.json
            patientId = data.get('hiddenId') # when the doctor is saving the treatment plan
            clinicName = clinic_name
            procedures = data.get('procedureDescription', [])
            fees =[fee.replace('$','') for fee in data.get('procedureFee',[])]
            toothNumber = data.get('toothNumber', [])
            treatmentStatus = data.get('status', [])
            statusDate = data.get('date',[])
            print("status date",statusDate)
            notes = data.get('notes', [])
            provider = data.get('doctor')
            discount = data.get('discount', [])
            billID = data.get('billID', [])
            payment = data.get('amountPaid')
            write_off = data.get('writeoff',0.0)
            patient_disposition=data.get('disposition',[])
            print_only=data.get('print_only')

            # sequential bill number by clinicName
            unique_encounters = db.session.query(
                func.count(TreatmentEncounter.id),
                TreatmentEncounter.statusDate,
                TreatmentEncounter.clinicName,
                TreatmentEncounter.patientId,
            ).filter(
                TreatmentEncounter.clinicName == clinic_name
            ).group_by(
                TreatmentEncounter.statusDate,
                TreatmentEncounter.clinicName,
                TreatmentEncounter.patientId,
            ).all()

            unique_encounter_count = len(unique_encounters)
            next_bill_number = unique_encounter_count + 1

            # when the patient is paying (step 2)
            if billID:
                total_amount_paid = float(payment)
                remaining_amount = total_amount_paid
                excess_payment = 0.0

                write_off_amount = float(write_off)
                remaining_write_off = write_off_amount
                excess_write_off = 0.0

                # payment of cash is first step , after cash is consumed, we check if there is write off
                for i in range(len(billID)):
                    findBill = TreatmentEncounter.query.filter_by(id=billID[i]).first()

                    prevAmountPaid = findBill.amountPaid if findBill.amountPaid is not None else 0.0

                    if findBill:
                        net_bill = float(findBill.netPrice)
                        if remaining_amount >= net_bill:
                            findBill.amountPaid = net_bill if net_bill is not None else 0.0
                            remaining_amount -= (net_bill -float(prevAmountPaid))
                        else:

                            findBill.amountPaid = remaining_amount + float(prevAmountPaid)

                            if findBill.amountPaid >= net_bill:
                                excess_payment += findBill.amountPaid - net_bill
                                findBill.amountPaid = net_bill
                                remaining_amount -= (net_bill - float(prevAmountPaid))
                            else:
                                # meaning there is nothing left from the previous payment to use it
                                # in future payment so the remaining amount is Zero
                                remaining_amount = 0
                        findBill.remainingBalance = max(0.0, net_bill - findBill.amountPaid)
                        findBill.patient_disposition = patient_disposition[i] if i < len(patient_disposition) else None
                        db.session.commit()

                # check for write off entries
                for i in range(len(billID)):
                    findBill = TreatmentEncounter.query.filter_by(id=billID[i]).first()
                    if findBill:
                        net_bill = float(findBill.netPrice)
                        paid = float(findBill.amountPaid)
                        written_off = float(findBill.writeOff) if findBill.writeOff is not None else 0.0
                        prevRemainingBalance = net_bill - paid - written_off

                        if findBill.remainingBalance > 0:
                            if remaining_write_off >=0:
                                if remaining_write_off >= float(prevRemainingBalance):
                                    findBill.writeOff = net_bill - paid
                                    remaining_write_off = remaining_write_off - float(prevRemainingBalance)
                                else:
                                    findBill.writeOff = remaining_write_off + written_off
                                    remaining_write_off = 0

                                findBill.remainingBalance = max(0.0, net_bill - float(findBill.amountPaid) - float(findBill.writeOff))
                                db.session.commit()
                            else:
                                break


                # SEND RECEIPT BY EMAIL FOR current patients and for old patients
                patient_id=data.get("patient_id")
                if patient_id is not None and print_only != PRINT:
                    patient = PatientRegistrationInfo.query.filter_by(id=patient_id).first()
                    patient_email = patient.email
                    patient_name = patient.name + " " + patient.family
                    clinic_name = patient.clinic_name

                    bill_details=[]

                    for i in range(len(billID)):
                        treatment_encounter = TreatmentEncounter.query.filter_by(id=billID[i]).first()
                        encounter_date = treatment_encounter.statusDate
                        date = encounter_date.strftime("%d-%B-%Y")
                        try:
                            receipt_content={
                                'date': date,
                                'procedure': treatment_encounter.procedure,
                                'tooth_number':treatment_encounter.toothNumber,
                                'fees': f"$ {treatment_encounter.fees or 0:.2f}",
                                'discount':calculate_discount(treatment_encounter.fees,treatment_encounter.discount),
                                'net_price':f"$ {treatment_encounter.netPrice or 0:.2f}",
                                'amount_paid':f"$ {treatment_encounter.amountPaid or 0:.2f}",
                                'remaining_balance':f"$ {treatment_encounter.remainingBalance or 0:.2f}",


                            }
                            bill_details.append(receipt_content)
                        except Exception as e:
                            print(f"Error generating receipt content :{str(e)}")

                    email_content ={
                        'patient_name':patient_name,
                        'bill_details':bill_details,
                        'clinic_name':clinic_name,
                        'doctor_name':provider,
                        'receipt_number':next_bill_number,
                        'total_amount_paid':payment,
                        'visit_date': 'N/A',
                        'total_net_amount':'N/A'
                    }
                    subject=f"{clinic_name} - Receipt"
                    send_email_via_gmail.delay(email=patient_email,token=None,
                                               subject=subject,path=None,text='',
                                               email_content=email_content)



            # when the doctor is saving the treatment (step 1)
            for i in range(len(procedures)):
                fee = fees[i] if i < len(fees) else 0
                discount_amount = discount[i] if i < len(discount) else 0
                netPrice = int(fee) * (1 - float(discount_amount))
                amountPaid = 0
                writeOff = 0
                remainingBalance = netPrice - amountPaid

                treatment = TreatmentEncounter(
                    patientId=patientId,
                    userId=user_id,
                    clinicName=clinicName,
                    procedure=procedures[i] if i < len(procedures) else None,
                    fees=fee,
                    toothNumber=toothNumber[i] if i < len(toothNumber) else None,
                    status=treatmentStatus[i] if i < len(treatmentStatus) else None,
                    statusDate=statusDate[i] if i < len(statusDate) else None,
                    provider=user_name,
                    notes=notes[i] if i < len(notes) else None,
                    discount=discount_amount,
                    billSequenceNumber=next_bill_number,
                    netPrice=netPrice,
                    amountPaid=amountPaid,
                    writeOff=writeOff,
                    remainingBalance=remainingBalance
                )
                db.session.add(treatment)
            db.session.commit()

            return jsonify({'message': 'Successfully saved'}), 200
        except Exception as e:
            return jsonify({'message': str(e)}), 401
    else:
        return jsonify({'message': 'Error in backend'}), 500


@main.route('/alltreatEncounters', methods=['GET', 'POST'])
@token_required
@role_required([Config.DOCTOR,Config.ADMIN])
def alltreatEncounters(current_user):
    if request.method == 'GET':
        user_id=current_user["user_id"]
        user = User.query.filter_by(id=user_id).first()
        clinic_name=user.clinicName
        all_clinic_encounters=TreatmentEncounter.query.filter_by(clinicName=clinic_name).all()
        all_clinic_bills=[]
        for encounter in all_clinic_encounters:
            visit_date = encounter.statusDate
            encounter_data = visit_date.strftime("%d-%B-%Y")
            full_year = visit_date.strftime("%Y")
            full_month = visit_date.strftime("%B")
            fees = float(encounter.fees) if encounter.fees is not None else 0.0
            net_price = float(encounter.netPrice) if encounter.netPrice is not None else 0.0
            amount_paid = float(encounter.amountPaid) if encounter.amountPaid is not None else 0.0
            remaining_balance = float(encounter.remainingBalance) if encounter.remainingBalance is not None else 0.0
            write_off = float(encounter.writeOff) if encounter.writeOff is not None else 0.0

            clinic_bills={
                'procedure':encounter.procedure,
                'fees':fees,
                'visit_date':encounter_data,
                'doctor':encounter.provider,
                'net_price':net_price,
                'amount_paid':amount_paid,
                'remaining_balance':remaining_balance,
                'write_off':write_off,
                'year':full_year,
                'month':full_month
            }
            all_clinic_bills.append(clinic_bills)
        return jsonify(all_clinic_bills)


@main.route('/treatmentEmail',methods=['GET','POST'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR,Config.ASSISTANT,Config.NURSE])
def treatmentEmail(current_user):
    if request.method =="POST":
        data = request.json
        user_id=current_user['user_id']
        patient_name = data.get('name')
        patient_id=data.get('patient_id')
        email = PatientRegistrationInfo.query.filter_by(id=patient_id).first()
        user= User.query.filter_by(id=user_id).first()
        clinic_name=user.clinicName
        patient_email=email.email
        doctor_name=data.get('doctor')
        total_net_amount = data.get('net_amount')
        visit_date = data.get('encounter_date')
        procedures=data.get('proc_content',[])
        tooth_numbers=data.get('tooth_content',[])
        procedure_gross_price=data.get('fees_content',[])
        procedure_discount=data.get('discount_perc',[])
        procedure_net_price=data.get('price_content',[])

        bill_details=[]
        for i in range(len(procedures)):
            receipt_content={
                'procedure':procedures[i],
                'tooth_number':tooth_numbers[i],
                'fees':procedure_gross_price[i],
                'discount':procedure_discount[i],
                'net_price':procedure_net_price[i],
            }
            bill_details.append(receipt_content)
        email_content={
            'patient_name':patient_name,
            'bill_details':bill_details,
            'clinic_name':clinic_name,
            'doctor_name':doctor_name,
            'receipt_number': 'N/A',
            'total_amount_paid':'N/A',
            'visit_date':visit_date,
            'total_net_amount':total_net_amount,


        }
        subject =f"{clinic_name} - Treatment Plan"
        send_email_via_gmail.delay(email=patient_email,token=None,
                                   subject=subject,path=None,text='',
                                   email_content=email_content)

        return jsonify({"message":"Successfully Sent!"})

@main.route('/inventory', methods=['GET', 'POST'])
@token_required
@role_required([Config.ADMIN,Config.DOCTOR,Config.ASSISTANT,Config.NURSE])
def inventory(current_user):
    if request.method == 'POST':
        user_name = current_user["user_name"]
        data = request.json
        answer = data.get('equip')
        price = data.get('equipment-pricing')
        duration = data.get('equipment-duration')
        brand = data.get('brand-name')
        if answer == 'yes':
            expenses = Expenses(
                equipmentPrice=price,
                equipmentDuration=duration,
                equipmentBrand=brand,
                userName=user_name

            )
            db.session.add(expenses)
        db.session.commit()
        return jsonify({'message': 'valid', 'status': '200'})


@main.route('/logout', methods=['GET','POST'])
def logout():
    response = make_response(jsonify({'message': 'Logged out successfully'}))
    response.delete_cookie('token')
    return response

