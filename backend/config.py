import os
from dotenv import load_dotenv

load_dotenv()
DB_HOST = os.getenv('DATABASE_HOST', os.getenv('DB_HOST', 'localhost'))
DB_USER = os.getenv('DATABASE_USER', os.getenv('DB_USER', 'root'))
DB_PASSWORD = os.getenv('DATABASE_PASSWORD', os.getenv('DB_PASSWORD', ''))
DB_NAME = os.getenv('DATABASE_NAME', os.getenv('DB_NAME', 'StyleInfinite'))
DB_PORT = int(os.getenv('DATABASE_PORT', os.getenv('DB_PORT', 3306)))

SECRET_KEY = os.getenv('SECRET_KEY', '')
JWT_ALGORITHM = 'HS256'

SMTP_HOST = os.getenv('MAIL_SERVER', os.getenv('SMTP_HOST', ''))
SMTP_PORT = int(os.getenv('MAIL_PORT', os.getenv('SMTP_PORT', 587)))
SMTP_USER = os.getenv('MAIL_USERNAME', os.getenv('SMTP_USER', ''))
SMTP_PASSWORD = os.getenv('MAIL_PASSWORD', os.getenv('SMTP_PASSWORD', ''))
SMTP_FROM = os.getenv('MAIL_FROM', os.getenv('SMTP_FROM', SMTP_USER or 'no-reply@example.com'))
MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() in ('1', 'true', 'yes')