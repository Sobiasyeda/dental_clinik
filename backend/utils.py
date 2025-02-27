from celery import Celery, Task
from flask import Flask
import os
from urllib.parse import urlparse
import ssl
from celery.schedules import crontab
from .tasks import send_automatic_whatsapp_reminders
from tzlocal import get_localzone


def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    redis_url = os.getenv("REDIS_URL", "redis://localhost")
    parsed_url = urlparse(redis_url)

    if not parsed_url.scheme:
        raise ValueError("Invalid Redis Url: scheme is missing")

    CELERY = {
        'broker_url': redis_url,
        'result_backend': redis_url,
        'task_ignore_result': True,
        'broker_connection_retry_on_startup': True,
    }
    if parsed_url.scheme == "rediss":
        CELERY.update({
            "broker_use_ssl": {
                "ssl_cert_reqs": ssl.CERT_NONE  # Disable certificate validation
            },
            "redis_backend_use_ssl": {
                "ssl_cert_reqs": ssl.CERT_NONE  # Disable certificate validation for backend
            }
        })

    # initialize the celery app
    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(CELERY)


    # set the beat schedule for sending reminders at 8 AM every day
    celery_app.conf.beat_schedule = {
        'send_today_whatsapp_reminders':{
            'task':'backend.tasks.send_automatic_whatsapp_reminders',
            'schedule': crontab(hour=17, minute=0)
        }
    }
    local_tz = str(get_localzone())
    celery_app.conf.timezone=local_tz
    celery_app.conf.enable_utc=False

    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app



