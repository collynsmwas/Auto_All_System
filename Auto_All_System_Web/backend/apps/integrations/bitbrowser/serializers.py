"""
比特浏览器模块序列化器
"""
from rest_framework import serializers
from .models import BitBrowserProfile, BrowserGroup, BrowserWindowRecord
from apps.integrations.proxies.models import Proxy


class BrowserGroupSerializer(serializers.ModelSerializer):
    """浏览器分组序列化器"""
    
    window_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BrowserGroup
        fields = [
            'id', 'group_name', 'bitbrowser_group_id', 
            'description', 'sort_order', 'window_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_window_count(self, obj):
        """获取分组下的窗口数量"""
        return obj.windows.filter(status='active').count()


class BrowserWindowRecordSerializer(serializers.ModelSerializer):
    """浏览器窗口记录序列化器"""
    
    group_name = serializers.CharField(source='group.group_name', read_only=True)
    proxy_info = serializers.SerializerMethodField()
    
    class Meta:
        model = BrowserWindowRecord
        fields = [
            'id', 'browser_id', 'browser_name',
            'group', 'group_name',
            'account_email', 'account_password', 'backup_email', 'two_fa_secret',
            'proxy', 'proxy_info',
            'platform_url', 'extra_urls',
            'status', 'open_count', 'last_opened_at',
            'remark', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'browser_id', 'open_count', 'last_opened_at', 'created_at', 'updated_at']
        extra_kwargs = {
            'account_password': {'write_only': True},
            'two_fa_secret': {'write_only': True},
        }
    
    def get_proxy_info(self, obj):
        """获取代理信息"""
        if obj.proxy:
            return {
                'id': str(obj.proxy.id),
                'name': f"{obj.proxy.proxy_type}://{obj.proxy.host}:{obj.proxy.port}",
                'country': obj.proxy.country,
                'status': obj.proxy.status
            }
        return None


class BatchCreateWindowSerializer(serializers.Serializer):
    """批量创建窗口序列化器"""
    
    template_browser_id = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='模板窗口ID（可选）'
    )
    group_name = serializers.CharField(
        required=True,
        max_length=100,
        help_text='分组名称'
    )
    platform_url = serializers.URLField(
        required=False,
        allow_blank=True,
        help_text='平台URL'
    )
    extra_urls = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='额外URL，逗号分隔'
    )
    accounts = serializers.ListField(
        child=serializers.DictField(),
        help_text='账号列表'
    )
    proxy_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        allow_empty=True,
        help_text='代理ID列表（可选）'
    )
    name_prefix = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='窗口名称前缀（可选）'
    )
    
    def validate_accounts(self, value):
        """验证账号列表格式"""
        if not value:
            raise serializers.ValidationError("账号列表不能为空")
        
        for i, account in enumerate(value):
            if 'email' not in account or not account['email']:
                raise serializers.ValidationError(f"第{i+1}个账号缺少email字段")
            if 'password' not in account or not account['password']:
                raise serializers.ValidationError(f"第{i+1}个账号缺少password字段")
        
        return value


class ParseAccountsSerializer(serializers.Serializer):
    """解析账号文本序列化器"""
    
    account_text = serializers.CharField(
        required=True,
        help_text='账号文本内容'
    )
    separator = serializers.CharField(
        required=False,
        default='----',
        help_text='分隔符'
    )


class ProxyImportSerializer(serializers.Serializer):
    """代理批量导入序列化器"""
    
    proxy_text = serializers.CharField(
        required=True,
        help_text='代理文本内容，格式：socks5://username:password@host:port'
    )


class ProxyTestSerializer(serializers.Serializer):
    """代理测试序列化器"""
    
    proxy_id = serializers.UUIDField(
        required=True,
        help_text='代理ID'
    )

