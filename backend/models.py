from .extensions import db
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime
from werkzeug.security import generate_password_hash,check_password_hash
class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    clinicName = db.Column(db.String(255))
    role = db.Column(db.String(255))
    doctor_id=db.Column(db.String(255))
    name = db.Column(db.String(255))
    family = db.Column(db.String(255))
    father = db.Column(db.String(255))
    phone = db.Column(db.String(255))
    email = db.Column(db.String(255))
    hashed_password = db.Column(db.String(255))
    status = db.Column(db.String(255))
    @staticmethod
    def get(user_id):
        return User.query.get(user_id)

    def set_password(self,password):
        self.hashed_password=generate_password_hash(password)

    def check_password(self,password):
        return check_password_hash(self.hashed_password,password)

class UserFacebook(db.Model):
    __tablename__="userFacebook"
    id=db.Column(db.Integer,primary_key=True)
    user_id=db.Column(db.String(255))
    clinic_name=db.Column(db.String(255))
    wa_phone_number_id=db.Column(db.String(255))
    waba_id = db.Column(db.String(255))
    token_code=db.Column(db.Text)

class UserRole(db.Model):
    __tablename__ = "role"
    id=db.Column(db.Integer,primary_key=True)
    description=db.Column(db.String(255))



class Procedures(db.Model):
    __tablename__ = 'procedures'
    id = db.Column(db.Integer, primary_key=True)
    procedureDescription = db.Column(db.String(255))

class Diagnosis(db.Model):
    __tablename__ = "diagnosis"
    id=db.Column(db.Integer,primary_key=True)
    diagnosisDescription=db.Column(db.String(255))

class DiagnosisEncounters(db.Model):
    __tablename__ = "diagnosisEncounters"
    id=db.Column(db.Integer,primary_key=True)
    patient_id = db.Column(db.String(255))
    user_id = db.Column(db.String(255))
    clinic_name = db.Column(db.String(255))
    diagnosis_description = db.Column(db.String(255))
    tooth_number = db.Column(db.String(255))
    date= db.Column(db.Date())


class DiagnosisEncountersCopy(db.Model):
    __tablename__ = "diagnosisCopy"
    id=db.Column(db.Integer,primary_key=True)
    patient_id = db.Column(db.String(255))
    user_id = db.Column(db.String(255))
    clinic_name = db.Column(db.String(255))
    diagnosis_description = db.Column(db.String(255))
    tooth_number = db.Column(db.String(255))
    date= db.Column(db.Date())


class PriceList(db.Model):
    __tablename__ = "pricing"
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255))
    price = db.Column(db.Numeric())
    clinic_name=db.Column(db.String(255))
    user_id=db.Column(db.String(255))
    date=db.Column(db.Date())
    user_name=db.Column(db.String(255))

class ReminderSent(db.Model):
    __tablename__ = "reminders_sent"
    id = db.Column(db.Integer,primary_key=True)
    patientId=db.Column(db.String(255))
    name=db.Column(db.String(255))
    doctor=db.Column(db.String(255))
    clinic_name = db.Column(db.String(255))
    phone=db.Column(db.String(255))
    proc=db.Column(db.String(255))
    reminder_one_date=db.Column(db.Date())
    reminder_two_date = db.Column(db.Date())
    deactivate_reminder = db.Column(db.Boolean,default=False)


class TreatmentEncounter(db.Model):
    __tablename__ = 'treatmentencounter'
    id = db.Column(db.Integer, primary_key=True)
    patientId = db.Column(db.Integer,db.ForeignKey('patientInfo.id'))
    userId=db.Column(db.String(255))
    procedure = db.Column(db.String(255))
    fees = db.Column(db.Numeric())
    discount = db.Column(db.Float())
    toothNumber = db.Column(db.String(255))
    status = db.Column(db.String(255))
    statusDate = db.Column(db.Date())
    provider = db.Column(db.String(255))
    clinicName =db.Column(db.String(255))
    notes = db.Column(db.Text())
    billSequenceNumber = db.Column(db.String(255))
    netPrice = db.Column(db.Numeric())
    amountPaid = db.Column(db.Numeric())
    writeOff=db.Column(db.Numeric())
    remainingBalance = db.Column(db.Numeric())
    patient_disposition=db.Column(db.String(255))
    patient=db.relationship('PatientRegistrationInfo',back_populates="treatment_encounters")


class PatientRegistrationInfo(db.Model):
    __tablename__ = 'patientInfo'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    family = db.Column(db.String(255))
    father = db.Column(db.String(255))
    dob = db.Column(db.String(255))
    phone = db.Column(db.String(255))
    gender = db.Column(db.String(255))
    email = db.Column(db.String(255))
    allergy=db.Column(db.String(255))
    clinic_name=db.Column(db.String(255))
    patient_image=db.Column(db.String(255))
    treatment_encounters = db.relationship('TreatmentEncounter', back_populates='patient')
    patient_documents=db.relationship('PatientDocuments',back_populates='patient_docs')

class PatientDocuments(db.Model):
    __tablename__="patient_documents"
    id=db.Column(db.Integer,primary_key=True)
    patient_id=db.Column(db.Integer,db.ForeignKey('patientInfo.id'))
    file_path=db.Column(db.Text,nullable=False)
    document_type=db.Column(db.String(255))
    upload_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    uploaded_by=db.Column(db.String(255))
    clinic_name=db.Column(db.String(255))
    patient_docs=db.relationship('PatientRegistrationInfo',back_populates='patient_documents')

class BookingEncounter(db.Model):
    __tablename__ = 'bookingEncounter'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(255))
    encounter_id = db.Column(db.String(255))
    visit_date = db.Column(db.Date())
    start_time = db.Column(db.String(255))
    end_time = db.Column(db.String(255))
    patient_name = db.Column(db.String(255))
    patient_family_name = db.Column(db.String(255))
    dob = db.Column(db.String(255))
    phone = db.Column(db.String(255))
    procedure = db.Column(db.String(255))
    doctor_name = db.Column(db.String(255))
    doctor_id=db.Column(db.String(255))
    booking_confirmation = db.Column(db.String(255))
    user_id = db.Column(db.String(255))
    clinic_name = db.Column(db.String(255))
    whatsapp_booking=db.Column(db.Boolean,default=False)
    whatsapp_appointment = db.Column(db.Boolean, default=False)

class Expenses(db.Model):
    __tablename__ = "expenses"
    id = db.Column(db.Integer, primary_key=True)
    userName = db.Column(db.String(255))
    category = db.Column(db.String(255))
    description = db.Column(db.String(255))
    supplier = db.Column(db.String(255))
    cost = db.Column(db.String(255))
    invoiceNumber = db.Column(db.String(255))
    invoiceDate = db.Column(db.Date())
    equipmentPrice = db.Column(db.Numeric())
    equipmentDuration = db.Column(db.String(255))
    equipmentBrand = db.Column(db.String(255))


class RootCanal(db.Model):
    __tablename__ = "rootcanal"
    id = db.Column(db.Integer, primary_key=True)
    tooth_number = db.Column(db.String(255))
    tooth_path = db.Column(db.String(255))
    composite_circle=db.Column(db.String(255))

class Access(db.Model):
    __tablename__="access"
    id=db.Column(db.Integer,primary_key=True)
    clinic_name=db.Column(db.String(255))
    role=db.Column(db.String(255))
    register_patient=db.Column(db.Boolean,default=False)
    calendar = db.Column(db.Boolean,default=False)
    emr = db.Column(db.Boolean,default=False)
    diagnosis=db.Column(db.Boolean,default=False)
    past_history=db.Column(db.Boolean,default=False)
    treatment_plan = db.Column(db.Boolean,default=False)
    reports = db.Column(db.Boolean,default=False)
    bill_details=db.Column(db.Boolean,default=False)
    old_bill=db.Column(db.Boolean,default=False)
    old_bills = db.Column(db.Boolean, default=False)
    current_patients= db.Column(db.Boolean, default=False)
    expenses=db.Column(db.Boolean,default=False)
    stock = db.Column(db.Boolean,default=False)
    dashboard=db.Column(db.Boolean,default=False)
    main_admin=db.Column(db.Boolean,default=False)
    add_user=db.Column(db.Boolean,default=False)
    change_user_status=db.Column(db.Boolean,default=False)
    price_list=db.Column(db.Boolean,default=False)
    access_roles=db.Column(db.Boolean,default=False)

class SystemAdminAccess(db.Model):
    __tablename__="system_admin_access"
    id=db.Column(db.Integer,primary_key=True)
    user_id=db.Column(db.String(255))
    main_system_admin=db.Column(db.Boolean,default=False)
    add_system_admin=db.Column(db.Boolean,default=False)
    access_system_admin=db.Column(db.Boolean,default=False)
    add_clinic_user=db.Column(db.Boolean,default=False)
    add_sub_users=db.Column(db.Boolean,default=False)
    change_clinic_user_status=db.Column(db.Boolean,default=False)
    set_clinic_prices = db.Column(db.Boolean,default=False)
    clinic_access_roles=db.Column(db.Boolean,default=False)
    set_clinic_procedures=db.Column(db.Boolean,default=False)
    reset_user_password=db.Column(db.Boolean,default=False)










