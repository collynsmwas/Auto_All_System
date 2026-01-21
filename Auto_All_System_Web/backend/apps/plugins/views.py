"""
插件管理API视图
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from .manager import plugin_manager
import logging

logger = logging.getLogger(__name__)


class PluginManagementViewSet(viewsets.ViewSet):
    """
    插件管理ViewSet
    
    提供插件的查询、启用、禁用、配置等功能
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def list(self, request):
        """
        获取所有插件列表
        
        返回所有已注册的插件信息，包括状态、版本、依赖等
        """
        try:
            plugins = plugin_manager.get_all_plugins()
            plugin_list = []
            
            for name, plugin in plugins.items():
                # 获取插件元数据
                meta = plugin.get_meta()
                
                # 获取插件状态
                is_enabled = plugin_manager.is_plugin_enabled(name)
                
                # 检查依赖
                dependencies_met = plugin.validate_dependencies()
                
                plugin_info = {
                    'name': name,
                    'display_name': meta.get('display_name', name),
                    'version': meta.get('version', '1.0.0'),
                    'author': meta.get('author', 'Unknown'),
                    'description': meta.get('description', ''),
                    'enabled': is_enabled,
                    'installed': True,  # 已加载的插件都是已安装的
                    'dependencies_met': dependencies_met,
                    'dependencies': meta.get('dependencies', []),
                    'category': meta.get('category', 'General'),
                    'icon': meta.get('icon', 'el-icon-box'),
                    'settings_available': hasattr(plugin, 'get_settings'),
                }
                
                plugin_list.append(plugin_info)
            
            return Response({
                'success': True,
                'data': plugin_list,
                'total': len(plugin_list),
                'message': '获取插件列表成功'
            })
            
        except Exception as e:
            logger.error(f"获取插件列表失败: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'message': f'获取插件列表失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def retrieve(self, request, pk=None):
        """
        获取插件详细信息
        
        :param pk: 插件名称
        """
        try:
            plugin = plugin_manager.get_plugin(pk)
            if not plugin:
                return Response({
                    'success': False,
                    'message': f'插件 {pk} 不存在'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # 获取插件元数据
            meta = plugin.get_meta()
            
            # 获取插件状态
            is_enabled = plugin_manager.is_plugin_enabled(pk)
            
            # 检查依赖
            dependencies_met = plugin.validate_dependencies()
            
            # 获取插件URL
            urls = plugin.get_urls() if hasattr(plugin, 'get_urls') else []
            
            # 获取插件设置
            settings = {}
            if hasattr(plugin, 'get_settings'):
                settings = plugin.get_settings()
            
            plugin_detail = {
                'name': pk,
                'display_name': meta.get('display_name', pk),
                'version': meta.get('version', '1.0.0'),
                'author': meta.get('author', 'Unknown'),
                'description': meta.get('description', ''),
                'long_description': meta.get('long_description', meta.get('description', '')),
                'enabled': is_enabled,
                'installed': True,
                'dependencies_met': dependencies_met,
                'dependencies': meta.get('dependencies', []),
                'category': meta.get('category', 'General'),
                'icon': meta.get('icon', 'el-icon-box'),
                'homepage': meta.get('homepage', ''),
                'documentation': meta.get('documentation', ''),
                'support': meta.get('support', ''),
                'urls_count': len(urls),
                'has_settings': hasattr(plugin, 'get_settings'),
                'settings': settings,
            }
            
            return Response({
                'success': True,
                'data': plugin_detail,
                'message': '获取插件详情成功'
            })
            
        except Exception as e:
            logger.error(f"获取插件详情失败: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'message': f'获取插件详情失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def enable(self, request, pk=None):
        """
        启用插件
        
        :param pk: 插件名称
        """
        try:
            # 检查插件是否存在
            plugin = plugin_manager.get_plugin(pk)
            if not plugin:
                return Response({
                    'success': False,
                    'message': f'插件 {pk} 不存在'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # 检查是否已启用
            if plugin_manager.is_plugin_enabled(pk):
                return Response({
                    'success': True,
                    'message': f'插件 {pk} 已经处于启用状态'
                })
            
            # 检查依赖
            if not plugin.validate_dependencies():
                return Response({
                    'success': False,
                    'message': f'插件 {pk} 的依赖不满足，无法启用'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 启用插件
            success = plugin_manager.enable_plugin(pk)
            
            if success:
                logger.info(f"插件 {pk} 已被用户 {request.user.username} 启用")
                return Response({
                    'success': True,
                    'message': f'插件 {pk} 启用成功'
                })
            else:
                return Response({
                    'success': False,
                    'message': f'插件 {pk} 启用失败'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            logger.error(f"启用插件失败: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'message': f'启用插件失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def disable(self, request, pk=None):
        """
        禁用插件
        
        :param pk: 插件名称
        """
        try:
            # 检查插件是否存在
            plugin = plugin_manager.get_plugin(pk)
            if not plugin:
                return Response({
                    'success': False,
                    'message': f'插件 {pk} 不存在'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # 检查是否已禁用
            if not plugin_manager.is_plugin_enabled(pk):
                return Response({
                    'success': True,
                    'message': f'插件 {pk} 已经处于禁用状态'
                })
            
            # 禁用插件
            success = plugin_manager.disable_plugin(pk)
            
            if success:
                logger.info(f"插件 {pk} 已被用户 {request.user.username} 禁用")
                return Response({
                    'success': True,
                    'message': f'插件 {pk} 禁用成功'
                })
            else:
                return Response({
                    'success': False,
                    'message': f'插件 {pk} 禁用失败'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            logger.error(f"禁用插件失败: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'message': f'禁用插件失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        获取插件统计信息
        """
        try:
            plugins = plugin_manager.get_all_plugins()
            
            total_count = len(plugins)
            enabled_count = sum(1 for name in plugins if plugin_manager.is_plugin_enabled(name))
            disabled_count = total_count - enabled_count
            
            # 按分类统计
            categories = {}
            for name, plugin in plugins.items():
                meta = plugin.get_meta()
                category = meta.get('category', 'General')
                categories[category] = categories.get(category, 0) + 1
            
            return Response({
                'success': True,
                'data': {
                    'total': total_count,
                    'enabled': enabled_count,
                    'disabled': disabled_count,
                    'categories': categories,
                },
                'message': '获取插件统计成功'
            })
            
        except Exception as e:
            logger.error(f"获取插件统计失败: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'message': f'获取插件统计失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'], url_path='settings')
    def plugin_settings(self, request, pk=None):
        """
        获取插件配置
        
        :param pk: 插件名称
        """
        try:
            plugin = plugin_manager.get_plugin(pk)
            if not plugin:
                return Response({
                    'success': False,
                    'message': f'插件 {pk} 不存在'
                }, status=status.HTTP_404_NOT_FOUND)
            
            if not hasattr(plugin, 'get_settings'):
                return Response({
                    'success': False,
                    'message': f'插件 {pk} 不支持配置'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            settings = plugin.get_settings()
            
            return Response({
                'success': True,
                'data': settings,
                'message': '获取插件配置成功'
            })
            
        except Exception as e:
            logger.error(f"获取插件配置失败: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'message': f'获取插件配置失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post', 'put'])
    def update_settings(self, request, pk=None):
        """
        更新插件配置
        
        :param pk: 插件名称
        """
        try:
            plugin = plugin_manager.get_plugin(pk)
            if not plugin:
                return Response({
                    'success': False,
                    'message': f'插件 {pk} 不存在'
                }, status=status.HTTP_404_NOT_FOUND)
            
            if not hasattr(plugin, 'update_settings'):
                return Response({
                    'success': False,
                    'message': f'插件 {pk} 不支持配置更新'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            settings_data = request.data.get('settings', {})
            
            # 更新配置
            success = plugin.update_settings(settings_data)
            
            if success:
                logger.info(f"插件 {pk} 的配置已被用户 {request.user.username} 更新")
                return Response({
                    'success': True,
                    'message': f'插件 {pk} 配置更新成功'
                })
            else:
                return Response({
                    'success': False,
                    'message': f'插件 {pk} 配置更新失败'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            logger.error(f"更新插件配置失败: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'message': f'更新插件配置失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def reload(self, request):
        """
        重新加载所有插件
        
        重新扫描插件目录并加载插件
        """
        try:
            # 重新发现并加载插件
            plugin_manager.discover_plugins()
            
            for name in plugin_manager.get_all_plugins().keys():
                plugin_manager.load_plugin(name)
            
            logger.info(f"所有插件已被用户 {request.user.username} 重新加载")
            
            return Response({
                'success': True,
                'message': '插件重新加载成功'
            })
            
        except Exception as e:
            logger.error(f"重新加载插件失败: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'message': f'重新加载插件失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

