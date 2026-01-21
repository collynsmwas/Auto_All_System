"""
支付相关视图
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import RechargeCard, PaymentConfig, Order
from .serializers import (
    RechargeCardSerializer, RechargeCardCreateSerializer, RechargeCardUseSerializer,
    PaymentConfigSerializer, PaymentConfigPublicSerializer, OrderSerializer
)


class RechargeCardViewSet(viewsets.ModelViewSet):
    """充值卡密管理API（管理员）"""
    
    queryset = RechargeCard.objects.all().select_related('used_by', 'created_by').order_by('-created_at')
    serializer_class = RechargeCardSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        """支持筛选"""
        queryset = super().get_queryset()
        
        # 状态筛选
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # 面值筛选
        amount_filter = self.request.query_params.get('amount')
        if amount_filter:
            queryset = queryset.filter(amount=amount_filter)
        
        # 批次号筛选
        batch_no = self.request.query_params.get('batch_no')
        if batch_no:
            queryset = queryset.filter(batch_no=batch_no)
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def batch_create(self, request):
        """批量生成卡密"""
        serializer = RechargeCardCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            count = serializer.validated_data['count']
            amount = serializer.validated_data['amount']
            expires_days = serializer.validated_data.get('expires_days')
            notes = serializer.validated_data.get('notes', '')
            prefix = serializer.validated_data.get('prefix', '')
            
            # 计算过期时间
            expires_at = None
            if expires_days:
                expires_at = timezone.now() + timedelta(days=expires_days)
            
            # 批量生成
            cards = RechargeCard.batch_generate(
                count=count,
                amount=amount,
                created_by=request.user,
                expires_at=expires_at,
                prefix=prefix
            )
            
            # 更新备注
            if notes:
                RechargeCard.objects.filter(id__in=[c.id for c in cards]).update(notes=notes)
            
            return Response({
                'code': 200,
                'message': f'成功生成 {count} 张卡密',
                'data': {
                    'count': len(cards),
                    'batch_no': cards[0].batch_no if cards else None,
                    'amount': float(amount),
                    'expires_at': expires_at.isoformat() if expires_at else None
                }
            })
        
        return Response({
            'code': 400,
            'message': '参数错误',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def export_batch(self, request):
        """导出批次卡密"""
        batch_no = request.query_params.get('batch_no')
        if not batch_no:
            return Response({
                'code': 400,
                'message': '请提供批次号'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cards = RechargeCard.objects.filter(batch_no=batch_no)
        serializer = self.get_serializer(cards, many=True)
        
        return Response({
            'code': 200,
            'message': 'Success',
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def export_filtered(self, request):
        """批量导出卡密（支持筛选条件）"""
        queryset = self.get_queryset()  # 使用现有的筛选逻辑
        
        # 限制导出数量，防止一次性导出过多
        max_export = 10000
        count = queryset.count()
        
        if count == 0:
            return Response({
                'code': 400,
                'message': '没有符合条件的卡密'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if count > max_export:
            return Response({
                'code': 400,
                'message': f'导出数量超过限制（最多{max_export}张），请添加筛选条件'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 只导出需要的字段
        cards = queryset.values(
            'id', 'card_code', 'amount', 'status', 'batch_no',
            'expires_at', 'created_at', 'notes'
        )
        
        return Response({
            'code': 200,
            'message': f'成功导出 {count} 张卡密',
            'data': {
                'count': count,
                'cards': list(cards)
            }
        })


class RechargeCardUserViewSet(viewsets.GenericViewSet):
    """充值卡密使用API（用户端）"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def use(self, request):
        """使用卡密充值"""
        serializer = RechargeCardUseSerializer(data=request.data)
        
        if serializer.is_valid():
            card_code = serializer.validated_data['card_code']
            
            try:
                # 查找卡密
                card = RechargeCard.objects.get(card_code=card_code)
                
                # 使用卡密
                card.use_card(request.user)
                
                # 获取最新余额
                balance = request.user.balance
                
                return Response({
                    'code': 200,
                    'message': f'充值成功！到账 ¥{card.amount}',
                    'data': {
                        'amount': float(card.amount),
                        'new_balance': float(balance.balance),
                        'card_code': card_code
                    }
                })
            
            except RechargeCard.DoesNotExist:
                return Response({
                    'code': 404,
                    'message': '卡密不存在或已失效'
                }, status=status.HTTP_404_NOT_FOUND)
            
            except ValueError as e:
                return Response({
                    'code': 400,
                    'message': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'code': 400,
            'message': '参数错误',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PaymentConfigViewSet(viewsets.ModelViewSet):
    """支付配置管理API（管理员）"""
    
    queryset = PaymentConfig.objects.all()
    serializer_class = PaymentConfigSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None  # 禁用分页，返回所有配置
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def enabled(self, request):
        """获取启用的支付方式（用户端）"""
        configs = PaymentConfig.objects.filter(is_enabled=True).order_by('sort_order')
        serializer = PaymentConfigPublicSerializer(configs, many=True)
        
        return Response({
            'code': 200,
            'message': 'Success',
            'data': serializer.data
        })


class OrderViewSet(viewsets.ModelViewSet):
    """订单管理API"""
    
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """用户只能查看自己的订单，管理员可以查看所有订单"""
        if self.request.user.is_staff:
            return Order.objects.all().select_related('user')
        return Order.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """取消订单"""
        order = self.get_object()
        
        if order.status not in ['pending', 'processing']:
            return Response({
                'code': 400,
                'message': '订单状态不允许取消'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = 'cancelled'
        order.save()
        
        return Response({
            'code': 200,
            'message': '订单已取消',
            'data': self.get_serializer(order).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def refund(self, request, pk=None):
        """退款（管理员）"""
        order = self.get_object()
        
        if order.status != 'paid':
            return Response({
                'code': 400,
                'message': '只能退款已支付的订单'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # TODO: 实际的退款逻辑
        order.status = 'refunded'
        order.save()
        
        return Response({
            'code': 200,
            'message': '退款成功',
            'data': self.get_serializer(order).data
        })

