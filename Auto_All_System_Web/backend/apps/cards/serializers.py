"""
虚拟卡序列化器
"""
from rest_framework import serializers
from .models import Card, CardUsageLog


class CardSerializer(serializers.ModelSerializer):
    """虚拟卡序列化器"""
    
    masked_card_number = serializers.CharField(read_only=True)
    success_rate = serializers.SerializerMethodField()
    pool_type_display = serializers.CharField(source='get_pool_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    owner_user_name = serializers.SerializerMethodField()
    is_available = serializers.BooleanField(read_only=True)
    remaining_usage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Card
        fields = [
            'id', 'card_number', 'masked_card_number', 'card_holder',
            'expiry_month', 'expiry_year', 'cvv', 'card_type', 'bank_name', 'balance',
            'pool_type', 'pool_type_display', 'owner_user', 'owner_user_name',
            'status', 'status_display',
            'use_count', 'success_count', 'success_rate',
            'max_use_count', 'billing_address', 'notes',
            'created_at', 'updated_at', 'last_used_at',
            'is_available', 'remaining_usage'
        ]
        read_only_fields = [
            'id', 'masked_card_number', 'use_count', 'success_count',
            'created_at', 'updated_at', 'last_used_at',
            'is_available', 'remaining_usage'
        ]
        extra_kwargs = {
            'card_number': {'write_only': True},
            'cvv': {'write_only': True},
        }
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        
        # 如果不是超级管理员，隐藏敏感信息
        if not (request and request.user and request.user.is_superuser):
            # card_number 和 cvv 已经是 write_only 了，但以防万一
            ret.pop('card_number', None)
            ret.pop('cvv', None)
        else:
            # 超级管理员，确保能看到
            ret['card_number'] = instance.card_number
            ret['cvv'] = instance.cvv
            
        return ret
    
    def get_success_rate(self, obj):
        """计算成功率"""
        if obj.use_count == 0:
            return 0.0
        return round((obj.success_count / obj.use_count) * 100, 2)
    
    def get_owner_user_name(self, obj):
        """获取所属者姓名"""
        if obj.owner_user:
            return obj.owner_user.username
        return None


class CardImportSerializer(serializers.Serializer):
    """批量导入虚拟卡序列化器"""
    
    cards_data = serializers.ListField(
        child=serializers.JSONField(),
        required=True,
        help_text='卡数据列表，支持对象或字符串 "card_number month year cvv [notes]"'
    )
    pool_type = serializers.ChoiceField(
        choices=['public', 'private'],
        default='public',
        help_text='卡池类型'
    )

    def validate_cards_data(self, value):
        normalized = []
        for item in value:
            if isinstance(item, str):
                parts = item.strip().split()
                if len(parts) < 4:
                    raise serializers.ValidationError(f'格式错误，至少包含：卡号 月份 年份 CVV: {item}')
                normalized.append({
                    'card_number': parts[0],
                    'expiry_month': int(parts[1]),
                    'expiry_year': int(parts[2]) if len(parts[2]) == 4 else 2000 + int(parts[2]),
                    'cvv': parts[3],
                    'notes': ' '.join(parts[4:]) if len(parts) > 4 else ''
                })
            elif isinstance(item, dict):
                # 支持多种字段名映射
                card_number = item.get('card_number')
                month = item.get('expiry_month') or item.get('exp_month')
                year = item.get('expiry_year') or item.get('exp_year')
                cvv = item.get('cvv')
                
                if not all([card_number, month, year, cvv]):
                    raise serializers.ValidationError(f'缺少必要字段: {item}')
                
                # 年份处理
                year = int(year)
                if year < 100:
                    year += 2000
                
                normalized.append({
                    'card_number': str(card_number),
                    'expiry_month': int(month),
                    'expiry_year': year,
                    'cvv': str(cvv),
                    'card_type': item.get('card_type', 'visa'),
                    'bank_name': item.get('bank_name', ''),
                    'card_holder': item.get('card_holder', ''),
                    'notes': item.get('notes', '')
                })
            else:
                raise serializers.ValidationError(f'不支持的数据类型: {type(item)}')
        return normalized


class CardUsageLogSerializer(serializers.ModelSerializer):
    """卡使用记录序列化器"""
    
    card_info = CardSerializer(source='card', read_only=True)
    
    class Meta:
        model = CardUsageLog
        fields = [
            'id', 'card', 'card_info', 'user', 'task',
            'purpose', 'success', 'error_message',
            'transaction_id', 'amount', 'currency',
            'extra_data', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
