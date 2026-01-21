"""
自动生成剩余的Models和配置文件
运行此脚本快速完成项目结构搭建
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# 需要创建的apps及其配置
APPS_TO_CREATE = {
    'cards': {
        'verbose_name': '虚拟卡管理',
        'has_models': True
    },
    'payments': {
        'verbose_name': '支付管理',
        'has_models': True
    },
    'integrations': {
        'verbose_name': '外部集成',
        'has_models': True
    },
    'admin_panel': {
        'verbose_name': '管理后台',
        'has_models': True
    }
}

# 基础文件模板
INIT_TEMPLATE = """# {module_name}
default_app_config = 'apps.{app_name}.apps.{app_class}Config'
"""

APPS_TEMPLATE = """from django.apps import AppConfig


class {app_class}Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.{app_name}'
    verbose_name = '{verbose_name}'
"""

MODELS_TEMPLATE = """\"\"\"
{verbose_name}模型
\"\"\"
from django.db import models
from django.conf import settings


# TODO: 根据设计文档添加Model类
# 参考: docs/ARCHITECTURE_DESIGN.md 中的数据库设计章节
"""

URLS_TEMPLATE = """\"\"\"
{verbose_name} URL配置
\"\"\"
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
]
"""

def create_file(filepath, content):
    """创建文件"""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✓ 创建: {filepath.relative_to(BASE_DIR)}")

def main():
    print("=" * 60)
    print("开始生成剩余的项目文件...")
    print("=" * 60)
    
    for app_name, config in APPS_TO_CREATE.items():
        print(f"\n处理应用: {app_name}")
        app_path = BASE_DIR / 'apps' / app_name
        
        # 创建app类名
        app_class = ''.join([word.capitalize() for word in app_name.split('_')])
        
        # 创建__init__.py
        init_file = app_path / '__init__.py'
        if not init_file.exists():
            create_file(init_file, INIT_TEMPLATE.format(
                module_name=config['verbose_name'],
                app_name=app_name,
                app_class=app_class
            ))
        
        # 创建apps.py
        apps_file = app_path / 'apps.py'
        if not apps_file.exists():
            create_file(apps_file, APPS_TEMPLATE.format(
                app_class=app_class,
                app_name=app_name,
                verbose_name=config['verbose_name']
            ))
        
        # 创建models.py
        if config['has_models']:
            models_file = app_path / 'models.py'
            if not models_file.exists():
                create_file(models_file, MODELS_TEMPLATE.format(
                    verbose_name=config['verbose_name']
                ))
        
        # 创建urls.py
        urls_file = app_path / 'urls.py'
        if not urls_file.exists():
            create_file(urls_file, URLS_TEMPLATE.format(
                verbose_name=config['verbose_name']
            ))
        
        # 创建其他基础文件
        for filename in ['serializers.py', 'views.py', 'admin.py']:
            file_path = app_path / filename
            if not file_path.exists():
                create_file(file_path, f"# {config['verbose_name']} - {filename}\n")
    
    print("\n" + "=" * 60)
    print("✅ 所有文件生成完成！")
    print("=" * 60)
    print("\n下一步:")
    print("1. 根据设计文档补充各个models.py的内容")
    print("2. 运行: python manage.py makemigrations")
    print("3. 运行: python manage.py migrate")
    print("\n详细说明请查看: SETUP_GUIDE.md")

if __name__ == '__main__':
    main()
