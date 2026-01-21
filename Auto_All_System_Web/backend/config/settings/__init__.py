"""
Django settings包

根据环境变量DJANGO_SETTINGS_MODULE加载对应的配置
"""
import os

# 默认使用开发环境配置
ENVIRONMENT = os.getenv('DJANGO_ENVIRONMENT', 'development')

if ENVIRONMENT == 'production':
    from .production import *
elif ENVIRONMENT == 'testing':
    from .testing import *
else:
    from .development import *
