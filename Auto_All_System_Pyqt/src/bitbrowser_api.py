"""
比特浏览器 API 兼容层
从 Auto_All_System_Web 内部导入，保持外部脚本兼容性
"""
import sys
import os

# 获取当前目录 (src/)
_current_dir = os.path.dirname(os.path.abspath(__file__))
# Auto_All_System_Pyqt/
_pyqt_dir = os.path.dirname(_current_dir)
# Auto_All_System/
_project_root = os.path.dirname(_pyqt_dir)
# Auto_All_System_Web/backend/
_backend_dir = os.path.join(_project_root, 'Auto_All_System_Web', 'backend')

# 添加 Django 项目路径
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# 尝试从 Django 应用中导入，如果失败则使用本地实现
try:
    from apps.integrations.bitbrowser.api import (
        BitBrowserAPI,
        BitBrowserManager,
        BitBrowserAPIError,
        ProxyType,
        ProxyMethod,
        IPCheckService
    )
except ImportError as e:
    print(f"[bitbrowser_api] 从 Django 导入失败: {e}")
    print(f"[bitbrowser_api] 后端路径: {_backend_dir}")
    print(f"[bitbrowser_api] 使用内置实现...")
    
    # 内置实现（简化版）
    import requests
    from enum import Enum
    
    class ProxyType(str, Enum):
        NO_PROXY = "noproxy"
        HTTP = "http"
        HTTPS = "https"
        SOCKS5 = "socks5"
    
    class ProxyMethod(int, Enum):
        CUSTOM = 2
        EXTRACT_IP = 3
    
    class IPCheckService(str, Enum):
        IP123IN = "ip123in"
        IP_API = "ip-api"
    
    class BitBrowserAPIError(Exception):
        pass
    
    class BitBrowserAPI:
        def __init__(self, api_url: str = None, timeout: int = 30):
            self.api_url = (api_url or "http://127.0.0.1:54345").rstrip('/')
            self.timeout = timeout
            self.session = requests.Session()
            self.session.headers.update({'Content-Type': 'application/json'})
        
        def _request(self, endpoint: str, data: dict = None) -> dict:
            url = f"{self.api_url}/{endpoint}"
            try:
                response = self.session.post(url, json=data or {}, timeout=self.timeout)
                response.raise_for_status()
                result = response.json()
                if not result.get('success', False):
                    raise BitBrowserAPIError(f"API错误: {result.get('msg', '未知错误')}")
                return result
            except requests.RequestException as e:
                raise BitBrowserAPIError(f"请求失败: {e}")
        
        def health_check(self) -> bool:
            try:
                return self._request('health').get('success', False)
            except:
                return False
        
        def list_browsers(self, page: int = 0, page_size: int = 50, **kwargs) -> dict:
            data = {'page': page, 'pageSize': min(page_size, 100)}
            data.update({k: v for k, v in kwargs.items() if v is not None})
            return self._request('browser/list', data)
        
        def get_browser_list(self, page: int = 0, page_size: int = 100) -> list:
            result = self.list_browsers(page=page, page_size=page_size)
            data = result.get('data', {})
            return data if isinstance(data, list) else data.get('list', [])
        
        def create_browser(self, name: str, browser_fingerprint: dict = None, **kwargs) -> dict:
            data = {'name': name, 'browserFingerPrint': browser_fingerprint or {}, **kwargs}
            return self._request('browser/update', data)
        
        def update_browser_partial(self, browser_ids: list, update_fields: dict) -> dict:
            return self._request('browser/update/partial', {'ids': browser_ids, **update_fields})
        
        def open_browser(self, browser_id: str, queue: bool = True, **kwargs) -> dict:
            data = {'id': browser_id, 'queue': queue, **kwargs}
            return self._request('browser/open', data)
        
        def close_browser(self, browser_id: str) -> dict:
            return self._request('browser/close', {'id': browser_id})
        
        def delete_browser(self, browser_id: str) -> dict:
            return self._request('browser/delete', {'id': browser_id})
        
        def get_browser_detail(self, browser_id: str) -> dict:
            return self._request('browser/detail', {'id': browser_id})
    
    class BitBrowserManager:
        def __init__(self, api_url: str = None):
            self.api = BitBrowserAPI(api_url)
        
        def open_and_get_ws(self, browser_id: str) -> str:
            result = self.api.open_browser(browser_id)
            return result.get('data', {}).get('ws')
        
        def launch_browser(self, profile_id: str) -> dict:
            result = self.api.open_browser(profile_id)
            data = result.get('data', {})
            return {
                'profile_id': profile_id,
                'ws_endpoint': data.get('ws'),
                'http_endpoint': data.get('http'),
                'pid': data.get('pid'),
            }
        
        def cleanup(self, profile_id: str, delete_profile: bool = False):
            self.api.close_browser(profile_id)
            if delete_profile:
                self.api.delete_browser(profile_id)
        
        def get_all_browsers(self) -> list:
            all_browsers = []
            page = 0
            while True:
                browsers = self.api.get_browser_list(page=page, page_size=100)
                if not browsers:
                    break
                all_browsers.extend(browsers)
                if len(browsers) < 100:
                    break
                page += 1
            return all_browsers

__all__ = [
    'BitBrowserAPI',
    'BitBrowserManager',
    'BitBrowserAPIError',
    'ProxyType',
    'ProxyMethod',
    'IPCheckService',
]

