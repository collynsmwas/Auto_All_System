"""
管理后台URL配置
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminStatisticsViewSet

router = DefaultRouter()
router.register('statistics', AdminStatisticsViewSet, basename='admin-statistics')

urlpatterns = [
    path('', include(router.urls)),
]
