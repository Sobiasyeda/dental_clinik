from backend import create_app
import logging
from logging.handlers import RotatingFileHandler
app,celery=create_app()

if not app.debug:
    handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=3)
    handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)
    app.logger.info('Logging is configured.')

if __name__ == "__main__":
    app.debug=True
    app.run()


