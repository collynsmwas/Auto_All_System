"""
URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi


def health_check(request):
    """健康检查端点"""
    return JsonResponse({'status': 'healthy'})

# 自定义Admin站点信息
admin.site.site_header = '🚀 Auto All 管理系统'
admin.site.site_title = 'Auto All System'
admin.site.index_title = '系统管理控制台'

# API文档配置
schema_view = get_schema_view(
    openapi.Info(
        title="Auto_All_System API",
        default_version='v1',
        description="自动化任务管理系统API文档",
        terms_of_service="http://www.example.com/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # 健康检查
    path('api/health/', health_check, name='health-check'),
    
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API文档
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API路由
    path('api/v1/', include('apps.accounts.urls')),  # 包含auth和users
    path('api/v1/zones/', include('apps.zones.urls')),
    path('api/v1/tasks/', include('apps.tasks.urls')),
    path('api/v1/cards/', include('apps.cards.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/admin/', include('apps.admin_panel.urls')),
    path('api/v1/plugins/', include('apps.plugins.urls')),  # 插件管理
    path('api/v1/bitbrowser/', include('apps.integrations.bitbrowser.urls')),  # 比特浏览器管理
    path('api/v1/proxies/', include('apps.integrations.proxies.urls')),  # 代理管理
]

# 动态加载插件路由
from apps.plugins.manager import plugin_manager
plugin_urls = plugin_manager.get_plugin_urls()
if plugin_urls:
    urlpatterns += plugin_urls

# 开发环境静态文件服务
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Debug Toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns
