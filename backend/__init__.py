from flask import Flask
from .extensions import db,migrate,login_manager,mail
from .views import main
from flask_cors import CORS
from .config import Config
from .models import User
from .utils import celery_init_app

def create_app():
    app=Flask(__name__,static_folder='static',static_url_path='/static')
    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)
    migrate.init_app(app,db)
    login_manager.init_app(app)
    mail.init_app(app)
    login_manager.login_view='home'

    celery = celery_init_app(app)
    celery.set_default()

    @login_manager.user_loader # this is needed to send emails
    def load_user(user_id):
        return User.get(user_id)

    app.register_blueprint(main)

    return app, celery

