"""
@file __init__.py
@brief GUI公共模块
@details 包含所有业务通用的GUI组件和主窗口框架
"""

from .base_window import (
    BaseWindow,
    BaseDialog,
    resource_path,
    get_data_path,
)
from .main_window import MainWindow, main

__all__ = [
    # 基础类
    'BaseWindow',
    'BaseDialog',
    'resource_path',
    'get_data_path',
    # 主窗口
    'MainWindow',
    'main',
]

