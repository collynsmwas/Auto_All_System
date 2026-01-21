"""
生产环境配置
SSL/HTTPS由Nginx控制，Django信任代理头
"""
from .base import *

DEBUG = False

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# 代理配置 - 信任来自Nginx的头信息
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

# 安全配置 - 由Nginx控制HTTPS
# 当Nginx启用SSL时，会通过X-Forwarded-Proto头告诉Django是HTTPS请求
SECURE_SSL_REDIRECT = False  # Nginx层面处理重定向
SESSION_COOKIE_SECURE = os.getenv('ENABLE_HTTPS', 'false').lower() == 'true'
CSRF_COOKIE_SECURE = os.getenv('ENABLE_HTTPS', 'false').lower() == 'true'
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# 生产环境日志
LOGGING['handlers']['file']['filename'] = '/var/log/auto_all_system/django.log'
