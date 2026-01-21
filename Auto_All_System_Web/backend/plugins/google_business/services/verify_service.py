"""
SheerID API验证服务
使用第三方API批量验证SheerID链接
"""
import requests
import json
import time
import logging
from typing import Dict, Any, Optional, List, Callable
from django.utils import timezone
from django.conf import settings

from .base import BaseBrowserService
from apps.integrations.google_accounts.models import GoogleAccount
from ..models import GoogleTask
from ..utils import TaskLogger

logger = logging.getLogger(__name__)


class SheerIDVerifyService(BaseBrowserService):
    """
    SheerID API验证服务
    
    提供以下功能：
    - 批量提交SheerID验证（最多5个/批次）
    - 轮询验证状态
    - 取消验证
    """
    
    BASE_URL = "https://batch.1key.me"
    MAX_BATCH_SIZE = 5
    MAX_POLL_ATTEMPTS = 60
    POLL_INTERVAL = 2  # 秒
    
    def __init__(self, api_key: Optional[str] = None):
        """
        初始化服务
        
        Args:
            api_key: SheerID API密钥（用于绕过hCaptcha）
        """
        super().__init__()
        self.logger = logging.getLogger('plugin.google_business.verify')
        self.session = requests.Session()
        self.api_key = api_key or getattr(settings, 'SHEERID_API_KEY', '')
        self.csrf_token = None
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Origin": self.BASE_URL,
            "Referer": f"{self.BASE_URL}/"
        }
    
    def _get_csrf_token(self) -> bool:
        """
        获取CSRF token
        
        Returns:
            bool: 是否成功
        """
        try:
            self.logger.info("Fetching CSRF token...")
            resp = self.session.get(self.BASE_URL, headers=self.headers, timeout=10)
            resp.raise_for_status()
            
            # 尝试多种CSRF token模式
            import re
            patterns = [
                r'window\.CSRF_TOKEN\s*=\s*["\']([^"\']+)["\']',
                r'csrfToken["\']?\s*[:=]\s*["\']([^"\']+)["\']',
                r'_csrf["\']?\s*[:=]\s*["\']([^"\']+)["\']',
            ]
            
            for i, pattern in enumerate(patterns):
                match = re.search(pattern, resp.text, re.IGNORECASE)
                if match:
                    self.csrf_token = match.group(1)
                    self.headers["X-CSRF-Token"] = self.csrf_token
                    self.logger.info(f"✅ CSRF Token obtained (pattern {i+1})")
                    return True
            
            # 如果没有找到，尝试继续（可能不需要token）
            self.logger.warning("CSRF Token not found, attempting without it...")
            return False
            
        except Exception as e:
            self.logger.error(f"Failed to get CSRF token: {e}", exc_info=True)
            return False
    
    def verify_batch(
        self,
        verification_ids: List[str],
        callback: Optional[Callable[[str, str], None]] = None,
        task_logger: Optional[TaskLogger] = None
    ) -> Dict[str, Dict[str, Any]]:
        """
        批量验证SheerID
        
        Args:
            verification_ids: 验证ID列表（从SheerID链接提取）
            callback: 回调函数 (verification_id, message)
            task_logger: 任务日志记录器
            
        Returns:
            Dict[str, Dict]: {verification_id: result}
                result: {'status': 'success'|'error', 'message': str, 'currentStep': str}
        """
        # 每次批次验证前刷新CSRF token
        if task_logger:
            task_logger.info("正在刷新CSRF token...")
        
        self._get_csrf_token()
        
        results = {}
        
        # 构建payload
        payload = {
            "verificationIds": verification_ids,
            "hCaptchaToken": self.api_key,  # API Key用于绕过hCaptcha
            "useLucky": False,
            "programId": ""
        }
        
        headers = self.headers.copy()
        headers["Content-Type"] = "application/json"
        
        try:
            if task_logger:
                task_logger.info(f"正在提交 {len(verification_ids)} 个验证ID...")
            
            self.logger.info(f"Submitting batch verification for {len(verification_ids)} IDs...")
            
            # 发送POST请求（流式响应）
            resp = self.session.post(
                f"{self.BASE_URL}/api/batch",
                headers=headers,
                json=payload,
                stream=True,
                timeout=30
            )
            
            # 处理401/403（token过期）
            if resp.status_code in [403, 401]:
                self.logger.warning(f"Token expired (status {resp.status_code}), refreshing...")
                if self._get_csrf_token():
                    headers["X-CSRF-Token"] = self.csrf_token
                    resp = self.session.post(
                        f"{self.BASE_URL}/api/batch",
                        headers=headers,
                        json=payload,
                        stream=True,
                        timeout=30
                    )
                else:
                    return {vid: {"status": "error", "message": "Token expired and refresh failed"} for vid in verification_ids}
            
            # 检查响应状态
            if resp.status_code != 200:
                error_msg = f"HTTP {resp.status_code}: {resp.text[:200]}"
                self.logger.error(f"Batch request failed: {error_msg}")
                return {vid: {"status": "error", "message": error_msg} for vid in verification_ids}
            
            # 解析SSE流
            # API返回格式: "data: {...json...}"
            for line in resp.iter_lines():
                if not line:
                    continue
                
                decoded_line = line.decode('utf-8')
                if decoded_line.startswith("data:"):
                    json_str = decoded_line[5:].strip()
                    try:
                        data = json.loads(json_str)
                        self._handle_api_response(data, results, callback, task_logger)
                    except json.JSONDecodeError:
                        pass
            
        except Exception as e:
            error_msg = f"Batch verify request failed: {str(e)}"
            self.logger.error(error_msg, exc_info=True)
            if task_logger:
                task_logger.error(error_msg)
            
            for vid in verification_ids:
                if vid not in results:
                    results[vid] = {"status": "error", "message": str(e)}
        
        return results
    
    def _handle_api_response(
        self,
        data: Dict[str, Any],
        results: Dict[str, Dict],
        callback: Optional[Callable] = None,
        task_logger: Optional[TaskLogger] = None
    ):
        """
        处理API响应
        
        Args:
            data: API返回的数据
            results: 结果字典（会被修改）
            callback: 回调函数
            task_logger: 任务日志记录器
        """
        vid = data.get("verificationId")
        if not vid:
            return
        
        status = data.get("currentStep")
        message = data.get("message", "")
        
        # 记录日志
        log_msg = f"ID: {vid[:8]}... | Step: {status} | Msg: {message}"
        self.logger.info(log_msg)
        
        if task_logger:
            task_logger.info(log_msg)
        
        if callback:
            callback(vid, log_msg)
        
        # 处理pending状态（需要轮询）
        if status == "pending" and "checkToken" in data:
            check_token = data["checkToken"]
            final_res = self._poll_status(check_token, vid, callback, task_logger)
            results[vid] = final_res
        
        # 处理成功或失败状态
        elif status in ["success", "error"]:
            results[vid] = data
    
    def _poll_status(
        self,
        check_token: str,
        vid: str,
        callback: Optional[Callable] = None,
        task_logger: Optional[TaskLogger] = None
    ) -> Dict[str, Any]:
        """
        轮询验证状态
        
        Args:
            check_token: 检查token
            vid: 验证ID
            callback: 回调函数
            task_logger: 任务日志记录器
            
        Returns:
            Dict: 最终结果
        """
        url = f"{self.BASE_URL}/api/check-status"
        headers = self.headers.copy()
        headers["Content-Type"] = "application/json"
        
        # 最多轮询60次（约120秒）
        for i in range(self.MAX_POLL_ATTEMPTS):
            try:
                time.sleep(self.POLL_INTERVAL)
                
                payload = {"checkToken": check_token}
                resp = self.session.post(url, headers=headers, json=payload, timeout=30)
                json_data = resp.json()
                
                status = json_data.get("currentStep")
                message = json_data.get("message", "")
                
                log_msg = f"Polling ({i+1}/{self.MAX_POLL_ATTEMPTS}): {status} | {message}"
                self.logger.info(log_msg)
                
                if task_logger:
                    task_logger.info(log_msg)
                
                if callback:
                    callback(vid, log_msg)
                
                # 如果完成（成功或失败），返回结果
                if status in ["success", "error"]:
                    return json_data
                
                # 如果有新的checkToken，更新
                if "checkToken" in json_data:
                    check_token = json_data["checkToken"]
            
            except requests.exceptions.Timeout:
                self.logger.warning(f"Polling timeout (attempt {i+1}/{self.MAX_POLL_ATTEMPTS}), retrying...")
                if task_logger:
                    task_logger.warning(f"轮询超时，重试中... ({i+1}/{self.MAX_POLL_ATTEMPTS})")
                continue
            
            except Exception as e:
                self.logger.error(f"Polling failed: {e}")
                if task_logger:
                    task_logger.error(f"轮询出错: {str(e)[:50]}")
                continue
        
        # 超时
        error_result = {"status": "error", "message": f"Polling timeout ({self.MAX_POLL_ATTEMPTS * self.POLL_INTERVAL}s)"}
        return error_result
    
    def cancel_verification(self, verification_id: str) -> Dict[str, Any]:
        """
        取消验证
        
        Args:
            verification_id: 验证ID
            
        Returns:
            Dict: 取消结果
        """
        if not self.csrf_token:
            if not self._get_csrf_token():
                return {"status": "error", "message": "No CSRF Token"}
        
        url = f"{self.BASE_URL}/api/cancel"
        headers = self.headers.copy()
        headers["X-CSRF-Token"] = self.csrf_token
        headers["Content-Type"] = "application/json"
        
        try:
            resp = self.session.post(
                url,
                headers=headers,
                json={"verificationId": verification_id},
                timeout=10
            )
            
            try:
                return resp.json()
            except:
                return {"status": "error", "message": f"Invalid JSON: {resp.text}"}
        
        except Exception as e:
            self.logger.error(f"Cancel failed: {e}")
            return {"status": "error", "message": str(e)}
    
    @staticmethod
    def extract_verification_id(link: str) -> Optional[str]:
        """
        从SheerID链接中提取验证ID
        
        Args:
            link: SheerID链接
            
        Returns:
            Optional[str]: 验证ID
        """
        import re
        
        # 匹配patterns:
        # https://verify.sheerid.com/verification/xxxxx/...
        # https://services.sheerid.com/verify/xxxxx/...
        
        patterns = [
            r'verify\.sheerid\.com/verification/([a-f0-9\-]+)',
            r'services\.sheerid\.com/verify/([a-f0-9\-]+)',
            r'sheerid\.com/.*?([a-f0-9]{32,})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, link, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None

