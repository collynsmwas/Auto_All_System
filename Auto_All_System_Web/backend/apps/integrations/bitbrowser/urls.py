"""
比特浏览器模块路由配置
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BrowserGroupViewSet, BrowserWindowRecordViewSet

router = DefaultRouter()
router.register('groups', BrowserGroupViewSet, basename='browser-group')
router.register('windows', BrowserWindowRecordViewSet, basename='browser-window')

app_name = 'bitbrowser'

urlpatterns = [
    path('', include(router.urls)),
]

