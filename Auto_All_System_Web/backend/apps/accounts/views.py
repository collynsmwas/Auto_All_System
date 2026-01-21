"""
用户账户视图
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import UserBalance, BalanceLog
from .serializers import (
    UserSerializer, UserRegisterSerializer, UserLoginSerializer,
    UserBalanceSerializer, BalanceLogSerializer, RechargeSerializer
)

User = get_user_model()


class AuthViewSet(viewsets.GenericViewSet):
    """认证相关API"""
    
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """用户注册"""
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # 生成JWT Token
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'code': 201,
                'message': '注册成功',
                'data': {
                    'user': UserSerializer(user).data,
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'code': 400,
            'message': '注册失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """用户登录"""
        serializer = UserLoginSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # 生成JWT Token
            refresh = RefreshToken.for_user(user)
            
            # 更新最后登录时间
            from django.utils import timezone
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            return Response({
                'code': 200,
                'message': '登录成功',
                'data': {
                    'user': UserSerializer(user).data,
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                }
            })
        
        return Response({
            'code': 400,
            'message': '登录失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """用户登出"""
        return Response({
            'code': 200,
            'message': '登出成功'
        })


class UserViewSet(viewsets.ModelViewSet):
    """用户管理API"""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """普通用户只能看到自己"""
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """获取当前用户信息"""
        serializer = self.get_serializer(request.user)
        user_data = serializer.data
        
        # 获取用户余额
        try:
            balance_obj = UserBalance.objects.get(user=request.user)
            user_data['balance'] = str(balance_obj.balance)
        except UserBalance.DoesNotExist:
            # 如果用户没有余额记录，创建一个
            balance_obj = UserBalance.objects.create(user=request.user, balance=0.00)
            user_data['balance'] = '0.00'
        
        return Response({
            'code': 200,
            'message': 'Success',
            'data': user_data
        })
    
    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        """更新个人资料"""
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'code': 200,
                'message': '更新成功',
                'data': serializer.data
            })
        
        return Response({
            'code': 400,
            'message': '更新失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reset_password(self, request, pk=None):
        """重置用户密码（管理员）"""
        user = self.get_object()
        password = request.data.get('password')
        
        if not password:
            return Response({
                'code': 400,
                'message': '请提供新密码'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(password)
        user.save()
        
        return Response({
            'code': 200,
            'message': '密码重置成功'
        })


class UserBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    """用户余额API"""
    
    queryset = UserBalance.objects.all()
    serializer_class = UserBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """用户只能查看自己的余额"""
        if self.request.user.is_staff:
            return UserBalance.objects.all()
        return UserBalance.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_balance(self, request):
        """获取我的余额"""
        balance = request.user.balance
        serializer = self.get_serializer(balance)
        return Response({
            'code': 200,
            'message': 'Success',
            'data': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def recharge(self, request):
        """充值"""
        serializer = RechargeSerializer(data=request.data)
        
        if serializer.is_valid():
            amount = serializer.validated_data['amount']
            payment_method = serializer.validated_data['payment_method']
            
            # TODO: 集成支付网关
            # 这里暂时直接充值（演示用）
            balance = request.user.balance
            balance.add_balance(amount, f'充值-{payment_method}')
            
            return Response({
                'code': 200,
                'message': '充值成功',
                'data': {
                    'amount': float(amount),
                    'new_balance': float(balance.balance)
                }
            })
        
        return Response({
            'code': 400,
            'message': '充值失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def logs(self, request):
        """获取余额变动记录"""
        logs = BalanceLog.objects.filter(user=request.user)
        
        # 分页
        page = self.paginate_queryset(logs)
        if page is not None:
            serializer = BalanceLogSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = BalanceLogSerializer(logs, many=True)
        return Response({
            'code': 200,
            'message': 'Success',
            'data': serializer.data
        })
