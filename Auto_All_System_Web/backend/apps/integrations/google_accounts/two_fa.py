"""
Google 2FA验证码生成工具
"""
import pyotp
import time
from typing import Optional


def generate_totp_code(secret: str, time_step: int = 30) -> str:
    """
    生成Google 2FA验证码（TOTP）
    
    Args:
        secret: Google账号的2FA密钥
        time_step: 时间步长（秒），默认30秒
        
    Returns:
        6位数字验证码
    """
    try:
        totp = pyotp.TOTP(secret, interval=time_step)
        return totp.now()
    except Exception as e:
        raise ValueError(f"生成2FA验证码失败: {str(e)}")


def verify_totp_code(secret: str, code: str, window: int = 1) -> bool:
    """
    验证TOTP验证码是否正确
    
    Args:
        secret: Google账号的2FA密钥
        code: 用户输入的验证码
        window: 时间窗口，允许前后N个时间步长的验证码
        
    Returns:
        验证是否通过
    """
    try:
        totp = pyotp.TOTP(secret)
        return totp.verify(code, valid_window=window)
    except:
        return False


def get_remaining_time() -> int:
    """
    获取当前验证码剩余有效时间（秒）
    
    Returns:
        剩余秒数
    """
    current_timestamp = int(time.time())
    time_step = 30
    return time_step - (current_timestamp % time_step)


class TwoFactorAuthHelper:
    """2FA验证工具类"""
    
    def __init__(self, secret: str):
        if not secret:
            raise ValueError("2FA密钥不能为空")
        self.secret = secret
        self.totp = pyotp.TOTP(secret)
    
    def get_current_code(self) -> str:
        """获取当前验证码"""
        return self.totp.now()
    
    def get_next_code(self) -> str:
        """获取下一个验证码（30秒后）"""
        return self.totp.at(int(time.time()) + 30)
    
    def verify(self, code: str, window: int = 1) -> bool:
        """
        验证验证码
        
        Args:
            code: 验证码
            window: 时间窗口，允许前后N个时间步长的验证码
            
        Returns:
            是否验证通过
        """
        return self.totp.verify(code, valid_window=window)
    
    def get_remaining_time(self) -> int:
        """获取当前验证码剩余有效时间"""
        return get_remaining_time()
    
    def get_codes_with_timing(self) -> Dict[str, Any]:
        """
        获取验证码及时间信息
        
        Returns:
            包含当前码、下一个码、剩余时间的字典
        """
        return {
            'current_code': self.get_current_code(),
            'next_code': self.get_next_code(),
            'remaining_seconds': self.get_remaining_time(),
        }


# 使用示例
if __name__ == "__main__":
    # 示例密钥
    secret_key = "JBSWY3DPEHPK3PXP"
    
    # 方式1：直接生成
    code = generate_totp_code(secret_key)
    print(f"当前验证码: {code}")
    print(f"剩余有效时间: {get_remaining_time()}秒")
    
    # 方式2：使用辅助类
    helper = TwoFactorAuthHelper(secret_key)
    info = helper.get_codes_with_timing()
    print(f"当前码: {info['current_code']}")
    print(f"下一个码: {info['next_code']}")
    print(f"剩余时间: {info['remaining_seconds']}秒")
