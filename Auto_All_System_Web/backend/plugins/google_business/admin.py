"""
Google Business插件Admin管理界面
"""
from django.contrib import admin
from .models import GoogleBusinessConfig, BusinessTaskLog


@admin.register(GoogleBusinessConfig)
class GoogleBusinessConfigAdmin(admin.ModelAdmin):
    """Google Business配置管理"""
    list_display = [
        'key',
        'sheerid_enabled',
        'gemini_enabled',
        'auto_verify',
        'updated_at',
    ]
    list_filter = ['sheerid_enabled', 'gemini_enabled', 'auto_verify']
    search_fields = ['key']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('基本信息', {
            'fields': ('key',)
        }),
        ('功能开关', {
            'fields': ('sheerid_enabled', 'gemini_enabled', 'auto_verify')
        }),
        ('高级设置', {
            'fields': ('settings',),
            'classes': ('collapse',)
        }),
        ('时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BusinessTaskLog)
class BusinessTaskLogAdmin(admin.ModelAdmin):
    """业务任务日志管理"""
    list_display = [
        'id',
        'user',
        'google_account',
        'task_type',
        'status',
        'duration',
        'created_at',
    ]
    list_filter = [
        'task_type',
        'status',
        'created_at',
    ]
    search_fields = [
        'user__username',
        'google_account__email',
        'error_message',
    ]
    readonly_fields = [
        'user',
        'google_account',
        'task',
        'task_type',
        'started_at',
        'completed_at',
        'duration',
        'result_data',
        'error_message',
        'screenshots',
        'metadata',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('基本信息', {
            'fields': ('user', 'google_account', 'task', 'task_type')
        }),
        ('执行状态', {
            'fields': ('status', 'started_at', 'completed_at', 'duration')
        }),
        ('执行结果', {
            'fields': ('result_data', 'error_message', 'screenshots')
        }),
        ('额外数据', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        """禁止手动添加日志"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """日志只读"""
        return False

