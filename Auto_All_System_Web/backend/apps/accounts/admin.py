"""
用户账户管理 - Admin配置
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import User, UserBalance, BalanceLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """用户管理 - 增强版"""
    
    list_display = ['username_colored', 'email', 'phone', 'role_badge', 'status_badge', 'balance_display', 'created_at_short']
    list_display_links = ['username_colored']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'role', 'created_at']
    search_fields = ['username', 'email', 'phone']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    # 字段集分组
    fieldsets = (
        ('🔐 登录信息', {
            'fields': ('username', 'password', 'email')
        }),
        ('👤 个人信息', {
            'fields': ('phone', 'avatar', 'metadata')
        }),
        ('🎭 角色权限', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('wide',)
        }),
        ('📅 时间信息', {
            'fields': ('last_login', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        ('创建新用户', {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_staff', 'is_superuser'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    
    # 列表页操作
    actions = ['make_active', 'make_inactive', 'make_staff', 'reset_balance']
    
    def username_colored(self, obj):
        """彩色用户名"""
        color = '#e74c3c' if obj.is_superuser else '#3498db' if obj.is_staff else '#95a5a6'
        return format_html(
            '<span style="color: {}; font-weight: bold;">👤 {}</span>',
            color, obj.username
        )
    username_colored.short_description = '用户名'
    
    def role_badge(self, obj):
        """角色徽章"""
        badges = {
            'admin': '<span style="background: #e74c3c; color: white; padding: 3px 8px; border-radius: 4px;">🔴 超级管理员</span>',
            'staff': '<span style="background: #f39c12; color: white; padding: 3px 8px; border-radius: 4px;">🟡 员工</span>',
            'user': '<span style="background: #3498db; color: white; padding: 3px 8px; border-radius: 4px;">🔵 普通用户</span>',
        }
        if obj.is_superuser:
            return mark_safe(badges['admin'])
        elif obj.is_staff:
            return mark_safe(badges['staff'])
        return mark_safe(badges['user'])
    role_badge.short_description = '角色'
    
    def status_badge(self, obj):
        """状态徽章"""
        if obj.is_active:
            return format_html(
                '<span style="color: #27ae60; font-weight: bold;">✅ 激活</span>'
            )
        return format_html(
            '<span style="color: #e74c3c; font-weight: bold;">❌ 禁用</span>'
        )
    status_badge.short_description = '状态'
    
    def balance_display(self, obj):
        """余额显示"""
        try:
            balance = obj.balance
            color = '#27ae60' if balance.balance > 0 else '#95a5a6'
            return format_html(
                '<a href="{}" style="color: {}; font-weight: bold;">💰 ¥{}</a>',
                reverse('admin:accounts_userbalance_change', args=[balance.id]),
                color,
                balance.balance
            )
        except:
            return '未创建'
    balance_display.short_description = '账户余额'
    
    def created_at_short(self, obj):
        """简短时间"""
        return obj.created_at.strftime('%Y-%m-%d %H:%M')
    created_at_short.short_description = '注册时间'
    
    # 批量操作
    def make_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'已激活 {updated} 个用户')
    make_active.short_description = '✅ 激活选中用户'
    
    def make_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'已禁用 {updated} 个用户')
    make_inactive.short_description = '❌ 禁用选中用户'
    
    def make_staff(self, request, queryset):
        updated = queryset.update(is_staff=True)
        self.message_user(request, f'已将 {updated} 个用户设置为管理员')
    make_staff.short_description = '🔑 设置为管理员'
    
    def reset_balance(self, request, queryset):
        for user in queryset:
            if hasattr(user, 'balance'):
                user.balance.balance = 0
                user.balance.save()
        self.message_user(request, f'已重置 {queryset.count()} 个用户的余额')
    reset_balance.short_description = '💰 重置余额为0'


@admin.register(UserBalance)
class UserBalanceAdmin(admin.ModelAdmin):
    """余额管理 - 增强版"""
    
    list_display = ['user_link', 'balance_colored', 'frozen_colored', 'available_display', 'currency', 'last_updated']
    list_display_links = ['user_link']
    search_fields = ['user__username', 'user__email']
    list_filter = ['currency', 'updated_at']
    readonly_fields = ['created_at', 'updated_at', 'available_balance_display']
    
    fieldsets = (
        ('👤 用户信息', {
            'fields': ('user',)
        }),
        ('💰 余额信息', {
            'fields': ('balance', 'frozen_amount', 'available_balance_display', 'currency')
        }),
        ('📅 时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['add_balance_100', 'add_balance_1000', 'freeze_all', 'unfreeze_all']
    
    def user_link(self, obj):
        """用户链接"""
        url = reverse('admin:accounts_user_change', args=[obj.user.id])
        return format_html('<a href="{}" style="font-weight: bold;">👤 {}</a>', url, obj.user.username)
    user_link.short_description = '用户'
    
    def balance_colored(self, obj):
        """彩色余额"""
        color = '#27ae60' if obj.balance > 0 else '#95a5a6'
        return format_html(
            '<span style="color: {}; font-weight: bold; font-size: 16px;">¥{}</span>',
            color, obj.balance
        )
    balance_colored.short_description = '余额'
    
    def frozen_colored(self, obj):
        """彩色冻结金额"""
        color = '#e67e22' if obj.frozen_amount > 0 else '#bdc3c7'
        return format_html(
            '<span style="color: {};">❄️ ¥{}</span>',
            color, obj.frozen_amount
        )
    frozen_colored.short_description = '冻结金额'
    
    def available_display(self, obj):
        """可用余额"""
        available = obj.available_balance
        return format_html(
            '<span style="color: #16a085; font-weight: bold;">💵 ¥{}</span>',
            available
        )
    available_display.short_description = '可用余额'
    
    def available_balance_display(self, obj):
        """可用余额（只读字段）"""
        return f'¥{obj.available_balance}'
    available_balance_display.short_description = '可用余额'
    
    def last_updated(self, obj):
        """最后更新"""
        return obj.updated_at.strftime('%Y-%m-%d %H:%M:%S')
    last_updated.short_description = '最后更新'
    
    # 批量操作
    def add_balance_100(self, request, queryset):
        for balance in queryset:
            balance.add_balance(100, '管理员充值')
        self.message_user(request, f'已为 {queryset.count()} 个账户充值 ¥100')
    add_balance_100.short_description = '💰 充值 ¥100'
    
    def add_balance_1000(self, request, queryset):
        for balance in queryset:
            balance.add_balance(1000, '管理员充值')
        self.message_user(request, f'已为 {queryset.count()} 个账户充值 ¥1000')
    add_balance_1000.short_description = '💰 充值 ¥1000'
    
    def freeze_all(self, request, queryset):
        for balance in queryset:
            balance.freeze_amount(balance.balance, '管理员冻结')
        self.message_user(request, f'已冻结 {queryset.count()} 个账户的全部余额')
    freeze_all.short_description = '❄️ 冻结全部余额'
    
    def unfreeze_all(self, request, queryset):
        for balance in queryset:
            balance.unfreeze_amount(balance.frozen_amount, '管理员解冻')
        self.message_user(request, f'已解冻 {queryset.count()} 个账户的全部余额')
    unfreeze_all.short_description = '🔥 解冻全部余额'


@admin.register(BalanceLog)
class BalanceLogAdmin(admin.ModelAdmin):
    """余额记录 - 增强版"""
    
    list_display = ['id', 'user_link', 'type_badge', 'amount_colored', 'balance_after_display', 'description_short', 'created_at_short']
    list_display_links = ['id']
    list_filter = ['type', 'created_at']
    search_fields = ['user__username', 'description']
    readonly_fields = ['created_at', 'balance_change_display']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('📝 记录信息', {
            'fields': ('user', 'type', 'amount', 'description')
        }),
        ('💰 余额变化', {
            'fields': ('balance_before', 'balance_after', 'balance_change_display')
        }),
        ('🔗 关联信息', {
            'fields': ('related_order_id', 'metadata')
        }),
        ('⏰ 时间信息', {
            'fields': ('created_at',)
        }),
    )
    
    def user_link(self, obj):
        """用户链接"""
        url = reverse('admin:accounts_user_change', args=[obj.user.id])
        return format_html('<a href="{}" style="font-weight: bold;">👤 {}</a>', url, obj.user.username)
    user_link.short_description = '用户'
    
    def type_badge(self, obj):
        """类型徽章"""
        type_colors = {
            'recharge': ('#27ae60', '💰 充值'),
            'consume': ('#e74c3c', '💸 消费'),
            'freeze': ('#3498db', '❄️ 冻结'),
            'unfreeze': ('#f39c12', '🔥 解冻'),
            'refund': ('#9b59b6', '🔄 退款'),
        }
        color, label = type_colors.get(obj.type, ('#95a5a6', obj.get_type_display()))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">{}</span>',
            color, label
        )
    type_badge.short_description = '类型'
    
    def amount_colored(self, obj):
        """彩色金额"""
        if obj.type in ['recharge', 'refund', 'unfreeze']:
            return format_html(
                '<span style="color: #27ae60; font-weight: bold; font-size: 16px;">+¥{}</span>',
                obj.amount
            )
        return format_html(
            '<span style="color: #e74c3c; font-weight: bold; font-size: 16px;">-¥{}</span>',
            obj.amount
        )
    amount_colored.short_description = '金额'
    
    def balance_after_display(self, obj):
        """变化后余额"""
        return format_html(
            '<span style="color: #3498db; font-weight: bold;">¥{}</span>',
            obj.balance_after
        )
    balance_after_display.short_description = '变化后余额'
    
    def balance_change_display(self, obj):
        """余额变化（只读）"""
        change = obj.balance_after - obj.balance_before
        if change > 0:
            return format_html('<span style="color: #27ae60;">+¥{}</span>', change)
        return format_html('<span style="color: #e74c3c;">¥{}</span>', change)
    balance_change_display.short_description = '变化金额'
    
    def description_short(self, obj):
        """简短描述"""
        if len(obj.description) > 30:
            return obj.description[:30] + '...'
        return obj.description
    description_short.short_description = '说明'
    
    def created_at_short(self, obj):
        """简短时间"""
        return obj.created_at.strftime('%m-%d %H:%M')
    created_at_short.short_description = '时间'
