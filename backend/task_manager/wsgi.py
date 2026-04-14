"""
WSGI config for task_manager project.
This is the entry point for production WSGI servers (e.g. gunicorn).
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_manager.settings')
application = get_wsgi_application()
