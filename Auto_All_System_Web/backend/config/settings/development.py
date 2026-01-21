"""
开发环境配置
"""
from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# 开发环境使用SQLite（可选）
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

# 开发环境CORS允许所有来源
CORS_ALLOW_ALL_ORIGINS = True

# 开发环境日志级别
LOGGING['loggers']['apps']['level'] = 'DEBUG'

# Django Debug Toolbar（可选）
if DEBUG:
    try:
        import debug_toolbar
        INSTALLED_APPS += ['debug_toolbar']
        MIDDLEWARE = ['debug_toolbar.middleware.DebugToolbarMiddleware'] + MIDDLEWARE
        INTERNAL_IPS = ['127.0.0.1']
    except ImportError:
        pass
