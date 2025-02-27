import os
from flask import current_app
import requests
from .gmail_utils import get_gmail_service
from email.mime.text import MIMEText
from celery import shared_task
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
import io
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from .models import BookingEncounter, User
from datetime import datetime, timedelta
from sqlalchemy.sql import func
import logging
from .extensions import db
import boto3
import base64
from io import BytesIO
from PIL import Image
import pydicom
from pydicom.pixel_data_handlers.util import _apply_voi_lut
from pydicom.errors import InvalidDicomError


def generate_bill_pdf(email_content):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)

    # Page dimensions
    page_width, page_height = letter

    # Center the receipt title
    if(email_content.get('receipt_number')!='N/A'):
        title = "Receipt"
    else:
        title = "Treatment Plan"
    title_width = c.stringWidth(title, "Helvetica-Bold", 16)
    c.setFont("Helvetica-Bold", 16)
    c.drawString((page_width - title_width) / 2, page_height - 100,title)  # Adjusted vertical positioning

    # Align patient, clinic, and doctor names to the left
    c.setFont("Helvetica", 10)
    y_position = page_height - 140  # Slightly below the title
    c.drawString(50, y_position, f"Patient Name : {email_content['patient_name']}")
    c.drawString(50, y_position - 20, f"Clinic Name : {email_content['clinic_name']}")
    c.drawString(50, y_position - 40, f"Doctor : {email_content['doctor_name']}")

    if email_content.get('receipt_number') != 'N/A':
        c.drawString(50,y_position - 60, f"Receipt # : {email_content['receipt_number']}")
    if email_content.get('visit_date') != 'N/A':
        c.drawString(50, y_position - 60, f"Visit Date : {email_content['visit_date']}")


    include_date = any('date' in detail for detail in email_content['bill_details'])
    include_paid= any('amount_paid' in detail for detail in email_content['bill_details'])
    include_balance= any('remaining_balance' in detail for detail in email_content['bill_details'])

    # Table data
    table_header = [ 'Procedure', 'Tooth', 'Gross', 'Discount', 'Net']
    if include_date:
        table_header.insert(0,'Date')
    if include_paid:
        table_header.append('Paid')
    if include_balance:
        table_header.append('Balance')


    data = [table_header]
    for detail in email_content['bill_details']:
        row = [
            detail.get('procedure',''),
            detail.get('tooth_number',''),
            detail.get('fees',0),
            detail.get('discount',0),
            detail.get('net_price',0)
        ]
        if include_date:
            row.insert(0,detail.get('date',''))
        if include_paid:
            row.append(detail.get('amount_paid',0))
        if include_balance:
            row.append(detail.get('remaining_balance',0))
        data.append(row)


    # Create table
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor("#2a75bb")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 11),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    # Calculate table dimensions and center it
    table_width, table_height = table.wrap(0, 0)
    table_x = (page_width - table_width) / 2  # Center horizontally
    table_y = y_position - 100 - table_height  # Place below the header info
    # Draw table on canvas
    table.wrapOn(c, table_width, table_height)
    table.drawOn(c, table_x, table_y)

    # total amount paid
    total_amount_paid_y= table_y - 30
    c.setFont('Helvetica-Bold',12)
    # Text to display
    if email_content.get('total_amount_paid') != 'N/A':
        total_amount_text = f"Total Amount Paid is USD {email_content['total_amount_paid']}"
        # Calculate the width of the text
        text_width = c.stringWidth(total_amount_text, "Helvetica-Bold", 12)
        # Calculate the x-coordinate to center the text
        center_x = (page_width - text_width) / 2
        # Draw the text
        c.drawString(center_x, total_amount_paid_y, total_amount_text)

    if email_content.get('total_net_amount') != 'N/A':
        total_amount_text = f"Treatment Amount is {email_content['total_net_amount']}"
        # Calculate the width of the text
        text_width = c.stringWidth(total_amount_text, "Helvetica-Bold", 12)
        # Calculate the x-coordinate to center the text
        center_x = (page_width - text_width) / 2
        # Draw the text
        c.drawString(center_x, total_amount_paid_y, total_amount_text)
    # Save and return PDF
    c.save()
    buffer.seek(0)
    return buffer


# sending whatsapp automatically on day of appointment at 8 AM morning
@shared_task
def send_automatic_whatsapp_reminders():
    # Calculate tomorrow's date
    tomorrow_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    # Fetch appointments scheduled for tomorrow
    appointments = BookingEncounter.query.filter(
        func.date(BookingEncounter.visit_date) == tomorrow_date
    ).all()

    for appointment in appointments:
        start_time_str = appointment.start_time
        start_time_obj = datetime.fromisoformat(start_time_str)
        appointment_date = start_time_obj.date().strftime('%Y-%b-%d')
        formatted_time = start_time_obj.strftime('%I:%M %p')
        first_name = appointment.patient_name
        doctor_name = appointment.doctor_name
        doctor_id = appointment.doctor_id
        get_clinic_phone_number = User.query.filter_by(id=doctor_id).first()
        clinic_phone_number = get_clinic_phone_number.phone
        clinic_name= appointment.clinic_name
        phone=appointment.phone

        message = "appointment_reminder"
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
                            {"type": "text", "parameter_name": "first_name", "text": first_name},
                            {"type": "text", "parameter_name": "doctor_name", "text": doctor_name},
                            {"type": "text", "parameter_name": "clinic_name", "text": clinic_name},
                            {"type": "text", "parameter_name": "date", "text": appointment_date},
                            {"type": "text", "parameter_name": "time", "text": formatted_time},
                            {"type": "text", "parameter_name":"clinic_phone_number","text":clinic_phone_number},
                            {"type": "text", "parameter_name":"clinic","text":clinic_name}
                        ]
                    }
                ]
            }
        }
        send_whatsapp_messages(payload)
        # update the table showing whatsapp is sent
        notification_sent=True
        appointment.whatsapp_appointment=notification_sent
        db.session.commit()


@shared_task
def send_whatsapp_messages(payload):
    url='https://graph.facebook.com'+f"/{current_app.config['VERSION']}/{current_app.config['PHONE_NUMBER_ID']}/messages"

    headers={
        'Authorization':f"Bearer {current_app.config['ACCESS_TOKEN']}",
        'Content-Type':'application/json'
    }
    response = requests.post(url,json=payload,headers=headers)

    if response.status_code == 200:
        logging.info("Whatsapp sent sucessfully")
    else:
        logging.info(f"Failed to send message: {response.status_code} - {response.text}")

@shared_task
def onboardingBusinessCustomers(APP_ID,APP_SECRET,phone_number_id,waba_id,token_code):
    try:
        # step 1 exchange token code for a business token
        exchange_url = f"https://graph.facebook.com/{current_app.config['VERSION']}/oauth/access_token"
        exchange_params ={
            "client_id":APP_ID,
            "client_secret":APP_SECRET,
            "code":token_code
        }
        exchange_response = requests.get(exchange_url,params=exchange_params)
        exchange_data = exchange_response.json()
        print("EXCHANGE DATA",exchange_data)

        if "access_token" not in exchange_data:
            logging.error(f"Failed to exchange token:{exchange_data}")
            return False

        business_token = exchange_data["access_token"]
        print("business token",business_token)

        # step 2 subscribe app to client webhooks so he can send and receive message on my app
        subscribe_url = f"https://graph.facebook.com/{current_app.config['VERSION']}/{waba_id}/subscribed_apps"
        subscribe_headers ={'Authorization':f"Bearer {business_token}"}
        subscribe_response = requests.post(subscribe_url,headers=subscribe_headers)

        if subscribe_response.status_code != 200:
            logging.error(f"Failed to subscribe to webhooks:{subscribe_response.json()}")
            return False

        logging.info(f"Onboarding completed successfuly for waba_id {waba_id}")


        #step 3 share credit line with the customer using the system user access token and not the returned above token
        share_url = (f"https://graph.facebook.com/{current_app.config['VERSION']}/"
                     f"<EXTENDED_CREDIT_LINE_ID>/whatsapp_credit_sharing_and_attach?"
                     f"waba_currency=USD&waba_id={waba_id}")
        share_headers={'Authorization':f"Bearer {current_app.config['ACCESS_TOKEN']}"}

        subscribe_response=requests.post(share_url,headers=share_headers)
        print("subscribe response",subscribe_response)

        if subscribe_response.status_code !=200:
            logging.error(f"Failed to share credit line:{subscribe_response.text}")
            return False
        logging.info(f"Credit Line successfuly shared {subscribe_response.json()}")

        #step 4 register the customer phone number
        register_customer_phone = f"https://graph.facebook.com/{current_app.config['VERSION']}/{phone_number_id}/register"
        register_headers = {  # No trailing comma here
            'Content-Type': 'application/json',
            'Authorization': f"Bearer {business_token}"
        }
        payload = {
            "messaging_product": "whatsapp",
            "pin": "079878"
        }
        register_response = requests.post(register_customer_phone, headers=register_headers, json=payload)

        if register_response.status_code != 200:
            logging.error(f"Failed in registering customer phone number: {register_response.text}")
            return False
        logging.info(f"Registration of client phone number is successful: {register_response.text}")

    except requests.RequestException as e:
        logging.error(f"Error during Onboarding: {str(e)}")
        return False

@shared_task
def send_email_via_gmail(email, token,subject,path,text,email_content,*args,**kwargs):
    service = get_gmail_service()

    if token is not None and path is not None:
        try:
            domain = os.environ.get("DOMAIN")
            message = MIMEText(f'Please Confirm your {text} by clicking on the following link:\n{domain}/{path}/{token}')
            message['to'] = email
            message['from'] = os.environ.get('MAIL_USERNAME')
            message['subject'] = subject

            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            message_body = {'raw': raw_message}
            service.users().messages().send(userId='me', body=message_body).execute()
        except Exception as e:
            print(f"Error sending email via Gmail: {str(e)}")
    elif token is None and path is not None:
        try:
            message = MIMEText(f"{email_content}")
            message['to'] = email
            message['from']=os.environ.get('MAIL_USERNAME')
            message['subject']=subject
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            message_body = {'raw': raw_message}
            service.users().messages().send(userId='me', body=message_body).execute()
        except Exception as e:
            print(f"Error sending email via Gmail: {str(e)}")

    else:
        try:
            pdf_buffer = generate_bill_pdf(email_content)
            pdf_attachment = pdf_buffer.getvalue()
            pdf_buffer.close()

            message = MIMEMultipart()
            message['to'] = email
            message['from'] = current_app.config['MAIL_USERNAME']
            message['subject'] = subject
            body = MIMEText(f"Please find the attached bill receipt")
            message.attach(body)

            attachment = MIMEBase('application','pdf')
            attachment.set_payload(pdf_attachment)
            encoders.encode_base64(attachment)
            attachment.add_header('Content-Disposition','attachment',filename='receipt.pdf')
            message.attach(attachment)


            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            message_body ={'raw':raw_message}
            service.users().messages().send(userId='me',body=message_body).execute()
        except Exception as e:
            print(f"Error sending email via Gmail:{str(e)}")


# UPLOAD DOCUMENTS TO AWS S3
ALLOWED_IMAGE_EXTENSIONS ={'jpg','jpeg','png','tif','tiff','bmp','gif'}

def is_dicom(file_stream):
    try:
        file_stream.seek(0)
        pydicom.dcmread(file_stream,stop_before_pixels=True)
        return True
    except InvalidDicomError:
        return False

def convert_dicom_to_png(dicom_file):
    dicom_data = pydicom.dcmread(dicom_file)
    # Apply VOI LUT transformation (window leveling)
    image = _apply_voi_lut(dicom_data.pixel_array,dicom_data)
    # Convert to grayscale if necessary
    if dicom_data.PhotometricInterpretation == "MONOCHROME1":
        image = image.max() - image

    # Normalize pixel values to 0-255
    image = ((image - image.min()) / (image.max() - image.min()) * 255).astype('uint8')
    # Convert to PIL image and return as byte stream
    img = Image.fromarray(image).convert("L")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return buffer


# convert images or documents to webp , better in compressing files and resolution
def convertImagesToWebP(file_stream):
    img = Image.open(file_stream)
    img = img.convert("RGB")
    img.thumbnail((500,500))
    buffer=io.BytesIO()
    img.save(buffer,format='WEBP',quality=80)
    buffer.seek(0)
    return buffer


# upload documents into AWS
@shared_task
def documentsUploadToAWS(encoded_file,filename):

    s3_client = boto3.client('s3',
                             aws_access_key_id=os.getenv('BUCKETEER_AWS_ACCESS_KEY_ID'),
                             aws_secret_access_key=os.getenv('BUCKETEER_AWS_SECRET_ACCESS_KEY')
                             )
    #Decode the Base64 file
    file_bytes = base64.b64decode(encoded_file)
    #create a BytesIO stream from the decoded bytes
    file_stream = BytesIO(file_bytes)

    # Extract file extension from filename
    file_extension = filename.rsplit('.', 1)[-1].lower()

    # Handle DICOM files
    if file_extension == 'dcm' and is_dicom(file_stream):
        file_stream = convert_dicom_to_png(file_stream)
        filename = filename.rsplit('.', 1)[0] + '.png'  # Change filename to .png
        content_type = 'image/png'
        print("content type1",content_type)

        # Check if the uploaded file is an image that needs conversion to WebP
    elif file_extension in ALLOWED_IMAGE_EXTENSIONS:
        file_stream = convertImagesToWebP(file_stream)
        filename = filename.rsplit('.', 1)[0] + '.webp'  # Change filename to .webp
        content_type = 'image/webp'
        print("content type1",content_type)

        # If it's a PDF, retain original format
    elif file_extension == 'pdf':
        content_type = 'application/pdf'
        print("content type2",content_type)

    # If it's another type, set generic content type
    else:
        content_type = 'application/octet-stream'

    # Upload the (converted or original) file to S3
    s3_client.upload_fileobj(
        file_stream,
        os.getenv('BUCKETEER_BUCKET_NAME'),
        filename,
        ExtraArgs={'ContentType': content_type}  # Set correct MIME type
    )







