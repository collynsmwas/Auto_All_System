"""
代理管理序列化器
"""
from rest_framework import serializers
from .models import Proxy


class ProxySerializer(serializers.ModelSerializer):
    """代理序列化器"""
    
    proxy_url = serializers.ReadOnlyField()
    
    class Meta:
        model = Proxy
        fields = [
            'id', 'proxy_type', 'host', 'port', 'username', 'password',
            'country', 'region', 'city', 'status', 'response_time', 
            'success_rate', 'use_count', 'last_used_at', 'last_check_at',
            'metadata', 'created_at', 'updated_at', 'proxy_url'
        ]
        read_only_fields = ['created_at', 'updated_at', 'proxy_url']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class ProxyCreateSerializer(serializers.Serializer):
    """代理创建序列化器"""
    
    proxy_type = serializers.ChoiceField(
        choices=['http', 'https', 'socks5'],
        default='socks5'
    )
    host = serializers.CharField(max_length=255)
    port = serializers.IntegerField(min_value=1, max_value=65535)
    username = serializers.CharField(max_length=100, required=False, allow_blank=True)
    password = serializers.CharField(max_length=255, required=False, allow_blank=True)
    country = serializers.CharField(max_length=100, required=False, allow_blank=True)
    region = serializers.CharField(max_length=100, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)


class ProxyBatchImportSerializer(serializers.Serializer):
    """代理批量导入序列化器"""
    
    proxy_text = serializers.CharField(
        help_text='代理文本,每行一个代理,格式: socks5://user:pass@host:port'
    )


class ProxyTestSerializer(serializers.Serializer):
    """代理测试序列化器"""
    
    proxy_id = serializers.UUIDField(required=False)
    proxy_type = serializers.ChoiceField(
        choices=['http', 'https', 'socks5'],
        required=False
    )
    host = serializers.CharField(max_length=255, required=False)
    port = serializers.IntegerField(min_value=1, max_value=65535, required=False)
    username = serializers.CharField(max_length=100, required=False, allow_blank=True)
    password = serializers.CharField(max_length=255, required=False, allow_blank=True)

