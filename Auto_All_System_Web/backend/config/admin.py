"""
自定义Admin站点配置
"""
from django.contrib import admin
from django.contrib.admin import AdminSite


class AutoAllAdminSite(AdminSite):
    """自定义Admin站点"""
    
    # 站点标题和品牌
    site_title = 'Auto All System'
    site_header = '🚀 Auto All 管理系统'
    index_title = '系统管理控制台'
    
    # 启用视图权限
    enable_nav_sidebar = True


# 替换默认的Admin站点
admin_site = AutoAllAdminSite(name='admin')

# 注册Django内置模型
from django.contrib.auth.models import Group
from django.contrib.sessions.models import Session

admin_site.register(Group, admin.ModelAdmin)
