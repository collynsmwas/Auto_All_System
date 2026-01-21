"""
支付相关序列化器
"""
from rest_framework import serializers
from .models import RechargeCard, PaymentConfig, Order
from django.contrib.auth import get_user_model

User = get_user_model()


class RechargeCardSerializer(serializers.ModelSerializer):
    """充值卡密序列化器"""
    used_by_username = serializers.CharField(source='used_by.username', read_only=True, allow_null=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = RechargeCard
        fields = [
            'id', 'card_code', 'amount', 'status',
            'batch_no', 'expires_at', 'used_by', 'used_by_username',
            'used_at', 'created_by', 'created_by_username', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'used_by_username', 'created_by_username']


class RechargeCardCreateSerializer(serializers.Serializer):
    """批量生成卡密序列化器"""
    count = serializers.IntegerField(min_value=1, max_value=1000, help_text='生成数量')
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1, help_text='面值')
    expires_days = serializers.IntegerField(required=False, min_value=1, help_text='有效天数（可选）')
    notes = serializers.CharField(required=False, allow_blank=True, help_text='备注')
    prefix = serializers.CharField(required=False, allow_blank=True, max_length=10, help_text='卡密前缀（可选）')


class RechargeCardUseSerializer(serializers.Serializer):
    """使用卡密序列化器"""
    card_code = serializers.CharField(max_length=32, help_text='卡密')


class PaymentConfigSerializer(serializers.ModelSerializer):
    """支付配置序列化器"""
    
    class Meta:
        model = PaymentConfig
        fields = [
            'id', 'gateway', 'name', 'is_enabled', 'sort_order',
            'icon', 'fee_rate', 'min_amount', 'max_amount',
            'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentConfigPublicSerializer(serializers.ModelSerializer):
    """支付配置序列化器（用户端）"""
    
    class Meta:
        model = PaymentConfig
        fields = ['gateway', 'name', 'icon', 'min_amount', 'max_amount']


class OrderSerializer(serializers.ModelSerializer):
    """订单序列化器"""
    user_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_no', 'user', 'user_info', 'amount', 'actual_amount',
            'currency', 'order_type', 'status', 'description', 'items',
            'payment_method', 'paid_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_no', 'created_at', 'updated_at']
    
    def get_user_info(self, obj):
        """获取用户信息"""
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email
        }

