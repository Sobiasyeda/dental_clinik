import os
import ssl

from dotenv import load_dotenv
import redis
from urllib.parse import urlparse
# load_dotenv is used to load environment variables from .env
load_dotenv()

class Config:
    MYSQL_HOST = os.environ.get("DB_HOST")
    MYSQL_USER = os.environ.get("MYSQL_USER")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD")
    MYSQL_DB = os.environ.get("MYSQL_DB")

    SQLALCHEMY_DATABASE_URI = os.getenv('JAWSDB_URL') or \
                              f"mysql://{os.getenv('MYSQL_USER')}:{os.getenv('MYSQL_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('MYSQL_DB')}"

    SECRET_KEY = os.environ.get("SECRET_KEY")

    #Roles configuration
    ADMIN=os.getenv('ADMIN')
    ASSISTANT=os.getenv('ASSISTANT')
    DOCTOR=os.getenv('DOCTOR')
    NURSE=os.getenv('NURSE')
    SYSTEMADMIN=os.getenv('SYSTEMADMIN')

    #set DEBUG based on environment
    DEBUG = os.getenv('FLASK_ENV')=='development'

    #Gmail Configuration
    MAIL_SERVER = os.environ.get("MAIL_SERVER")
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
    GOOGLE_REFRESH_TOKEN = os.environ.get("GOOGLE_REFRESH_TOKEN")
    REDIRECT_URI = os.environ.get("REDIRECT_URI")
    MAIL_PORT = int(os.environ.get("MAIL_PORT"))
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_USE_SSL = os.environ.get("MAIL_USE_SSL") == 'True'
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS") == 'True'


    # whatsApp configuration
    APP_ID = os.environ.get("APP_ID")
    APP_SECRET = os.environ.get("APP_SECRET")
    VERSION = os.environ.get("APP_API_VERSION")
    PHONE_NUMBER_ID = os.environ.get("PHONE_NUMBER_ID")
    ACCESS_TOKEN =os.environ.get("SYSTEM_USER_ACCESS_TOKEN")



    # REACT_APP_URL = os.getenv("REACT_APP_URL","http://locahost:5173")

    REACT_CHANGE_PASSWORD_URL = os.environ.get("REACT_CHANGE_PASSWORD")
    APPLICATION_ROOT = '/'
    PREFERRED_URL_SCHEME = 'http'


