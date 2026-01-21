"""
专区序列化器
"""
from rest_framework import serializers
from .models import Zone, ZoneConfig, UserZoneAccess


class ZoneSerializer(serializers.ModelSerializer):
    """专区序列化器"""
    
    class Meta:
        model = Zone
        fields = [
            'id', 'name', 'code', 'description', 'icon',
            'plugin_class', 'is_active', 'sort_order',
            'price_per_task', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ZoneConfigSerializer(serializers.ModelSerializer):
    """专区配置序列化器"""
    
    class Meta:
        model = ZoneConfig
        fields = [
            'id', 'zone', 'config_key', 'config_value',
            'value_type', 'description', 'is_secret',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserZoneAccessSerializer(serializers.ModelSerializer):
    """用户专区权限序列化器"""
    
    zone_info = ZoneSerializer(source='zone', read_only=True)
    
    class Meta:
        model = UserZoneAccess
        fields = [
            'id', 'user', 'zone', 'zone_info',
            'is_enabled', 'quota_limit', 'quota_used',
            'expires_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'quota_used', 'created_at', 'updated_at']
