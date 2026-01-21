"""
专区视图
"""
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Zone, ZoneConfig, UserZoneAccess
from .serializers import ZoneSerializer, ZoneConfigSerializer, UserZoneAccessSerializer


class ZoneViewSet(viewsets.ModelViewSet):
    """专区API"""
    
    queryset = Zone.objects.filter(is_active=True)
    serializer_class = ZoneSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """管理员才能创建/修改/删除专区"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=True, methods=['get'])
    def config(self, request, pk=None):
        """获取专区配置"""
        zone = self.get_object()
        configs = ZoneConfig.objects.filter(zone=zone)
        
        # 非管理员不显示敏感配置
        if not request.user.is_staff:
            configs = configs.filter(is_secret=False)
        
        serializer = ZoneConfigSerializer(configs, many=True)
        return Response({
            'code': 200,
            'message': 'Success',
            'data': serializer.data
        })


class UserZoneAccessViewSet(viewsets.ModelViewSet):
    """用户专区权限API"""
    
    queryset = UserZoneAccess.objects.all()
    serializer_class = UserZoneAccessSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """用户只能看到自己的权限"""
        if self.request.user.is_staff:
            return UserZoneAccess.objects.all()
        return UserZoneAccess.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_zones(self, request):
        """获取我可访问的专区"""
        accesses = UserZoneAccess.objects.filter(
            user=request.user,
            is_enabled=True
        )
        
        serializer = self.get_serializer(accesses, many=True)
        return Response({
            'code': 200,
            'message': 'Success',
            'data': serializer.data
        })
