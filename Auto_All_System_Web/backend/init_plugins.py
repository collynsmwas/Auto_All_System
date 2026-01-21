#!/usr/bin/env python
"""
插件初始化脚本
自动启用所有已安装的插件
"""
import os
import sys
import django

# 设置Django环境
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

from apps.plugins.manager import plugin_manager
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_plugins():
    """初始化并启用所有插件"""
    logger.info("=" * 60)
    logger.info("开始初始化插件...")
    logger.info("=" * 60)
    
    # 1. 发现插件
    plugin_manager.discover_plugins()
    plugins = plugin_manager.get_all_plugins()
    
    logger.info(f"\n发现 {len(plugins)} 个插件:")
    for name, plugin in plugins.items():
        meta = plugin.get_meta()
        logger.info(f"  - {meta['display_name']} ({name}) v{meta['version']}")
    
    # 2. 安装并启用所有插件
    logger.info("\n开始安装和启用插件...")
    
    for name, plugin in plugins.items():
        meta = plugin.get_meta()
        display_name = meta['display_name']
        
        try:
            # 检查是否已启用
            if plugin_manager.is_plugin_enabled(name):
                logger.info(f"✓ {display_name} 已启用")
                continue
            
            # 安装插件
            logger.info(f"正在安装 {display_name}...")
            if not plugin_manager.install_plugin(name):
                logger.error(f"✗ {display_name} 安装失败")
                continue
            
            # 启用插件
            logger.info(f"正在启用 {display_name}...")
            if plugin_manager.enable_plugin(name):
                logger.info(f"✓ {display_name} 启用成功")
            else:
                logger.error(f"✗ {display_name} 启用失败")
                
        except Exception as e:
            logger.error(f"✗ {display_name} 初始化失败: {e}", exc_info=True)
    
    # 3. 显示最终状态
    logger.info("\n" + "=" * 60)
    logger.info("插件状态汇总:")
    logger.info("=" * 60)
    
    for name, plugin in plugins.items():
        meta = plugin.get_meta()
        enabled = plugin_manager.is_plugin_enabled(name)
        status_icon = "✓" if enabled else "✗"
        status_text = "已启用" if enabled else "已禁用"
        logger.info(f"{status_icon} {meta['display_name']}: {status_text}")
    
    logger.info("=" * 60)
    logger.info("插件初始化完成!")
    logger.info("=" * 60)


if __name__ == '__main__':
    init_plugins()

