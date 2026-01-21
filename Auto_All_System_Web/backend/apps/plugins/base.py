"""
插件基类
所有业务插件必须继承此类
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)


class PluginStatus:
    """插件状态常量"""
    DISCOVERED = 'discovered'  # 已发现
    LOADED = 'loaded'          # 已加载
    ACTIVE = 'active'          # 已激活
    DISABLED = 'disabled'      # 已禁用
    ERROR = 'error'            # 错误


class BasePlugin(ABC):
    """
    插件基类
    
    所有业务插件必须继承此类并实现必要的方法
    """
    
    # 插件元数据（子类必须定义）
    name: str = None                    # 插件名称（英文）
    display_name: str = None            # 显示名称（中文）
    version: str = '1.0.0'              # 插件版本
    description: str = ''               # 插件描述
    author: str = ''                    # 作者
    dependencies: List[str] = []        # 依赖的其他插件
    shared_resources: List[str] = []    # 依赖的共享资源
    
    def __init__(self):
        """初始化插件"""
        if not self.name:
            raise ValueError(f"Plugin {self.__class__.__name__} must define 'name'")
        if not self.display_name:
            raise ValueError(f"Plugin {self.__class__.__name__} must define 'display_name'")
        
        self.status = PluginStatus.DISCOVERED
        self._enabled = False
        self.logger = logging.getLogger(f'plugin.{self.name}')
    
    @abstractmethod
    def install(self) -> bool:
        """
        安装插件
        
        执行以下操作：
        1. 数据库迁移
        2. 初始化数据
        3. 创建必要的配置
        
        Returns:
            bool: 安装是否成功
        """
        pass
    
    @abstractmethod
    def uninstall(self) -> bool:
        """
        卸载插件
        
        执行以下操作：
        1. 清理数据
        2. 移除配置
        3. 回滚迁移（可选）
        
        Returns:
            bool: 卸载是否成功
        """
        pass
    
    @abstractmethod
    def enable(self) -> bool:
        """
        启用插件
        
        Returns:
            bool: 是否成功
        """
        pass
    
    @abstractmethod
    def disable(self) -> bool:
        """
        禁用插件
        
        Returns:
            bool: 是否成功
        """
        pass
    
    def get_urls(self) -> List:
        """
        获取插件的URL配置
        
        Returns:
            List: Django URL patterns
        """
        return []
    
    def get_models(self) -> List:
        """
        获取插件的数据模型
        
        Returns:
            List: Django Model类列表
        """
        return []
    
    def get_admin_classes(self) -> Dict:
        """
        获取插件的Admin配置
        
        Returns:
            Dict: {Model: AdminClass} 映射
        """
        return {}
    
    def get_settings(self) -> Dict[str, Any]:
        """
        获取插件的配置项
        
        Returns:
            Dict: 配置项字典
        """
        return {}
    
    def validate_dependencies(self) -> bool:
        """
        验证插件依赖是否满足
        
        Returns:
            bool: 依赖是否都已安装
        """
        from .manager import plugin_manager
        
        for dep in self.dependencies:
            if not plugin_manager.is_plugin_installed(dep):
                self.logger.error(f"Missing dependency: {dep}")
                return False
        
        return True
    
    def validate_shared_resources(self) -> bool:
        """
        验证共享资源是否可用
        
        Returns:
            bool: 共享资源是否都可用
        """
        from django.apps import apps
        
        for resource in self.shared_resources:
            try:
                # 尝试通过app_label获取
                apps.get_app_config(resource)
            except LookupError:
                # 如果失败，尝试作为完整的app name
                try:
                    # 查找所有已安装的app
                    found = False
                    for app_config in apps.get_app_configs():
                        if app_config.label == resource or app_config.name == resource:
                            found = True
                            break
                    
                    if not found:
                        self.logger.error(f"Missing shared resource: {resource}")
                        return False
                except Exception as e:
                    self.logger.error(f"Error validating shared resource {resource}: {e}")
                    return False
        
        return True
    
    def get_meta(self) -> Dict[str, Any]:
        """
        获取插件元数据
        
        Returns:
            Dict: 插件元数据字典
        """
        return {
            'name': self.name,
            'display_name': self.display_name,
            'version': self.version,
            'description': self.description,
            'author': self.author,
            'status': self.status,
            'enabled': self._enabled,
            'dependencies': self.dependencies,
            'shared_resources': self.shared_resources,
            'category': getattr(self, 'category', 'General'),
            'icon': getattr(self, 'icon', 'el-icon-box'),
        }
    
    def get_info(self) -> Dict[str, Any]:
        """
        获取插件信息（get_meta的别名）
        
        Returns:
            Dict: 插件信息字典
        """
        return self.get_meta()
    
    def __str__(self):
        return f"{self.display_name} v{self.version}"
    
    def __repr__(self):
        return f"<Plugin: {self.name} ({self.status})>"

