"""
Google Business插件URL配置
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    GoogleAccountViewSet,
    GoogleCardInfoViewSet,
    GoogleTaskViewSet,
    StatisticsView,
    SettingsViewSet,
)

# 创建路由器
router = DefaultRouter()

# 注册ViewSets（RESTful风格）
router.register(r'accounts', GoogleAccountViewSet, basename='google-account')
router.register(r'cards', GoogleCardInfoViewSet, basename='google-card')
router.register(r'tasks', GoogleTaskViewSet, basename='google-task')
router.register(r'statistics', StatisticsView, basename='google-statistics')
router.register(r'settings', SettingsViewSet, basename='google-settings')

# URL patterns
urlpatterns = [
    # 路由器生成的路由（所有RESTful端点）
    path('', include(router.urls)),
]

# ==================== API端点说明 ====================
# 
# 【账号管理】
# GET    /api/v1/plugins/google-business/accounts/                 - 获取账号列表
# POST   /api/v1/plugins/google-business/accounts/                 - 创建单个账号
# GET    /api/v1/plugins/google-business/accounts/{id}/            - 获取账号详情
# PUT    /api/v1/plugins/google-business/accounts/{id}/            - 更新账号信息
# DELETE /api/v1/plugins/google-business/accounts/{id}/            - 删除账号
# POST   /api/v1/plugins/google-business/accounts/import_accounts/ - 批量导入账号
# POST   /api/v1/plugins/google-business/accounts/bulk_delete/     - 批量删除账号
# POST   /api/v1/plugins/google-business/accounts/export/          - 导出账号
#
# 【卡信息管理】
# GET    /api/v1/plugins/google-business/cards/                    - 获取卡列表
# POST   /api/v1/plugins/google-business/cards/                    - 添加卡信息
# GET    /api/v1/plugins/google-business/cards/{id}/               - 获取卡详情
# PUT    /api/v1/plugins/google-business/cards/{id}/               - 更新卡信息
# DELETE /api/v1/plugins/google-business/cards/{id}/               - 删除卡信息
# POST   /api/v1/plugins/google-business/cards/import_cards/       - 批量导入卡信息
#
# 【任务管理】
# GET    /api/v1/plugins/google-business/tasks/                    - 获取任务列表
# POST   /api/v1/plugins/google-business/tasks/                    - 创建任务
# GET    /api/v1/plugins/google-business/tasks/{id}/               - 获取任务详情
# POST   /api/v1/plugins/google-business/tasks/{id}/cancel/        - 取消任务
# POST   /api/v1/plugins/google-business/tasks/{id}/pause/         - 暂停任务
# POST   /api/v1/plugins/google-business/tasks/{id}/resume/        - 恢复任务
# POST   /api/v1/plugins/google-business/tasks/{id}/retry/         - 重试失败项
# GET    /api/v1/plugins/google-business/tasks/{id}/log/           - 获取任务日志
# GET    /api/v1/plugins/google-business/tasks/{id}/accounts/      - 获取任务的账号列表
#
# 【统计和配置】
# GET    /api/v1/plugins/google-business/statistics/overview/      - 获取统计数据
# GET    /api/v1/plugins/google-business/statistics/pricing/       - 获取定价信息
# GET    /api/v1/plugins/google-business/settings/                 - 获取设置
# PUT    /api/v1/plugins/google-business/settings/{key}/           - 更新设置
#

