"""
支付URL配置
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RechargeCardViewSet, RechargeCardUserViewSet, PaymentConfigViewSet, OrderViewSet

router = DefaultRouter()
router.register('recharge-cards', RechargeCardViewSet, basename='recharge-card')
router.register('payment-configs', PaymentConfigViewSet, basename='payment-config')
router.register('orders', OrderViewSet, basename='order')

urlpatterns = [
    # 用户端卡密充值
    path('card-recharge/use/', RechargeCardUserViewSet.as_view({'post': 'use'}), name='card-recharge-use'),
    
    # 其他路由（包含payment-configs/enabled/）
    path('', include(router.urls)),
]
