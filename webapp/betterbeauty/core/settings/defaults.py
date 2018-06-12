import datetime
import os

from path import Path
from .utils import parse_database_url  # NOQA

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
PATH = Path(__file__).parent
ROOT_PATH = PATH.parent.parent
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LOGS_PATH = ROOT_PATH / 'logs'
LOG_MAX_FILESIZE = 10485760

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '_8aa&jg@cd64@%2%20&6kzpu$cf8xu3hme&q&fu2gei(#7*h0r'

ALLOWED_HOSTS = ['betterbeauty.local', ]

DATABASE_URL = ''

if 'RDS_DB_NAME' in os.environ:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': os.environ['RDS_DB_NAME'],
            'USER': os.environ['RDS_USERNAME'],
            'PASSWORD': os.environ['RDS_PASSWORD'],
            'HOST': os.environ['RDS_HOSTNAME'],
            'PORT': os.environ['RDS_PORT'],
        }
    }


# Application definition

INSTALLED_APPS = [
    # django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'corsheaders',
    'custom_user',
    'django_extensions',
    'rest_framework',
    'storages',

    # Internal apps
    'api',
    'appointment',
    'client',
    'core',
    'salon',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'
APPEND_SLASH = False

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

WSGI_APPLICATION = 'core.wsgi.application'

# Password validation
# https://docs.djangoproject.com/en/2.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
    ),
}

AUTH_USER_MODEL = 'core.User'

JWT_AUTH = {
    'JWT_ALLOW_REFRESH': True,
    'JWT_AUTH_HEADER_PREFIX': 'Token',  # add header Authentication: Token <jwt_token>
    'JWT_EXPIRATION_DELTA': datetime.timedelta(hours=24),  # set expiration for 1 day
    'JWT_RESPONSE_PAYLOAD_HANDLER': 'core.utils.auth.jwt_response_payload_handler',
}

# as long as we employ JWT based auth - we can safely enable CORS requests from anywhere
CORS_ORIGIN_ALLOW_ALL = True

# Internationalization

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'America/New_York'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files settings
MEDIA_ROOT = (ROOT_PATH / 'media')
MEDIA_URL = '/media/'
STATIC_ROOT = (ROOT_PATH / 'static')
STATIC_URL = '/static/'

MAX_FILE_UPLOAD_SIZE = 1024 * 1024 * 5  # 5MB

AWS_S3_FILE_OVERWRITE = False

DEBUG = False
