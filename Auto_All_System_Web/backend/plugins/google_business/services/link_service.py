"""
Google One学生优惠链接服务
检测Google One AI学生优惠资格并提取SheerID验证链接
"""
import asyncio
import logging
import time
from typing import Dict, Any, Optional, Tuple
from django.utils import timezone
from playwright.async_api import Page

# 可选依赖：翻译功能
try:
    from deep_translator import GoogleTranslator
    HAS_TRANSLATOR = True
except ImportError:
    HAS_TRANSLATOR = False
    GoogleTranslator = None

from .base import BaseBrowserService
from .login_service import GoogleLoginService
from .browser_pool import browser_pool
from apps.integrations.google_accounts.models import GoogleAccount
from ..models import GoogleTask
from ..utils import TaskLogger

logger = logging.getLogger(__name__)


# 各语言的"优惠不可用"提示
NOT_AVAILABLE_PHRASES = [
    "This offer is not available",
    "Ưu đãi này hiện không dùng được",
    "Esta oferta no está disponible",
    "Cette offre n'est pas disponible",
    "Esta oferta não está disponível",
    "Tawaran ini tidak tersedia",
    "此优惠目前不可用",
    "這項優惠目前無法使用",
    "Oferta niedostępna",
    "Oferta nu este disponibilă",
    "Die Aktion ist nicht verfügbar",
    "Il'offerta non è disponibile",
    "Această ofertă nu este disponibilă",
    "Ez az ajánlat nem áll rendelkezésre",
    "Tato nabídka není k dispozici",
    "Bu teklif kullanılamıyor"
]

# 已订阅/已绑卡提示
SUBSCRIBED_PHRASES = [
    "You're already subscribed",
    "Bạn đã đăng ký",
    "已订阅",
    "Ya estás suscrito"
]

# 已验证未绑卡提示（"Get student offer"）
VERIFIED_UNBOUND_PHRASES = [
    "Get student offer",
    "Nhận ưu đãi dành cho sinh viên",
    "Obtener oferta para estudiantes",
    "Obter oferta de estudante",
    "获取学生优惠",
    "獲取學生優惠",
    "Dapatkan penawaran pelajar",
]


class GoogleOneLinkService(BaseBrowserService):
    """
    Google One链接服务
    
    提供以下功能：
    - 检测Google One AI学生优惠资格
    - 提取SheerID验证链接
    - 识别账号状态（已订阅/已验证/有资格/无资格）
    """
    
    GOOGLE_ONE_URL = "https://one.google.com/ai-student?g1_landing_page=75&utm_source=antigravity&utm_campaign=argon_limit_reached"
    
    def __init__(self):
        """初始化服务"""
        super().__init__()
        self.logger = logging.getLogger('plugin.google_business.link')
        self.login_service = GoogleLoginService()
    
    async def get_verification_link(
        self,
        page: Page,
        account_info: Dict[str, Any],
        task_logger: Optional[TaskLogger] = None,
        timeout: int = 10
    ) -> Tuple[str, Optional[str], Optional[str]]:
        """
        获取SheerID验证链接
        
        Args:
            page: Playwright页面对象
            account_info: 账号信息
            task_logger: 任务日志记录器
            timeout: 检测超时时间（秒）
            
        Returns:
            Tuple[str, Optional[str], Optional[str]]: (状态, 链接, 消息)
                状态: 'subscribed', 'verified', 'link_ready', 'ineligible', 'timeout', 'error'
        """
        email = account_info.get('email', '')
        
        try:
            # 1. 导航到Google One AI学生优惠页面
            if task_logger:
                task_logger.info(f"正在检查 {email} 的学生优惠资格...")
            
            self.logger.info(f"Navigating to Google One AI page for {email}...")
            await page.goto(self.GOOGLE_ONE_URL, wait_until='domcontentloaded', timeout=30000)
            await asyncio.sleep(5)  # 等待页面加载
            
            # 2. 检测页面状态
            status, link = await self.check_google_one_status(page, timeout, task_logger)
            
            # 3. 根据状态返回结果
            if status == 'subscribed':
                msg = "账号已订阅Google One学生优惠"
                if task_logger:
                    task_logger.info(f"✅ {msg}")
                return ('subscribed', None, msg)
            
            elif status == 'verified':
                msg = "账号已通过验证但未绑卡"
                if task_logger:
                    task_logger.info(f"⚠️ {msg}")
                return ('verified', link, msg)
            
            elif status == 'link_ready':
                if link:
                    msg = f"成功提取验证链接"
                    if task_logger:
                        task_logger.info(f"✅ {msg}")
                    return ('link_ready', link, msg)
                else:
                    msg = "检测到资格但未找到链接"
                    if task_logger:
                        task_logger.warning(msg)
                    return ('link_ready', None, msg)
            
            elif status == 'ineligible':
                msg = "账号不符合学生优惠资格"
                if task_logger:
                    task_logger.error(f"❌ {msg}")
                return ('ineligible', None, msg)
            
            elif status == 'timeout':
                msg = f"检测超时（{timeout}秒）"
                if task_logger:
                    task_logger.error(f"⏱️ {msg}")
                return ('timeout', None, msg)
            
            else:  # error
                msg = "检测过程出错"
                if task_logger:
                    task_logger.error(f"❌ {msg}")
                return ('error', None, msg)
                
        except Exception as e:
            error_msg = f"获取验证链接失败: {str(e)}"
            self.logger.error(error_msg, exc_info=True)
            if task_logger:
                task_logger.error(error_msg)
            return ('error', None, error_msg)
    
    async def check_google_one_status(
        self,
        page: Page,
        timeout: int = 10,
        task_logger: Optional[TaskLogger] = None
    ) -> Tuple[str, Optional[str]]:
        """
        统一的Google One AI页面状态检测函数
        
        Args:
            page: Playwright页面对象
            timeout: 超时时间（秒）
            task_logger: 任务日志记录器
            
        Returns:
            Tuple[str, Optional[str]]: (状态, 链接)
                状态: 'subscribed', 'verified', 'link_ready', 'ineligible', 'timeout', 'error'
                链接: SheerID验证链接（如果有）
        """
        start_time = time.time()
        self.logger.info(f"Checking Google One eligibility (max {timeout}s)...")
        
        while time.time() - start_time < timeout:
            try:
                # 0. 精确的CSS类检查
                # Eligible: class="krEaxf ZLZvHe rv8wkf b3UMcc"
                # Ineligible: class="krEaxf tTa5V rv8wkf b3UMcc"
                
                css_eligible = False
                if await page.locator('.krEaxf.ZLZvHe.rv8wkf.b3UMcc').count() > 0:
                    css_eligible = True
                
                # Ineligible
                if await page.locator('.krEaxf.tTa5V.rv8wkf.b3UMcc').count() > 0:
                    self.logger.info("Detected INELIGIBLE via CSS class")
                    return ('ineligible', None)
                
                # 1. 检查"已订阅"状态
                for phrase in SUBSCRIBED_PHRASES:
                    if await page.locator(f'text="{phrase}"').is_visible():
                        self.logger.info(f"Detected SUBSCRIBED with phrase: {phrase}")
                        return ('subscribed', None)
                
                # 1.5 检查"已验证未绑卡"（Get Offer）
                for phrase in VERIFIED_UNBOUND_PHRASES:
                    element = page.locator(f'text="{phrase}"')
                    if await element.is_visible():
                        self.logger.info(f"Detected VERIFIED UNBOUND with phrase: {phrase}")
                        # 尝试提取链接
                        try:
                            if await element.evaluate("el => el.tagName === 'A'"):
                                href = await element.get_attribute("href")
                                return ('verified', href)
                            else:
                                parent = element.locator("xpath=..")
                                if await parent.count() > 0 and await parent.evaluate("el => el.tagName === 'A'"):
                                    href = await parent.get_attribute("href")
                                    return ('verified', href)
                        except:
                            pass
                        return ('verified', None)
                
                # 2. 检查"优惠不可用"
                for phrase in NOT_AVAILABLE_PHRASES:
                    if await page.locator(f'text="{phrase}"').is_visible():
                        self.logger.info(f"Detected INELIGIBLE with phrase: {phrase}")
                        return ('ineligible', None)
                
                # 3. 检查SheerID链接（link_ready）
                link_element = page.locator('a[href*="sheerid.com"]').first
                if await link_element.count() > 0:
                    href = await link_element.get_attribute("href")
                    
                    # 进一步检查内容翻译（如果可用）
                    if HAS_TRANSLATOR and GoogleTranslator:
                        try:
                            text_content = await link_element.inner_text()
                            if text_content:
                                translated_text = GoogleTranslator(source='auto', target='en').translate(text_content).lower()
                                if "student offer" in translated_text or "get offer" in translated_text:
                                    self.logger.info("Detected VERIFIED UNBOUND via translation")
                                    return ('verified', href)
                        except:
                            pass
                    
                    self.logger.info(f"Found SheerID link: {href}")
                    return ('link_ready', href)
                
                # 3.1 检查"Verify eligibility"按钮（但还没有链接）
                if await page.locator('text="Verify eligibility"').count() > 0 or \
                   await page.locator('text="verify your eligibility"').count() > 0:
                    self.logger.info("Detected 'Verify eligibility' button")
                    return ('link_ready', None)
                
                # 如果CSS显示eligible但没有链接，也归为link_ready
                if css_eligible:
                    self.logger.info("CSS shows eligible but no link yet")
                    return ('link_ready', None)
                
                await asyncio.sleep(0.5)
                
            except Exception as e:
                self.logger.error(f"Status check error: {e}")
                await asyncio.sleep(1)
        
        # 超时
        self.logger.warning(f"Status check timeout after {timeout}s")
        return ('timeout', None)
    
    async def extract_link_from_button(
        self,
        page: Page,
        timeout: int = 5
    ) -> Optional[str]:
        """
        点击按钮后提取链接（某些情况下需要点击才能显示链接）
        
        Args:
            page: Playwright页面对象
            timeout: 超时时间（秒）
            
        Returns:
            Optional[str]: 提取到的链接
        """
        try:
            # 查找"Verify eligibility"或类似按钮
            button = page.locator('button:has-text("Verify eligibility"), button:has-text("Get student offer")')
            
            if await button.count() > 0:
                self.logger.info("Clicking verification button...")
                await button.first.click()
                await asyncio.sleep(3)
                
                # 等待链接出现
                start_time = time.time()
                while time.time() - start_time < timeout:
                    link_element = page.locator('a[href*="sheerid.com"]').first
                    if await link_element.count() > 0:
                        href = await link_element.get_attribute("href")
                        self.logger.info(f"Extracted link after button click: {href}")
                        return href
                    await asyncio.sleep(0.5)
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error extracting link from button: {e}")
            return None

