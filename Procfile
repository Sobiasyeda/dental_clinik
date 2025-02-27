web: gunicorn main:app
worker: celery -A main.celery worker --loglevel=info --concurrency=2
beat: celery -A main.celery beat --loglevel=info
