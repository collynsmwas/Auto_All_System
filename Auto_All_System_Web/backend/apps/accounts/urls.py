"""
用户账户URL配置
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import AuthViewSet, UserViewSet, UserBalanceViewSet

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')
router.register('balance', UserBalanceViewSet, basename='balance')

urlpatterns = [
    # 认证相关
    path('auth/register/', AuthViewSet.as_view({'post': 'register'}), name='auth-register'),
    path('auth/login/', AuthViewSet.as_view({'post': 'login'}), name='auth-login'),
    path('auth/logout/', AuthViewSet.as_view({'post': 'logout'}), name='auth-logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    
    # 其他路由
    path('', include(router.urls)),
]
