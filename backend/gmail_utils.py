from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import googleapiclient.discovery
from flask import current_app

def get_gmail_service():
    try:
        creds = Credentials(
            None,
            refresh_token=current_app.config['GOOGLE_REFRESH_TOKEN'],
            token_uri='https://oauth2.googleapis.com/token',
            client_id=current_app.config['GOOGLE_CLIENT_ID'],
            client_secret=current_app.config['GOOGLE_CLIENT_SECRET'],
            scopes=['https://www.googleapis.com/auth/gmail.send']
        )
        creds.refresh(Request())
        service = googleapiclient.discovery.build('gmail', 'v1', credentials=creds)
        return service
    except Exception as e:
        print(f"Error getting Gmail service: {str(e)}")
        return None

