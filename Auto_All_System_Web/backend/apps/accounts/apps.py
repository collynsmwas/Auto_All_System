from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'
    verbose_name = '用户账户管理'
    
    def ready(self):
        # 导入signals
        import apps.accounts.signals
