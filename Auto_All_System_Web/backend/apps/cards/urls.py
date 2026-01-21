"""
虚拟卡URL配置
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CardViewSet, CardUsageLogViewSet

router = DefaultRouter()
router.register('', CardViewSet, basename='card')
router.register('usage-logs', CardUsageLogViewSet, basename='card-usage-log')

urlpatterns = [
    path('', include(router.urls)),
]
