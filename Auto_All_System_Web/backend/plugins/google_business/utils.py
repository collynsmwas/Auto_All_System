"""
Google Business插件工具类
"""
from cryptography.fernet import Fernet
from django.conf import settings
import base64
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)


class EncryptionUtil:
    """
    数据加密工具类（AES-256）
    用于加密敏感数据：密码、2FA密钥、卡号、CVV等
    """
    
    @staticmethod
    def get_cipher():
        """获取加密器"""
        # 从settings获取加密密钥
        key = getattr(settings, 'ENCRYPTION_KEY', None)
        
        if not key:
            # 开发环境：使用临时密钥（生产环境必须配置）
            logger.warning("ENCRYPTION_KEY not configured, using temporary key")
            key = Fernet.generate_key()

        if isinstance(key, str):
            key = key.encode()

        try:
            return Fernet(key)
        except Exception as exc:
            logger.warning(f"Invalid ENCRYPTION_KEY, using temporary key: {exc}")
            return Fernet(Fernet.generate_key())
    
    @staticmethod
    def encrypt(data: str) -> str:
        """
        加密敏感数据
        
        Args:
            data: 原始数据
        
        Returns:
            加密后的数据（Base64字符串）
        """
        if not data:
            return ""
        
        try:
            cipher = EncryptionUtil.get_cipher()
            encrypted_data = cipher.encrypt(data.encode())
            return encrypted_data.decode()
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise
    
    @staticmethod
    def decrypt(encrypted_data: str) -> str:
        """
        解密敏感数据
        
        Args:
            encrypted_data: 加密的数据
        
        Returns:
            原始数据
        """
        if not encrypted_data:
            return ""
        
        try:
            cipher = EncryptionUtil.get_cipher()
            decrypted_data = cipher.decrypt(encrypted_data.encode())
            return decrypted_data.decode()
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise


class TaskLogger:
    """
    任务日志记录器
    用于记录任务执行过程中的日志
    """
    
    def __init__(self, task):
        """
        初始化日志记录器
        
        Args:
            task: GoogleTask实例
        """
        self.task = task
        self.logger = logging.getLogger(__name__)
    
    def log(self, message: str, level: str = 'info'):
        """
        记录日志
        
        Args:
            message: 日志消息
            level: 日志级别（info, warning, error）
        """
        timestamp = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        formatted_message = f"[{timestamp}] {message}\n"
        
        # 写入数据库
        self.task.log += formatted_message
        self.task.save(update_fields=['log'])
        
        # 写入日志文件
        if level == 'info':
            self.logger.info(message)
        elif level == 'warning':
            self.logger.warning(message)
        elif level == 'error':
            self.logger.error(message)
    
    def info(self, message: str):
        """记录信息日志"""
        self.log(message, 'info')
    
    def warning(self, message: str):
        """记录警告日志"""
        self.log(message, 'warning')
    
    def error(self, message: str):
        """记录错误日志"""
        self.log(message, 'error')


class SensitiveDataFilter:
    """
    敏感数据过滤器
    用于日志脱敏
    """
    
    import re
    
    PATTERNS = [
        (re.compile(r'password["\']?\s*[:=]\s*["\']([^"\']+)["\']', re.IGNORECASE), r'password="***"'),
        (re.compile(r'secret["\']?\s*[:=]\s*["\']([^"\']+)["\']', re.IGNORECASE), r'secret="***"'),
        (re.compile(r'card_number["\']?\s*[:=]\s*["\']([^"\']+)["\']', re.IGNORECASE), r'card_number="****"'),
        (re.compile(r'cvv["\']?\s*[:=]\s*["\']([^"\']+)["\']', re.IGNORECASE), r'cvv="***"'),
        (re.compile(r'\d{13,19}'), r'****-****-****-****'),  # 卡号
    ]
    
    @staticmethod
    def filter(message: str) -> str:
        """
        过滤敏感数据
        
        Args:
            message: 原始消息
        
        Returns:
            脱敏后的消息
        """
        for pattern, replacement in SensitiveDataFilter.PATTERNS:
            message = pattern.sub(replacement, message)
        return message


def extract_verification_id(verification_link: str) -> str:
    """
    从SheerID链接中提取verification_id
    
    Args:
        verification_link: SheerID验证链接
    
    Returns:
        verification_id或空字符串
    """
    import re
    
    if not verification_link:
        return ""
    
    # 匹配常见的verification_id格式
    patterns = [
        r'verificationId=([a-zA-Z0-9\-]+)',
        r'verification/([a-zA-Z0-9\-]+)',
        r'verify/([a-zA-Z0-9\-]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, verification_link)
        if match:
            return match.group(1)
    
    logger.warning(f"Could not extract verification_id from: {verification_link}")
    return ""


def mask_card_number(card_number: str) -> str:
    """
    掩码卡号（只显示后4位）
    
    Args:
        card_number: 完整卡号
    
    Returns:
        掩码后的卡号
    """
    if not card_number or len(card_number) < 4:
        return "****-****-****-****"
    
    return f"****-****-****-{card_number[-4:]}"


def calculate_task_cost(task_type: str, count: int) -> float:
    """
    计算任务成本
    
    Args:
        task_type: 任务类型
        count: 账号数量
    
    Returns:
        总费用
    """
    # 定价规则（单位：积分）
    PRICING = {
        'login': 1,
        'get_link': 2,
        'verify': 5,
        'bind_card': 10,
        'one_click': 18,
    }
    
    unit_price = PRICING.get(task_type, 0)
    return unit_price * count

