"""
自定义权限类
"""
from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    只允许对象的所有者访问
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsAdmin(permissions.BasePermission):
    """
    只允许管理员访问
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

