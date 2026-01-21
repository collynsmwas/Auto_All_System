"""
代理管理视图
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import re
from .models import Proxy
from .serializers import (
    ProxySerializer, ProxyCreateSerializer,
    ProxyBatchImportSerializer, ProxyTestSerializer
)
from apps.integrations.bitbrowser.api import BitBrowserAPI


class ProxyViewSet(viewsets.ModelViewSet):
    """代理管理视图集"""
    
    queryset = Proxy.objects.all()
    serializer_class = ProxySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """过滤查询集"""
        queryset = super().get_queryset()
        
        # 按状态过滤
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # 按国家过滤
        country = self.request.query_params.get('country')
        if country:
            queryset = queryset.filter(country=country)
        
        # 按代理类型过滤
        proxy_type = self.request.query_params.get('proxy_type')
        if proxy_type:
            queryset = queryset.filter(proxy_type=proxy_type)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def batch_import(self, request):
        """批量导入代理"""
        serializer = ProxyBatchImportSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        proxy_text = serializer.validated_data['proxy_text']
        lines = proxy_text.strip().split('\n')
        
        success_count = 0
        failed_count = 0
        errors = []
        
        for line in lines:
            line = line.strip()
            
            # 跳过空行和注释
            if not line or line.startswith('#'):
                continue
            
            try:
                parsed = self._parse_proxy_line(line)
                if parsed:
                    Proxy.objects.create(**parsed)
                    success_count += 1
                else:
                    failed_count += 1
                    errors.append({'line': line, 'error': '格式不正确'})
            except Exception as e:
                failed_count += 1
                errors.append({'line': line, 'error': str(e)})
        
        return Response({
            'success': True,
            'data': {
                'total': len(lines),
                'success': success_count,
                'failed': failed_count,
                'errors': errors
            }
        })
    
    def _parse_proxy_line(self, line: str) -> dict:
        """
        解析代理行
        支持格式:
        - socks5://user:pass@host:port
        - http://host:port
        - host:port
        """
        # 格式1: protocol://user:pass@host:port
        match = re.match(r'^(socks5|http|https)://([^:]+):([^@]+)@([^:]+):(\d+)$', line)
        if match:
            return {
                'proxy_type': match.group(1),
                'username': match.group(2),
                'password': match.group(3),
                'host': match.group(4),
                'port': int(match.group(5))
            }
        
        # 格式2: protocol://host:port
        match = re.match(r'^(socks5|http|https)://([^:]+):(\d+)$', line)
        if match:
            return {
                'proxy_type': match.group(1),
                'host': match.group(2),
                'port': int(match.group(3))
            }
        
        # 格式3: host:port (默认socks5)
        match = re.match(r'^([^:]+):(\d+)$', line)
        if match:
            return {
                'proxy_type': 'socks5',
                'host': match.group(1),
                'port': int(match.group(2))
            }
        
        return None
    
    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        """测试单个代理"""
        proxy = self.get_object()
        
        try:
            # 使用比特浏览器API测试代理
            api = BitBrowserAPI()
            result = api.check_proxy(
                host=proxy.host,
                port=proxy.port,
                proxy_type=proxy.proxy_type,
                username=proxy.username or '',
                password=proxy.password or '',
                ip_check_service='ip123in'
            )
            
            if result.get('success'):
                proxy_data = result.get('data', {}).get('data', {})
                
                # 更新代理信息
                proxy.status = 'active'
                proxy.country = proxy_data.get('countryName', '')
                proxy.region = proxy_data.get('regionName', '')
                proxy.city = proxy_data.get('city', '')
                proxy.last_check_at = timezone.now()
                proxy.save()
                
                return Response({
                    'success': True,
                    'data': {
                        'ip': proxy_data.get('ip'),
                        'country': proxy_data.get('countryName'),
                        'city': proxy_data.get('city'),
                        'timezone': proxy_data.get('timeZone')
                    }
                })
            else:
                proxy.status = 'inactive'
                proxy.last_check_at = timezone.now()
                proxy.save()
                
                return Response({
                    'success': False,
                    'message': result.get('msg', '测试失败')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            proxy.status = 'inactive'
            proxy.last_check_at = timezone.now()
            proxy.save()
            
            return Response({
                'success': False,
                'message': f'测试失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def test_connection(self, request):
        """测试代理连接（不保存）"""
        serializer = ProxyTestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            api = BitBrowserAPI()
            result = api.check_proxy(
                host=data['host'],
                port=data['port'],
                proxy_type=data['proxy_type'],
                username=data.get('username', ''),
                password=data.get('password', ''),
                ip_check_service='ip123in'
            )
            
            if result.get('success'):
                proxy_data = result.get('data', {}).get('data', {})
                return Response({
                    'success': True,
                    'data': {
                        'ip': proxy_data.get('ip'),
                        'country': proxy_data.get('countryName'),
                        'city': proxy_data.get('city'),
                        'timezone': proxy_data.get('timeZone')
                    }
                })
            else:
                return Response({
                    'success': False,
                    'message': result.get('msg', '测试失败')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'测试失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def batch_test(self, request):
        """批量测试代理"""
        proxy_ids = request.data.get('proxy_ids', [])
        
        if not proxy_ids:
            return Response({
                'success': False,
                'message': '请提供代理ID列表'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        proxies = Proxy.objects.filter(id__in=proxy_ids)
        results = []
        
        for proxy in proxies:
            try:
                api = BitBrowserAPI()
                result = api.check_proxy(
                    host=proxy.host,
                    port=proxy.port,
                    proxy_type=proxy.proxy_type,
                    username=proxy.username or '',
                    password=proxy.password or '',
                    ip_check_service='ip123in'
                )
                
                if result.get('success'):
                    proxy.status = 'active'
                    proxy.last_check_at = timezone.now()
                    proxy.save()
                    results.append({
                        'proxy_id': str(proxy.id),
                        'status': 'success'
                    })
                else:
                    proxy.status = 'inactive'
                    proxy.last_check_at = timezone.now()
                    proxy.save()
                    results.append({
                        'proxy_id': str(proxy.id),
                        'status': 'failed',
                        'error': result.get('msg')
                    })
            except Exception as e:
                proxy.status = 'inactive'
                proxy.last_check_at = timezone.now()
                proxy.save()
                results.append({
                    'proxy_id': str(proxy.id),
                    'status': 'error',
                    'error': str(e)
                })
        
        return Response({
            'success': True,
            'data': results
        })

