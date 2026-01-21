"""
虚拟卡视图
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from .models import Card, CardUsageLog, CardPoolType
from .serializers import CardSerializer, CardUsageLogSerializer, CardImportSerializer


class CardViewSet(viewsets.ModelViewSet):
    """虚拟卡API"""
    
    queryset = Card.objects.all()
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'pool_type', 'owner_user']
    
    def get_queryset(self):
        """
        权限控制：
        1. 超级管理员可以看到所有卡
        2. 普通管理员/用户只能看到公共卡池的卡和自己的私有卡
        """
        user = self.request.user
        
        # 超级管理员能看到所有卡
        if user.is_superuser:
            return Card.objects.all().select_related('owner_user')
        
        # 普通用户/普通管理员：公共卡池 + 自己的私有卡
        return Card.objects.filter(
            models.Q(pool_type=CardPoolType.PUBLIC) |
            models.Q(owner_user=user)
        ).select_related('owner_user')
    
    def perform_create(self, serializer):
        """创建虚拟卡"""
        # 如果是私有卡，自动设置所有者
        if serializer.validated_data.get('pool_type') == CardPoolType.PRIVATE:
            serializer.save(owner_user=self.request.user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """获取可用的虚拟卡列表"""
        cards = self.get_queryset().filter(status='available')
        
        page = self.paginate_queryset(cards)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(cards, many=True)
        return Response({
            'code': 200,
            'message': 'Success',
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def my_cards(self, request):
        """获取我的私有卡"""
        cards = Card.objects.filter(owner_user=request.user)
        
        serializer = self.get_serializer(cards, many=True)
        return Response({
            'code': 200,
            'message': 'Success',
            'data': {
                'cards': serializer.data,
                'statistics': {
                    'total': cards.count(),
                    'available': cards.filter(status='available').count(),
                    'used': cards.filter(status='used').count(),
                }
            }
        })
    
    @action(detail=False, methods=['post'])
    def import_cards(self, request):
        """批量导入虚拟卡"""
        serializer = CardImportSerializer(data=request.data)
        
        if serializer.is_valid():
            cards_data = serializer.validated_data['cards_data']
            pool_type = serializer.validated_data['pool_type']
            
            success_count = 0
            failed_count = 0
            errors = []
            
            for card_data in cards_data:
                try:
                    # 自动识别卡类型
                    card_number = card_data['card_number']
                    card_type = card_data.get('card_type')
                    if not card_type or card_type == 'visa': # 默认或没传时自动识别
                        if card_number.startswith('4'):
                            card_type = 'visa'
                        elif card_number.startswith('5'):
                            card_type = 'mastercard'
                        else:
                            card_type = card_data.get('card_type', 'other')

                    Card.objects.create(
                        card_number=card_number,
                        card_holder=card_data.get('card_holder', ''),
                        expiry_month=card_data['expiry_month'],
                        expiry_year=card_data['expiry_year'],
                        cvv=card_data['cvv'],
                        card_type=card_type,
                        bank_name=card_data.get('bank_name', ''),
                        balance=card_data.get('balance', 0.00),
                        pool_type=pool_type,
                        owner_user=request.user if pool_type == 'private' else None,
                        status='available',
                        notes=card_data.get('notes', '')
                    )
                    success_count += 1
                except Exception as e:
                    failed_count += 1
                    errors.append({
                        'card_number': card_data.get('card_number', 'unknown'),
                        'error': str(e)
                    })
            
            return Response({
                'code': 200,
                'message': '导入完成',
                'data': {
                    'success': success_count,
                    'failed': failed_count,
                    'total': len(cards_data),
                    'errors': errors
                }
            })
        
        return Response({
            'code': 400,
            'message': '导入失败',
            'data': {
                'errors': serializer.errors
            }
        }, status=status.HTTP_400_BAD_REQUEST)


class CardUsageLogViewSet(viewsets.ReadOnlyModelViewSet):
    """卡使用记录API"""
    
    queryset = CardUsageLog.objects.all()
    serializer_class = CardUsageLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """用户只能查看自己的使用记录"""
        if self.request.user.is_staff:
            return CardUsageLog.objects.all()
        return CardUsageLog.objects.filter(user=self.request.user)
