from .defaults import *  # noqa

LEVEL = 'staging'

ALLOWED_HOSTS = (
    '*.admindev.betterbeauty.io',
    'admindev.betterbeauty.io',
    '*.admindev.madebeauty.com',
    'admindev.madebeauty.com',
)

DEBUG = True

DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_STORAGE_BUCKET_NAME = 'elasticbeanstalk-us-east-1-024990310245'
AWS_LOCATION = 'uploads'

# TODO: add FB settings
FB_APP_ID = '1332946860139961'
FB_APP_SECRET = 'a2013eb7dc891c5534bcad9ee69bae98'
