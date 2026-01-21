"""
专区URL配置
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ZoneViewSet, UserZoneAccessViewSet

router = DefaultRouter()
router.register('', ZoneViewSet, basename='zone')
router.register('access', UserZoneAccessViewSet, basename='zone-access')

urlpatterns = [
    path('', include(router.urls)),
]
