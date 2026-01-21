"""
代理管理路由配置
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProxyViewSet

router = DefaultRouter()
router.register('', ProxyViewSet, basename='proxy')

app_name = 'proxies'

urlpatterns = [
    path('', include(router.urls)),
]

