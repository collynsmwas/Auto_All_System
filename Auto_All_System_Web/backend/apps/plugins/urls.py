"""
插件管理URL配置
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PluginManagementViewSet

# 创建路由器
router = DefaultRouter()
router.register('', PluginManagementViewSet, basename='plugin')

app_name = 'plugins'

urlpatterns = [
    path('', include(router.urls)),
]

