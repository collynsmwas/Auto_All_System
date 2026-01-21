"""
Google账号管理器
提供账号的统一管理接口
"""
import logging
from typing import Dict, Any, Optional, List
from django.db.models import Q

from apps.integrations.google_accounts.models import (
    GoogleAccount,
    GoogleAccountStatus,
    GeminiStatus
)


logger = logging.getLogger(__name__)


class GoogleAccountManager:
    """
    Google账号管理器
    
    提供账号查询、分配、状态管理等功能
    """
    
    def __init__(self):
        """初始化管理器"""
        self.logger = logging.getLogger('plugin.google_business.account_manager')
    
    def get_available_account(
        self,
        require_sheerid: bool = False,
        require_gemini: bool = False
    ) -> Optional[GoogleAccount]:
        """
        获取可用的Google账号
        
        Args:
            require_sheerid: 是否要求通过SheerID验证
            require_gemini: 是否要求已订阅Gemini
            
        Returns:
            GoogleAccount: 可用账号，没有则返回None
        """
        try:
            # 构建查询条件
            query = Q(
                status=GoogleAccountStatus.ACTIVE,
                owner_user__isnull=True  # 平台账号池
            )
            
            if require_sheerid:
                query &= Q(sheerid_verified=True)
            
            if require_gemini:
                query &= Q(
                    gemini_status=GeminiStatus.ACTIVE,
                    card_bound=True
                )
            
            # 查询第一个可用账号
            account = GoogleAccount.objects.filter(query).first()
            
            if account:
                self.logger.info(f"Found available account: {account.email}")
            else:
                self.logger.warning("No available account found")
            
            return account
            
        except Exception as e:
            self.logger.error(f"Error getting available account: {e}", exc_info=True)
            return None
    
    def get_accounts_by_status(
        self,
        status: str,
        gemini_status: Optional[str] = None,
        limit: int = 100
    ) -> List[GoogleAccount]:
        """
        根据状态查询账号
        
        Args:
            status: 账号状态
            gemini_status: Gemini状态（可选）
            limit: 返回数量限制
            
        Returns:
            List[GoogleAccount]: 账号列表
        """
        try:
            query = Q(status=status)
            
            if gemini_status:
                query &= Q(gemini_status=gemini_status)
            
            accounts = GoogleAccount.objects.filter(query)[:limit]
            
            return list(accounts)
            
        except Exception as e:
            self.logger.error(f"Error getting accounts by status: {e}", exc_info=True)
            return []
    
    def allocate_account_to_user(
        self,
        account: GoogleAccount,
        user
    ) -> bool:
        """
        将账号分配给用户
        
        Args:
            account: Google账号
            user: 用户实例
            
        Returns:
            bool: 是否成功
        """
        try:
            if account.owner_user:
                self.logger.warning(f"Account {account.email} already allocated to user {account.owner_user.id}")
                return False
            
            account.owner_user = user
            account.save()
            
            self.logger.info(f"Allocated account {account.email} to user {user.id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error allocating account: {e}", exc_info=True)
            return False
    
    def return_account_to_pool(
        self,
        account: GoogleAccount
    ) -> bool:
        """
        将账号归还到账号池
        
        Args:
            account: Google账号
            
        Returns:
            bool: 是否成功
        """
        try:
            account.owner_user = None
            account.save()
            
            self.logger.info(f"Returned account {account.email} to pool")
            return True
            
        except Exception as e:
            self.logger.error(f"Error returning account to pool: {e}", exc_info=True)
            return False
    
    def get_account_stats(self) -> Dict[str, Any]:
        """
        获取账号统计信息
        
        Returns:
            Dict: 统计数据
        """
        try:
            stats = {
                'total': GoogleAccount.objects.count(),
                'active': GoogleAccount.objects.filter(status=GoogleAccountStatus.ACTIVE).count(),
                'locked': GoogleAccount.objects.filter(status=GoogleAccountStatus.LOCKED).count(),
                'sheerid_verified': GoogleAccount.objects.filter(sheerid_verified=True).count(),
                'gemini_active': GoogleAccount.objects.filter(gemini_status=GeminiStatus.ACTIVE).count(),
                'gemini_pending': GoogleAccount.objects.filter(gemini_status=GeminiStatus.PENDING).count(),
                'in_pool': GoogleAccount.objects.filter(owner_user__isnull=True).count(),
                'allocated': GoogleAccount.objects.filter(owner_user__isnull=False).count(),
            }
            
            return stats
            
        except Exception as e:
            self.logger.error(f"Error getting account stats: {e}", exc_info=True)
            return {}

