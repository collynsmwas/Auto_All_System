"""
任务管理 - Admin配置
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Task, TaskLog, TaskStatistics


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """任务管理"""
    
    list_display = ['id_badge', 'user_link', 'zone_link', 'task_type', 'status_badge', 'progress_bar', 'cost_display', 'created_at_short']
    list_display_links = ['id_badge']
    list_filter = ['status', 'priority', 'zone', 'created_at']
    search_fields = ['id', 'user__username', 'task_type']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('📋 任务信息', {
            'fields': ('user', 'zone', 'task_type', 'priority')
        }),
        ('📊 执行状态', {
            'fields': ('status', 'progress', 'cost_amount')
        }),
        ('📥 输入数据', {
            'fields': ('input_data',),
            'classes': ('collapse',)
        }),
        ('📤 输出数据', {
            'fields': ('output_data', 'error_message'),
            'classes': ('collapse',)
        }),
        ('⏱️ 时间信息', {
            'fields': ('start_time', 'end_time', 'duration', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('🔗 其他', {
            'fields': ('celery_task_id', 'metadata'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['duration', 'created_at', 'updated_at', 'start_time', 'end_time']
    actions = ['cancel_tasks', 'retry_tasks', 'reset_tasks']
    
    def id_badge(self, obj):
        """任务ID徽章"""
        return format_html(
            '<span style="background: #3498db; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold;">#{}</span>',
            obj.id
        )
    id_badge.short_description = 'ID'
    
    def user_link(self, obj):
        """用户链接"""
        url = reverse('admin:accounts_user_change', args=[obj.user.id])
        return format_html('<a href="{}">👤 {}</a>', url, obj.user.username)
    user_link.short_description = '用户'
    
    def zone_link(self, obj):
        """专区链接"""
        url = reverse('admin:zones_zone_change', args=[obj.zone.id])
        icon = obj.zone.icon or '🎯'
        return format_html('<a href="{}">{} {}</a>', url, icon, obj.zone.name)
    zone_link.short_description = '专区'
    
    def status_badge(self, obj):
        """状态徽章"""
        status_config = {
            'pending': ('#95a5a6', '⏳ 待处理'),
            'running': ('#f39c12', '🏃 执行中'),
            'success': ('#27ae60', '✅ 成功'),
            'failed': ('#e74c3c', '❌ 失败'),
            'cancelled': ('#34495e', '🚫 已取消'),
        }
        color, label = status_config.get(obj.status, ('#95a5a6', obj.get_status_display()))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold;">{}</span>',
            color, label
        )
    status_badge.short_description = '状态'
    
    def progress_bar(self, obj):
        """进度条"""
        color = '#27ae60' if obj.progress == 100 else '#3498db' if obj.progress > 0 else '#95a5a6'
        return format_html(
            '<div style="width: 100px; background: #ecf0f1; border-radius: 10px; overflow: hidden;">'
            '<div style="width: {}%; background: {}; height: 20px; text-align: center; color: white; font-size: 11px; line-height: 20px; font-weight: bold;">{}</div>'
            '</div>',
            obj.progress, color, f'{obj.progress}%'
        )
    progress_bar.short_description = '进度'
    
    def cost_display(self, obj):
        """费用显示"""
        return format_html(
            '<span style="color: #e74c3c; font-weight: bold;">¥{}</span>',
            obj.cost_amount
        )
    cost_display.short_description = '费用'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%m-%d %H:%M')
    created_at_short.short_description = '创建时间'
    
    def cancel_tasks(self, request, queryset):
        updated = queryset.filter(status__in=['pending', 'running']).update(status='cancelled')
        self.message_user(request, f'已取消 {updated} 个任务')
    cancel_tasks.short_description = '🚫 取消选中任务'
    
    def retry_tasks(self, request, queryset):
        updated = queryset.filter(status='failed').update(status='pending', progress=0)
        self.message_user(request, f'已重试 {updated} 个任务')
    retry_tasks.short_description = '🔄 重试失败任务'
    
    def reset_tasks(self, request, queryset):
        updated = queryset.update(status='pending', progress=0, output_data={}, error_message=None)
        self.message_user(request, f'已重置 {updated} 个任务')
    reset_tasks.short_description = '♻️ 重置选中任务'


@admin.register(TaskLog)
class TaskLogAdmin(admin.ModelAdmin):
    """任务日志"""
    
    list_display = ['id', 'task_link', 'level_badge', 'message_short', 'step', 'created_at_short']
    list_filter = ['level', 'created_at']
    search_fields = ['task__id', 'message']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('📋 日志信息', {
            'fields': ('task', 'level', 'message', 'step')
        }),
        ('📦 额外数据', {
            'fields': ('extra_data',),
            'classes': ('collapse',)
        }),
        ('⏰ 时间', {
            'fields': ('created_at',)
        }),
    )
    
    readonly_fields = ['created_at']
    
    def task_link(self, obj):
        url = reverse('admin:tasks_task_change', args=[obj.task.id])
        return format_html('<a href="{}">任务 #{}</a>', url, obj.task.id)
    task_link.short_description = '任务'
    
    def level_badge(self, obj):
        """日志级别徽章"""
        level_config = {
            'DEBUG': ('#95a5a6', '🔍 调试'),
            'INFO': ('#3498db', 'ℹ️ 信息'),
            'WARNING': ('#f39c12', '⚠️ 警告'),
            'ERROR': ('#e74c3c', '❌ 错误'),
        }
        color, label = level_config.get(obj.level, ('#95a5a6', obj.level))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">{}</span>',
            color, label
        )
    level_badge.short_description = '级别'
    
    def message_short(self, obj):
        if len(obj.message) > 50:
            return obj.message[:50] + '...'
        return obj.message
    message_short.short_description = '消息'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%m-%d %H:%M:%S')
    created_at_short.short_description = '时间'


@admin.register(TaskStatistics)
class TaskStatisticsAdmin(admin.ModelAdmin):
    """任务统计"""
    
    list_display = ['zone', 'date', 'period_type', 'total_tasks', 'success_rate_display', 'total_cost_display', 'avg_duration_display']
    list_filter = ['zone', 'period_type', 'date']
    search_fields = ['zone__name']
    ordering = ['-date']
    date_hierarchy = 'date'
    
    def success_rate_display(self, obj):
        """成功率显示"""
        rate = obj.success_rate
        color = '#27ae60' if rate >= 80 else '#f39c12' if rate >= 60 else '#e74c3c'
        return format_html(
            '<span style="color: {}; font-weight: bold; font-size: 14px;">{:.1f}%</span>',
            color, rate
        )
    success_rate_display.short_description = '成功率'
    
    def total_cost_display(self, obj):
        return format_html(
            '<span style="color: #e74c3c; font-weight: bold;">¥{}</span>',
            obj.total_cost
        )
    total_cost_display.short_description = '总费用'
    
    def avg_duration_display(self, obj):
        """平均时长显示"""
        if obj.avg_duration:
            return f'{obj.avg_duration:.1f}秒'
        return '-'
    avg_duration_display.short_description = '平均时长'
