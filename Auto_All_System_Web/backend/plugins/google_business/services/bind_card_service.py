"""
Google One绑卡订阅服务
处理Google One AI学生优惠的绑卡和订阅流程
"""
import asyncio
import logging
from typing import Dict, Any, Optional, Tuple
from django.utils import timezone
from playwright.async_api import Page

from .base import BaseBrowserService
from .login_service import GoogleLoginService
from apps.integrations.google_accounts.models import GoogleAccount
from ..models import GoogleTask, GoogleCardInfo
from ..utils import TaskLogger

logger = logging.getLogger(__name__)


class GoogleOneBindCardService(BaseBrowserService):
    """
    Google One绑卡订阅服务
    
    提供以下功能：
    - 自动填写卡片信息
    - 完成Google One订阅流程
    - 处理已绑卡账号
    - 处理卡片过期换绑
    """
    
    GOOGLE_ONE_URL = "https://one.google.com/ai-student?g1_landing_page=75&utm_source=antigravity&utm_campaign=argon_limit_reached"
    
    def __init__(self):
        """初始化服务"""
        super().__init__()
        self.logger = logging.getLogger('plugin.google_business.bind_card')
        self.login_service = GoogleLoginService()
    
    async def bind_and_subscribe(
        self,
        page: Page,
        card_info: Dict[str, Any],
        account_info: Optional[Dict[str, Any]] = None,
        task_logger: Optional[TaskLogger] = None
    ) -> Tuple[bool, str]:
        """
        执行绑卡并订阅流程
        
        Args:
            page: Playwright页面对象
            card_info: 卡片信息 {number, exp_month, exp_year, cvv}
            account_info: 账号信息（用于登录）
            task_logger: 任务日志记录器
            
        Returns:
            Tuple[bool, str]: (是否成功, 消息)
        """
        try:
            # 1. 检查登录状态（如果提供了账号信息）
            if account_info:
                if task_logger:
                    task_logger.info("检查登录状态...")
                
                is_logged_in = await self.login_service.check_login_status(page)
                if not is_logged_in:
                    if task_logger:
                        task_logger.info("未登录，开始登录流程...")
                    
                    login_result = await self.login_service.login(page, account_info, task_logger)
                    if not login_result['success']:
                        return False, f"登录失败: {login_result.get('error', 'Unknown error')}"
            
            if task_logger:
                task_logger.info("开始绑卡流程...")
            
            self.logger.info("Starting bind and subscribe process...")
            
            # 2. 导航到Google One页面（如果还未在该页面）
            current_url = page.url
            if self.GOOGLE_ONE_URL not in current_url:
                if task_logger:
                    task_logger.info("导航到Google One页面...")
                await page.goto(self.GOOGLE_ONE_URL, wait_until='domcontentloaded', timeout=30000)
                await asyncio.sleep(5)
            
            # 3. 截图：初始页面
            await page.screenshot(path="bind_step1_initial.png")
            
            # 4. 点击"Get student offer"按钮
            clicked = await self._click_get_offer_button(page, task_logger)
            if clicked:
                if task_logger:
                    task_logger.info("已点击 'Get student offer'，等待加载...")
                await asyncio.sleep(8)
                await page.screenshot(path="bind_step2_after_get_offer.png")
            
            # 5. 检查是否已绑卡（前置判断）
            already_bound, subscribe_button = await self._check_already_bound(page, task_logger)
            
            if already_bound and subscribe_button:
                # 直接点击订阅按钮
                if task_logger:
                    task_logger.info("检测到已绑卡，直接订阅...")
                
                await subscribe_button.click()
                await asyncio.sleep(10)
                await page.screenshot(path="bind_subscribe_existing_card.png")
                
                # 验证订阅是否成功
                subscribed = await self._verify_subscribed(page, task_logger)
                if subscribed:
                    return True, "使用已有卡订阅成功"
                else:
                    # 可能卡过期，继续换绑流程
                    if task_logger:
                        task_logger.warning("可能卡过期，尝试换绑...")
                    
                    rebind_success = await self._handle_card_expired(page, task_logger)
                    if not rebind_success:
                        return False, "卡过期换绑失败"
                    # 继续执行后续绑卡流程
            
            # 6. 切换到iframe
            iframe_locator = await self._get_payment_iframe(page, task_logger)
            if not iframe_locator:
                return False, "未找到付款表单iframe"
            
            # 7. 点击"Add card"
            clicked_add = await self._click_add_card(iframe_locator, task_logger)
            if clicked_add:
                await asyncio.sleep(10)
                await page.screenshot(path="bind_step3_card_form.png")
            
            # 8. 切换到内部iframe（如果有第二层）
            inner_iframe = await self._get_inner_iframe(iframe_locator, task_logger)
            if inner_iframe:
                iframe_locator = inner_iframe
                await asyncio.sleep(10)
            
            # 9. 填写卡片信息
            fill_success = await self._fill_card_info(iframe_locator, card_info, task_logger)
            if not fill_success:
                return False, "填写卡片信息失败"
            
            # 10. 点击"Save card"
            save_success = await self._click_save_card(iframe_locator, task_logger)
            if not save_success:
                return False, "点击Save card失败"
            
            # 11. 等待并点击订阅按钮
            if task_logger:
                task_logger.info("等待订阅页面加载...")
            await asyncio.sleep(18)
            await page.screenshot(path="bind_step7_before_subscribe.png")
            
            subscribe_clicked = await self._click_subscribe_button(page, task_logger)
            if subscribe_clicked:
                await asyncio.sleep(10)
                await page.screenshot(path="bind_step8_after_subscribe.png")
                
                # 12. 验证订阅成功
                subscribed = await self._verify_subscribed(page, task_logger)
                if subscribed:
                    if task_logger:
                        task_logger.info("✅ 绑卡并订阅成功！")
                    return True, "绑卡并订阅成功"
                else:
                    if task_logger:
                        task_logger.warning("未检测到订阅确认，但可能成功")
                    return True, "绑卡完成"
            else:
                if task_logger:
                    task_logger.warning("未找到订阅按钮，可能已自动完成")
                return True, "绑卡完成"
            
        except Exception as e:
            error_msg = f"绑卡过程出错: {str(e)}"
            self.logger.error(error_msg, exc_info=True)
            if task_logger:
                task_logger.error(error_msg)
            return False, error_msg
    
    async def _click_get_offer_button(
        self,
        page: Page,
        task_logger: Optional[TaskLogger] = None
    ) -> bool:
        """点击'Get student offer'按钮"""
        selectors = [
            'button:has-text("Get student offer")',
            'button:has-text("Get offer")',
            'a:has-text("Get student offer")',
            'button:has-text("Get")',
            '[role="button"]:has-text("Get")'
        ]
        
        for selector in selectors:
            try:
                element = page.locator(selector).first
                if await element.count() > 0:
                    await element.wait_for(state='visible', timeout=3000)
                    await element.click()
                    self.logger.info(f"Clicked 'Get student offer' (selector: {selector})")
                    return True
            except:
                continue
        
        self.logger.warning("'Get student offer' button not found")
        return False
    
    async def _check_already_bound(
        self,
        page: Page,
        task_logger: Optional[TaskLogger] = None
    ) -> Tuple[bool, Optional[Any]]:
        """检查是否已绑卡"""
        try:
            await asyncio.sleep(3)
            
            iframe_locator = page.frame_locator('iframe[src*="tokenized.play.google.com"]')
            
            subscribe_selectors = [
                'span.UywwFc-vQzf8d:has-text("Subscribe")',
                'span[jsname="V67aGc"]',
                'span.UywwFc-vQzf8d',
                'span:has-text("Subscribe")',
                ':text("Subscribe")',
                'button:has-text("Subscribe")',
            ]
            
            for selector in subscribe_selectors:
                try:
                    element = iframe_locator.locator(selector).first
                    if await element.count() > 0:
                        self.logger.info(f"Detected already bound (selector: {selector})")
                        if task_logger:
                            task_logger.info("检测到已绑卡")
                        return True, element
                except:
                    continue
            
            return False, None
            
        except Exception as e:
            self.logger.error(f"Error checking already bound: {e}")
            return False, None
    
    async def _handle_card_expired(
        self,
        page: Page,
        task_logger: Optional[TaskLogger] = None
    ) -> bool:
        """处理卡过期换绑流程"""
        try:
            if task_logger:
                task_logger.info("执行卡过期换绑流程...")
            
            iframe_locator = page.frame_locator('iframe[src*="tokenized.play.google.com"]')
            
            # 1. 点击"Got it"
            got_it_selectors = [
                'button:has-text("Got it")',
                ':text("Got it")',
                'button:has-text("确定")',
            ]
            
            for selector in got_it_selectors:
                try:
                    element = iframe_locator.locator(selector).first
                    if await element.count() > 0:
                        await element.click()
                        self.logger.info("Clicked 'Got it'")
                        await asyncio.sleep(3)
                        break
                except:
                    continue
            
            # 2. 重新点击"Get student offer"
            await self._click_get_offer_button(page, task_logger)
            await asyncio.sleep(8)
            
            # 3. 点击过期卡片
            iframe_locator_card = page.frame_locator('iframe[src*="tokenized.play.google.com"]')
            card_selectors = [
                'span.Ngbcnc',
                'div.dROd9.ct1Mcc',
                ':has-text("Mastercard")',
            ]
            
            for selector in card_selectors:
                try:
                    element = iframe_locator_card.locator(selector).first
                    if await element.count() > 0:
                        await element.click()
                        self.logger.info(f"Clicked expired card (selector: {selector})")
                        await asyncio.sleep(5)
                        return True
                except:
                    continue
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error handling card expired: {e}")
            return False
    
    async def _get_payment_iframe(
        self,
        page: Page,
        task_logger: Optional[TaskLogger] = None
    ) -> Optional[Any]:
        """获取付款表单iframe"""
        try:
            await asyncio.sleep(10)
            iframe_locator = page.frame_locator('iframe[src*="tokenized.play.google.com"]')
            
            # 测试iframe是否可用
            test_locator = iframe_locator.locator('body')
            if await test_locator.count() >= 0:
                self.logger.info("Found tokenized.play.google.com iframe")
                await asyncio.sleep(10)
                return iframe_locator
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error getting payment iframe: {e}")
            return None
    
    async def _click_add_card(
        self,
        iframe_locator: Any,
        task_logger: Optional[TaskLogger] = None
    ) -> bool:
        """在iframe中点击'Add card'"""
        try:
            await asyncio.sleep(10)
            
            selectors = [
                'span.PjwEQ:has-text("Add card")',
                'span.PjwEQ',
                ':text("Add card")',
                'div:has-text("Add card")',
                'span:has-text("Add card")',
            ]
            
            for selector in selectors:
                try:
                    element = iframe_locator.locator(selector).first
                    if await element.count() > 0:
                        await element.click()
                        self.logger.info(f"Clicked 'Add card' (iframe, selector: {selector})")
                        if task_logger:
                            task_logger.info("已点击 'Add card'")
                        return True
                except:
                    continue
            
            self.logger.warning("'Add card' not found in iframe")
            return False
            
        except Exception as e:
            self.logger.error(f"Error clicking Add card: {e}")
            return False
    
    async def _get_inner_iframe(
        self,
        iframe_locator: Any,
        task_logger: Optional[TaskLogger] = None
    ) -> Optional[Any]:
        """获取内部iframe（第二层）"""
        try:
            await asyncio.sleep(1)
            
            inner_iframe_selectors = [
                'iframe[name="hnyNZeIframe"]',
                'iframe[src*="instrumentmanager"]',
                'iframe[id*="hnyNZe"]',
            ]
            
            for selector in inner_iframe_selectors:
                try:
                    temp_iframe = iframe_locator.frame_locator(selector)
                    test_locator = temp_iframe.locator('body')
                    if await test_locator.count() >= 0:
                        self.logger.info(f"Found inner iframe (selector: {selector})")
                        return temp_iframe
                except:
                    continue
            
            self.logger.info("No inner iframe found, continuing with current level")
            return None
            
        except Exception as e:
            self.logger.error(f"Error getting inner iframe: {e}")
            return None
    
    async def _fill_card_info(
        self,
        iframe_locator: Any,
        card_info: Dict[str, Any],
        task_logger: Optional[TaskLogger] = None
    ) -> bool:
        """填写卡片信息"""
        try:
            await asyncio.sleep(10)
            
            # 获取所有输入框
            all_inputs = iframe_locator.locator('input')
            input_count = await all_inputs.count()
            
            if input_count < 3:
                self.logger.error(f"Insufficient input fields, found {input_count}")
                return False
            
            # 1. 填写卡号
            if task_logger:
                task_logger.info("填写卡号...")
            card_number_input = all_inputs.nth(0)
            await card_number_input.click()
            await card_number_input.fill(card_info['number'])
            self.logger.info("Card number filled")
            await asyncio.sleep(0.5)
            
            # 2. 填写过期日期
            if task_logger:
                task_logger.info("填写过期日期...")
            exp_date_input = all_inputs.nth(1)
            await exp_date_input.click()
            exp_value = f"{card_info['exp_month']}{card_info['exp_year']}"
            await exp_date_input.fill(exp_value)
            self.logger.info("Expiry date filled")
            await asyncio.sleep(0.5)
            
            # 3. 填写CVV
            if task_logger:
                task_logger.info("填写CVV...")
            cvv_input = all_inputs.nth(2)
            await cvv_input.click()
            await cvv_input.fill(card_info['cvv'])
            self.logger.info("CVV filled")
            await asyncio.sleep(0.5)
            
            return True
            
        except Exception as e:
            error_msg = f"Error filling card info: {str(e)}"
            self.logger.error(error_msg)
            if task_logger:
                task_logger.error(error_msg)
            return False
    
    async def _click_save_card(
        self,
        iframe_locator: Any,
        task_logger: Optional[TaskLogger] = None
    ) -> bool:
        """点击'Save card'按钮"""
        try:
            save_selectors = [
                'button:has-text("Save card")',
                'button:has-text("保存卡")',
                'button:has-text("Save")',
                'button:has-text("保存")',
                'button[type="submit"]',
            ]
            
            for selector in save_selectors:
                try:
                    element = iframe_locator.locator(selector).first
                    if await element.count() > 0:
                        await element.click()
                        self.logger.info(f"Clicked 'Save card' (selector: {selector})")
                        if task_logger:
                            task_logger.info("已点击 'Save card'")
                        return True
                except:
                    continue
            
            self.logger.error("'Save card' button not found")
            return False
            
        except Exception as e:
            self.logger.error(f"Error clicking Save card: {e}")
            return False
    
    async def _click_subscribe_button(
        self,
        page: Page,
        task_logger: Optional[TaskLogger] = None
    ) -> bool:
        """点击订阅按钮"""
        try:
            subscribe_selectors = [
                'span.UywwFc-vQzf8d:has-text("Subscribe")',
                'span[jsname="V67aGc"]',
                'span.UywwFc-vQzf8d',
                'span:has-text("Subscribe")',
                ':text("Subscribe")',
                'button:has-text("Subscribe")',
                'button:has-text("订阅")',
            ]
            
            # 优先在iframe中查找
            try:
                iframe_locator = page.frame_locator('iframe[src*="tokenized.play.google.com"]')
                for selector in subscribe_selectors:
                    try:
                        element = iframe_locator.locator(selector).first
                        if await element.count() > 0:
                            await asyncio.sleep(2)
                            await element.click()
                            self.logger.info(f"Clicked Subscribe (iframe, selector: {selector})")
                            if task_logger:
                                task_logger.info("已点击订阅按钮")
                            return True
                    except:
                        continue
            except:
                pass
            
            # 在主页面查找
            for selector in subscribe_selectors:
                try:
                    element = page.locator(selector).first
                    if await element.count() > 0:
                        await asyncio.sleep(2)
                        await element.click()
                        self.logger.info(f"Clicked Subscribe (main page, selector: {selector})")
                        if task_logger:
                            task_logger.info("已点击订阅按钮")
                        return True
                except:
                    continue
            
            self.logger.warning("Subscribe button not found")
            return False
            
        except Exception as e:
            self.logger.error(f"Error clicking Subscribe: {e}")
            return False
    
    async def _verify_subscribed(
        self,
        page: Page,
        task_logger: Optional[TaskLogger] = None
    ) -> bool:
        """验证订阅是否成功"""
        try:
            iframe_locator = page.frame_locator('iframe[src*="tokenized.play.google.com"]')
            
            subscribed_selectors = [
                ':text("Subscribed")',
                'text=Subscribed',
                '*:has-text("Subscribed")',
            ]
            
            for selector in subscribed_selectors:
                try:
                    element = iframe_locator.locator(selector).first
                    if await element.count() > 0:
                        self.logger.info("'Subscribed' detected, subscription confirmed")
                        if task_logger:
                            task_logger.info("✅ 检测到'Subscribed'，订阅确认成功")
                        return True
                except:
                    continue
            
            self.logger.warning("'Subscribed' not detected")
            return False
            
        except Exception as e:
            self.logger.error(f"Error verifying subscription: {e}")
            return False

