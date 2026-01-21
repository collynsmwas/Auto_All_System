"""
插件管理器
负责插件的发现、加载、注册和生命周期管理
"""
import os
import importlib
import logging
from typing import Dict, List, Optional, Type
from pathlib import Path
from django.conf import settings

from .base import BasePlugin, PluginStatus

logger = logging.getLogger(__name__)


class PluginManager:
    """
    插件管理器（单例）
    
    负责：
    1. 自动发现插件
    2. 加载插件
    3. 管理插件生命周期
    4. 提供插件查询接口
    """
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """初始化插件管理器"""
        if self._initialized:
            return
        
        self._plugins: Dict[str, BasePlugin] = {}
        self._plugin_configs: Dict[str, dict] = {}
        self._initialized = True
        
        logger.info("Plugin Manager initialized")
    
    def discover_plugins(self):
        """
        自动发现插件
        
        扫描 backend/plugins/ 目录，查找所有插件应用
        """
        plugins_dir = Path(settings.BASE_DIR) / 'plugins'
        
        if not plugins_dir.exists():
            logger.warning(f"Plugins directory not found: {plugins_dir}")
            return
        
        logger.info(f"Discovering plugins in: {plugins_dir}")
        
        # 遍历plugins目录下的所有子目录
        for plugin_path in plugins_dir.iterdir():
            if not plugin_path.is_dir():
                continue
            
            # 跳过__pycache__等特殊目录
            if plugin_path.name.startswith('_'):
                continue
            
            # 尝试加载插件
            plugin_name = plugin_path.name
            self._load_plugin(plugin_name)
        
        # 加载完成后，自动启用数据库中标记为已启用的插件
        self._restore_plugin_states()
    
    def _load_plugin(self, plugin_name: str):
        """
        加载单个插件
        
        Args:
            plugin_name: 插件名称（目录名）
        """
        try:
            # 导入插件模块
            plugin_module = importlib.import_module(f'plugins.{plugin_name}')
            
            # 查找插件类
            plugin_class = None
            if hasattr(plugin_module, 'Plugin'):
                plugin_class = plugin_module.Plugin
            elif hasattr(plugin_module, 'plugin'):
                plugin_class = type(plugin_module.plugin)
            
            if not plugin_class:
                logger.warning(f"No Plugin class found in {plugin_name}")
                return
            
            # 实例化插件
            if not issubclass(plugin_class, BasePlugin):
                logger.error(f"{plugin_class} is not a subclass of BasePlugin")
                return
            
            plugin = plugin_class()
            
            # 验证依赖
            if not plugin.validate_dependencies():
                logger.error(f"Plugin {plugin_name} has unmet dependencies")
                plugin.status = PluginStatus.ERROR
                return
            
            if not plugin.validate_shared_resources():
                logger.error(f"Plugin {plugin_name} has missing shared resources")
                plugin.status = PluginStatus.ERROR
                return
            
            # 注册插件
            self._plugins[plugin.name] = plugin
            plugin.status = PluginStatus.LOADED
            
            logger.info(f"[OK] Loaded plugin: {plugin.display_name} v{plugin.version}")
            
        except Exception as e:
            logger.error(f"Failed to load plugin {plugin_name}: {e}", exc_info=True)
    
    def register_plugin(self, plugin: BasePlugin):
        """
        手动注册插件
        
        Args:
            plugin: 插件实例
        """
        if not isinstance(plugin, BasePlugin):
            raise TypeError(f"Plugin must be instance of BasePlugin, got {type(plugin)}")
        
        if plugin.name in self._plugins:
            logger.warning(f"Plugin {plugin.name} already registered, overwriting")
        
        self._plugins[plugin.name] = plugin
        logger.info(f"Registered plugin: {plugin.name}")
    
    def get_plugin(self, name: str) -> Optional[BasePlugin]:
        """
        获取插件实例
        
        Args:
            name: 插件名称
            
        Returns:
            BasePlugin: 插件实例，不存在则返回None
        """
        return self._plugins.get(name)
    
    def get_all_plugins(self) -> Dict[str, BasePlugin]:
        """
        获取所有已注册的插件
        
        Returns:
            Dict: {插件名: 插件实例}
        """
        return self._plugins.copy()
    
    def is_plugin_installed(self, name: str) -> bool:
        """
        检查插件是否已安装
        
        Args:
            name: 插件名称
            
        Returns:
            bool: 是否已安装
        """
        plugin = self.get_plugin(name)
        return plugin is not None and plugin.status != PluginStatus.ERROR
    
    def is_plugin_enabled(self, name: str) -> bool:
        """
        检查插件是否已启用
        
        Args:
            name: 插件名称
            
        Returns:
            bool: 是否已启用
        """
        # 从数据库读取状态
        from .models import PluginState
        return PluginState.is_enabled(name)
    
    def install_plugin(self, name: str) -> bool:
        """
        安装插件
        
        Args:
            name: 插件名称
            
        Returns:
            bool: 是否成功
        """
        plugin = self.get_plugin(name)
        if not plugin:
            logger.error(f"Plugin {name} not found")
            return False
        
        try:
            if plugin.install():
                plugin.status = PluginStatus.ACTIVE
                # 持久化安装状态
                from .models import PluginState
                PluginState.set_installed(name, True)
                logger.info(f"Installed plugin: {name}")
                return True
            else:
                plugin.status = PluginStatus.ERROR
                logger.error(f"Failed to install plugin: {name}")
                return False
        except Exception as e:
            plugin.status = PluginStatus.ERROR
            logger.error(f"Error installing plugin {name}: {e}", exc_info=True)
            return False
    
    def uninstall_plugin(self, name: str) -> bool:
        """
        卸载插件
        
        Args:
            name: 插件名称
            
        Returns:
            bool: 是否成功
        """
        plugin = self.get_plugin(name)
        if not plugin:
            logger.error(f"Plugin {name} not found")
            return False
        
        try:
            if plugin.uninstall():
                plugin.status = PluginStatus.DISCOVERED
                logger.info(f"Uninstalled plugin: {name}")
                return True
            else:
                logger.error(f"Failed to uninstall plugin: {name}")
                return False
        except Exception as e:
            logger.error(f"Error uninstalling plugin {name}: {e}", exc_info=True)
            return False
    
    def enable_plugin(self, name: str) -> bool:
        """
        启用插件
        
        Args:
            name: 插件名称
            
        Returns:
            bool: 是否成功
        """
        plugin = self.get_plugin(name)
        if not plugin:
            logger.error(f"Plugin {name} not found")
            return False
        
        if plugin.enable():
            plugin._enabled = True
            # 持久化启用状态
            from .models import PluginState
            PluginState.set_enabled(name, True)
            logger.info(f"Enabled plugin: {name}")
            return True
        else:
            logger.error(f"Failed to enable plugin: {name}")
            return False
    
    def disable_plugin(self, name: str) -> bool:
        """
        禁用插件
        
        Args:
            name: 插件名称
            
        Returns:
            bool: 是否成功
        """
        plugin = self.get_plugin(name)
        if not plugin:
            logger.error(f"Plugin {name} not found")
            return False
        
        if plugin.disable():
            plugin._enabled = False
            # 持久化禁用状态
            from .models import PluginState
            PluginState.set_enabled(name, False)
            logger.info(f"Disabled plugin: {name}")
            return True
        else:
            logger.error(f"Failed to disable plugin: {name}")
            return False
    
    def get_plugin_urls(self) -> List:
        """
        获取所有已启用插件的URL配置
        
        Returns:
            List: URL patterns列表
        """
        urls = []
        for plugin in self._plugins.values():
            if plugin._enabled:
                plugin_urls = plugin.get_urls()
                if plugin_urls:
                    urls.extend(plugin_urls)
        return urls
    
    def get_plugins_info(self) -> List[Dict]:
        """
        获取所有插件的信息
        
        Returns:
            List[Dict]: 插件信息列表
        """
        return [plugin.get_info() for plugin in self._plugins.values()]
    
    def _restore_plugin_states(self):
        """
        从数据库恢复插件状态
        自动启用数据库中标记为已启用的插件
        """
        try:
            from .models import PluginState
            
            # 获取所有已启用的插件
            enabled_plugins = PluginState.objects.filter(enabled=True, installed=True)
            
            for state in enabled_plugins:
                plugin = self.get_plugin(state.name)
                if plugin and not plugin._enabled:
                    # 恢复启用状态
                    if plugin.enable():
                        plugin._enabled = True
                        logger.info(f"Restored enabled state for plugin: {state.name}")
                    else:
                        logger.warning(f"Failed to restore enabled state for plugin: {state.name}")
        except Exception as e:
            logger.error(f"Failed to restore plugin states: {e}", exc_info=True)


# 创建全局插件管理器实例
plugin_manager = PluginManager()

