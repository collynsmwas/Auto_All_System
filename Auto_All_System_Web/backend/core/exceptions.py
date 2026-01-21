"""
自定义异常处理
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    自定义异常处理器
    """
    response = exception_handler(exc, context)
    
    if response is not None:
        response.data = {
            'error': True,
            'message': str(exc),
            'detail': response.data
        }
    
    return response


class BusinessException(Exception):
    """
    业务异常基类
    """
    def __init__(self, message, code=None):
        self.message = message
        self.code = code or 'BUSINESS_ERROR'
        super().__init__(self.message)


class InsufficientBalanceException(BusinessException):
    """
    余额不足异常
    """
    def __init__(self, message="余额不足"):
        super().__init__(message, code='INSUFFICIENT_BALANCE')

