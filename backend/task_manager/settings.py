"""
Django settings for task_manager project.

BEGINNER TIP:
  settings.py is the central config file for your Django project.
  It controls the database, installed apps, middleware, auth settings, etc.
"""

from pathlib import Path
from datetime import timedelta
from decouple import config   # reads values from the .env file

# ------------------------------------------------------------------
# Base directory — the root of the backend/ folder
# ------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent


# ------------------------------------------------------------------
# Security settings
# ------------------------------------------------------------------
SECRET_KEY = config('SECRET_KEY')   # loaded from .env — never hard-code!
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = ['localhost', '127.0.0.1']


# ------------------------------------------------------------------
# Installed apps
# ------------------------------------------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party packages
    'rest_framework',            # Django REST Framework — builds our APIs
    'rest_framework_simplejwt',  # JWT authentication
    'corsheaders',               # Allow React (running on port 3000) to talk to Django (port 8000)
    'drf_spectacular',           # OpenAPI 3 schema generation → Swagger UI + ReDoc

    # Our own app
    'tasks',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # must be as high as possible
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'task_manager.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'task_manager.wsgi.application'


# ------------------------------------------------------------------
# Database — PostgreSQL
# ------------------------------------------------------------------
# BEGINNER TIP: Django supports multiple databases. We use PostgreSQL
# because it is production-grade. The credentials come from .env so
# we never store secrets in code.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':     config('DB_NAME'),
        'USER':     config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST':     config('DB_HOST', default='localhost'),
        'PORT':     config('DB_PORT', default='5432'),
    }
}


# ------------------------------------------------------------------
# Password validation
# ------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ------------------------------------------------------------------
# Internationalisation
# ------------------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ------------------------------------------------------------------
# Static files
# ------------------------------------------------------------------
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ------------------------------------------------------------------
# Django REST Framework configuration
# ------------------------------------------------------------------
# BEGINNER TIP: DRF lets us build APIs. The DEFAULT_AUTHENTICATION_CLASSES
# tells DRF to expect a JWT token in every request (except public endpoints).
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',  # all endpoints require login by default
    ),
    # Tell DRF to use drf-spectacular for schema generation instead of the
    # built-in (less capable) CoreAPI schema generator.
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}


# ------------------------------------------------------------------
# drf-spectacular — Swagger / OpenAPI 3.0 settings
# ------------------------------------------------------------------
# BEGINNER TIP:
#   drf-spectacular auto-inspects all your views, serializers, and URL
#   patterns and generates an OpenAPI 3.0 schema from them.
#   The schema powers both Swagger UI and ReDoc — you write code once
#   and get interactive, self-updating docs for free.
SPECTACULAR_SETTINGS = {
    'TITLE': 'Task Manager API',
    'DESCRIPTION': (
        'A full-stack Task Manager built with Django REST Framework + JWT.\n\n'
        '**Authentication:** Use the `/api/auth/login/` endpoint to obtain a JWT '
        'access token, then click **Authorize** above and enter:\n\n'
        '`Bearer <your_access_token>`'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,   # hide the /api/schema/ endpoint from the UI itself

    # Security scheme — tells Swagger UI to show the Authorize button
    # and attach Bearer tokens automatically when "Try it out" is used.
    'SECURITY': [{'BearerAuth': []}],

    # Adds the BearerAuth scheme definition to the OpenAPI spec
    'APPEND_COMPONENTS': {
        'securitySchemes': {
            'BearerAuth': {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT',
                'description': 'Paste your access token here (without the "Bearer " prefix — Swagger adds it).',
            }
        }
    },

    # Group endpoints by the first segment of their tag (e.g. "auth", "tasks")
    'SORT_OPERATIONS': False,
    'COMPONENT_SPLIT_REQUEST': True,   # separate request/response schemas for clarity
}


# ------------------------------------------------------------------
# JWT (JSON Web Token) configuration
# ------------------------------------------------------------------
# BEGINNER TIP:
#   Access token  — short-lived (60 min). Sent with every API request.
#   Refresh token — long-lived (7 days). Used to get a NEW access token
#                   without asking the user to log in again.
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS':  True,   # issue a new refresh token on each refresh
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',), # we send: Authorization: Bearer <token>
}


# ------------------------------------------------------------------
# CORS — Cross-Origin Resource Sharing
# ------------------------------------------------------------------
# React runs on http://localhost:3000 while Django runs on :8000.
# Browsers block requests between different origins unless the server
# explicitly allows it via CORS headers.
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
