"""
比特浏览器 API 封装
Version: 2.1
Date: 2026-01-18

完整封装比特浏览器 Local API
所有接口使用 POST + JSON Body 传参方式
"""
import requests
from typing import Dict, Any, List, Optional, Union
from enum import Enum

try:
    from django.conf import settings
    DJANGO_AVAILABLE = True
except ImportError:
    DJANGO_AVAILABLE = False
    settings = None


class ProxyType(str, Enum):
    """代理类型"""
    NO_PROXY = "noproxy"
    HTTP = "http"
    HTTPS = "https"
    SOCKS5 = "socks5"
    SSH = "ssh"


class ProxyMethod(int, Enum):
    """代理方式"""
    CUSTOM = 2  # 自定义
    EXTRACT_IP = 3  # 提取IP


class IPCheckService(str, Enum):
    """IP查询服务"""
    IP123IN = "ip123in"
    IP_API = "ip-api"
    LUMINATI = "luminati"


class BitBrowserAPIError(Exception):
    """比特浏览器API异常"""
    pass


class BitBrowserAPI:
    """
    比特浏览器 API 客户端
    
    所有接口返回格式：
    {
        "success": true/false,
        "data": {...},
        "msg": "错误信息"  # 仅失败时返回
    }
    """
    
    def __init__(self, api_url: str = None, timeout: int = 30):
        """
        初始化API客户端
        
        Args:
            api_url: API地址，默认 http://127.0.0.1:54345
            timeout: 请求超时时间（秒）
        """
        if api_url:
            self.api_url = api_url.rstrip('/')
        elif DJANGO_AVAILABLE and hasattr(settings, 'BITBROWSER_API_URL'):
            self.api_url = settings.BITBROWSER_API_URL.rstrip('/')
        else:
            self.api_url = "http://127.0.0.1:54345"
            
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
    
    def _request(self, endpoint: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        统一请求方法 (所有接口均为POST + JSON Body)
        
        Args:
            endpoint: API端点，如 'browser/list'
            data: 请求数据（自动转JSON）
            
        Returns:
            API响应字典
            
        Raises:
            BitBrowserAPIError: API请求失败
        """
        url = f"{self.api_url}/{endpoint}"
        
        try:
            response = self.session.post(
                url,
                json=data or {},
                timeout=self.timeout
            )
            response.raise_for_status()
            result = response.json()
            
            # 检查业务逻辑错误
            if not result.get('success', False):
                error_msg = result.get('msg', '未知错误')
                raise BitBrowserAPIError(f"API业务错误: {error_msg}")
            
            return result
            
        except requests.RequestException as e:
            raise BitBrowserAPIError(f"网络请求失败: {str(e)}")
        except ValueError as e:
            raise BitBrowserAPIError(f"JSON解析失败: {str(e)}")
    
    # ==================== 健康检查 ====================
    
    def health_check(self) -> bool:
        """
        健康检查，测试Local Server是否连接成功
        
        Returns:
            True: 连接成功
        """
        try:
            result = self._request('health')
            return result.get('success', False)
        except Exception:
            return False
    
    # ==================== 分组接口 ====================
    
    def list_groups(self, page: int = 0, page_size: int = 10, all_groups: bool = True) -> Dict[str, Any]:
        """
        查询分组列表
        
        Args:
            page: 页码，从0开始
            page_size: 每页条数，最大100
            all_groups: 是否获取权限范围内的所有分组
            
        Returns:
            分组列表数据
        """
        return self._request('group/list', {
            'page': page,
            'pageSize': min(page_size, 100),
            'all': all_groups
        })
    
    def add_group(self, group_name: str, sort_num: int = 0) -> Dict[str, Any]:
        """
        添加分组
        
        Args:
            group_name: 分组名称
            sort_num: 排序数字
            
        Returns:
            新建分组信息
        """
        return self._request('group/add', {
            'groupName': group_name,
            'sortNum': sort_num
        })
    
    def update_group(self, group_id: str, group_name: str, sort_num: int = 0) -> Dict[str, Any]:
        """
        修改分组
        
        Args:
            group_id: 分组ID
            group_name: 分组名称
            sort_num: 排序数字
            
        Returns:
            更新结果
        """
        return self._request('group/edit', {
            'id': group_id,
            'groupName': group_name,
            'sortNum': sort_num
        })
    
    def delete_group(self, group_id: str) -> Dict[str, Any]:
        """
        删除分组
        
        Args:
            group_id: 分组ID
            
        Returns:
            删除结果
        """
        return self._request('group/delete', {'id': group_id})
    
    def get_group_detail(self, group_id: str) -> Dict[str, Any]:
        """
        获取分组详情
        
        Args:
            group_id: 分组ID
            
        Returns:
            分组详细信息
        """
        return self._request('group/detail', {'id': group_id})
    
    # ==================== 浏览器窗口接口 ====================
    
    def create_browser(
        self,
        name: str,
        browser_fingerprint: Dict[str, Any] = None,
        group_id: str = None,
        proxy_config: Dict[str, Any] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        创建浏览器窗口
        
        Args:
            name: 窗口名称
            browser_fingerprint: 指纹配置
            group_id: 分组ID
            proxy_config: 代理配置字典
            **kwargs: 其他配置参数
            
        Returns:
            创建结果（包含窗口ID）
        """
        data = {
            'name': name,
            'browserFingerPrint': browser_fingerprint or {},
            'proxyMethod': ProxyMethod.CUSTOM.value,
            **kwargs
        }
        
        if group_id:
            data['groupId'] = group_id
        
        # 代理配置
        if proxy_config:
            data.update({
                'proxyType': proxy_config.get('type', ProxyType.NO_PROXY.value),
                'host': proxy_config.get('host', ''),
                'port': proxy_config.get('port', ''),
                'proxyUserName': proxy_config.get('username', ''),
                'proxyPassword': proxy_config.get('password', ''),
                'ipCheckService': proxy_config.get('ipCheckService', IPCheckService.IP123IN.value),
            })
        else:
            data['proxyType'] = ProxyType.NO_PROXY.value
        
        return self._request('browser/update', data)
    
    def update_browser_partial(
        self,
        browser_ids: List[str],
        update_fields: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        修改窗口指定字段值（支持批量）
        
        Args:
            browser_ids: 窗口ID列表
            update_fields: 要更新的字段字典
            
        Returns:
            更新结果
        """
        data = {
            'ids': browser_ids,
            **update_fields
        }
        return self._request('browser/update/partial', data)
    
    def open_browser(
        self,
        browser_id: str,
        args: List[str] = None,
        queue: bool = True,
        ignore_default_urls: bool = False,
        new_page_url: str = None
    ) -> Dict[str, Any]:
        """
        打开浏览器窗口
        
        Args:
            browser_id: 窗口ID
            args: 启动参数列表
            queue: 是否队列方式打开（防止并发报错）
            ignore_default_urls: 忽略已同步的URL
            new_page_url: 指定打开的URL
            
        Returns:
            连接信息（ws, http, driver, pid等）
        """
        data = {
            'id': browser_id,
            'queue': queue
        }
        
        if args:
            data['args'] = args
        
        if ignore_default_urls:
            data['ignoreDefaultUrls'] = True
            if new_page_url:
                data['newPageUrl'] = new_page_url
        
        return self._request('browser/open', data)
    
    def close_browser(self, browser_id: str) -> Dict[str, Any]:
        """
        关闭浏览器窗口
        
        Args:
            browser_id: 窗口ID
            
        Returns:
            关闭结果
        """
        return self._request('browser/close', {'id': browser_id})
    
    def reset_browser_closing_status(self, browser_id: str) -> Dict[str, Any]:
        """
        重置浏览器关闭状态
        
        Args:
            browser_id: 窗口ID
            
        Returns:
            重置结果
        """
        return self._request('browser/closing/reset', {'id': browser_id})
    
    def delete_browser(self, browser_id: str) -> Dict[str, Any]:
        """
        彻底删除浏览器窗口
        
        Args:
            browser_id: 窗口ID
            
        Returns:
            删除结果
        """
        return self._request('browser/delete', {'id': browser_id})
    
    def delete_browsers_batch(self, browser_ids: List[str]) -> Dict[str, Any]:
        """
        批量删除浏览器窗口（一次最多100个）
        
        Args:
            browser_ids: 窗口ID列表
            
        Returns:
            删除结果
        """
        return self._request('browser/delete/ids', {'ids': browser_ids[:100]})
    
    def get_browser_detail(self, browser_id: str) -> Dict[str, Any]:
        """
        获取浏览器窗口详情
        
        Args:
            browser_id: 窗口ID
            
        Returns:
            窗口完整配置信息
        """
        return self._request('browser/detail', {'id': browser_id})
    
    def list_browsers(
        self,
        page: int = 0,
        page_size: int = 50,
        group_id: str = None,
        name: str = None,
        seq: int = None,
        min_seq: int = None,
        max_seq: int = None,
        remark: str = None,
        sort: str = None
    ) -> Dict[str, Any]:
        """
        分页获取浏览器窗口列表
        
        Args:
            page: 页码，从0开始
            page_size: 每页数量，最大100
            group_id: 分组ID
            name: 窗口名称（模糊匹配）
            seq: 窗口序号（精确查询）
            min_seq: 最小序号
            max_seq: 最大序号
            remark: 备注信息
            sort: 排序方式 desc/asc
            
        Returns:
            窗口列表数据
        """
        data = {
            'page': page,
            'pageSize': min(page_size, 100)
        }
        
        if group_id:
            data['groupId'] = group_id
        if name:
            data['name'] = name
        if seq is not None:
            data['seq'] = seq
        if min_seq is not None:
            data['minSeq'] = min_seq
        if max_seq is not None:
            data['maxSeq'] = max_seq
        if remark:
            data['remark'] = remark
        if sort in ['desc', 'asc']:
            data['sort'] = sort
        
        return self._request('browser/list', data)
    
    def get_browser_list(self, page: int = 0, page_size: int = 100) -> list:
        """
        获取浏览器列表（简化版）
        
        Args:
            page: 页码
            page_size: 每页数量
            
        Returns:
            浏览器列表
        """
        result = self.list_browsers(page=page, page_size=page_size)
        data = result.get('data', {})
        if isinstance(data, list):
            return data
        return data.get('list', [])
    
    def close_all_browsers(self) -> Dict[str, Any]:
        """
        关闭所有窗口
        
        Returns:
            关闭结果
        """
        return self._request('browser/close/all')
    
    def close_browsers_by_seqs(self, seqs: List[int]) -> Dict[str, Any]:
        """
        通过序号批量关闭窗口
        
        Args:
            seqs: 窗口序号列表
            
        Returns:
            关闭结果
        """
        return self._request('browser/close/byseqs', {'seqs': seqs})
    
    # ==================== 窗口排列 ====================
    
    def arrange_windows(
        self,
        arrange_type: str,
        start_x: int = 0,
        start_y: int = 0,
        width: int = 500,
        height: int = 400,
        col: int = 3,
        space_x: int = 0,
        space_y: int = 0,
        offset_x: int = 50,
        offset_y: int = 50,
        order_by: str = "asc",
        browser_ids: List[str] = None,
        seqlist: List[int] = None,
        screen_id: int = None
    ) -> Dict[str, Any]:
        """
        排列窗口并调整尺寸
        
        Args:
            arrange_type: 排列方式 box/diagonal
            start_x: 起始X位置
            start_y: 起始Y位置
            width: 宽度
            height: 高度
            col: 宫格每行列数
            space_x: 宫格横向间距
            space_y: 宫格纵向间距
            offset_x: 对角线横向偏移量
            offset_y: 对角线纵向偏移量
            order_by: 排序方式 asc/desc
            browser_ids: 窗口ID数组
            seqlist: 窗口序号数组
            screen_id: 显示器屏幕ID
            
        Returns:
            排列结果
        """
        data = {
            'type': arrange_type,
            'startX': start_x,
            'startY': start_y,
            'width': max(width, 500),
            'height': max(height, 200),
            'col': col,
            'spaceX': space_x,
            'spaceY': space_y,
            'offsetX': offset_x,
            'offsetY': offset_y,
            'orderBy': order_by
        }
        
        if browser_ids:
            data['ids'] = browser_ids
        elif seqlist:
            data['seqlist'] = seqlist
        
        if screen_id is not None:
            data['screenId'] = screen_id
        
        return self._request('windowbounds', data)
    
    def arrange_windows_flexable(self, seqlist: List[int] = None) -> Dict[str, Any]:
        """
        一键自适应排列窗口
        
        Args:
            seqlist: 窗口序号列表
            
        Returns:
            排列结果
        """
        data = {'seqlist': seqlist or []}
        return self._request('windowbounds/flexable', data)
    
    # ==================== 分组和备注管理 ====================
    
    def update_browsers_group(
        self,
        browser_ids: List[str],
        group_id: str
    ) -> Dict[str, Any]:
        """
        批量修改浏览器窗口分组
        
        Args:
            browser_ids: 窗口ID列表
            group_id: 目标分组ID
            
        Returns:
            更新结果
        """
        return self._request('browser/group/update', {
            'browserIds': browser_ids,
            'groupId': group_id
        })
    
    def update_browsers_remark(
        self,
        browser_ids: List[str],
        remark: str
    ) -> Dict[str, Any]:
        """
        批量修改窗口备注
        
        Args:
            browser_ids: 窗口ID列表
            remark: 备注信息
            
        Returns:
            更新结果
        """
        return self._request('browser/remark/update', {
            'browserIds': browser_ids,
            'remark': remark
        })
    
    # ==================== 代理管理 ====================
    
    def update_browsers_proxy(
        self,
        browser_ids: List[str],
        proxy_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        批量修改窗口代理信息
        
        Args:
            browser_ids: 窗口ID列表
            proxy_config: 代理配置字典
                
        Returns:
            更新结果
        """
        data = {
            'ids': browser_ids,
            'proxyMethod': proxy_config.get('proxyMethod', ProxyMethod.CUSTOM.value),
            'proxyType': proxy_config.get('proxyType', ProxyType.NO_PROXY.value),
            'host': proxy_config.get('host', ''),
            'port': proxy_config.get('port', ''),
            'proxyUserName': proxy_config.get('proxyUserName', ''),
            'proxyPassword': proxy_config.get('proxyPassword', ''),
            'ipCheckService': proxy_config.get('ipCheckService', IPCheckService.IP123IN.value),
        }
        
        # 可选参数
        optional_fields = [
            'refreshProxyUrl', 'dynamicIpUrl', 'dynamicIpChannel',
            'isDynamicIpChangeIp', 'isIpv6'
        ]
        for field in optional_fields:
            if field in proxy_config:
                data[field] = proxy_config[field]
        
        return self._request('browser/proxy/update', data)
    
    def check_proxy(
        self,
        host: str,
        port: int,
        proxy_type: str,
        username: str = "",
        password: str = "",
        ip_check_service: str = "ip123in",
        check_exists: int = 0
    ) -> Dict[str, Any]:
        """
        代理检测接口
        
        Args:
            host: 代理主机
            port: 代理端口
            proxy_type: 代理类型
            username: 用户名
            password: 密码
            ip_check_service: IP检测服务
            check_exists: 检测IP是否已使用
            
        Returns:
            代理信息（IP、国家、城市等）
        """
        return self._request('checkagent', {
            'host': host,
            'port': port,
            'proxyType': proxy_type,
            'proxyUserName': username,
            'proxyPassword': password,
            'ipCheckService': ip_check_service,
            'checkExists': check_exists
        })
    
    def update_proxy(self, profile_id: str, proxy_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        更新单个浏览器代理配置
        
        Args:
            profile_id: 浏览器配置ID
            proxy_config: 代理配置
            
        Returns:
            更新结果
        """
        return self.update_browsers_proxy([profile_id], proxy_config)
    
    # ==================== Cookie管理 ====================
    
    def set_browser_cookies(
        self,
        browser_id: str,
        cookies: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        对已打开窗口设置实时Cookie
        
        Args:
            browser_id: 窗口ID
            cookies: Cookie数组
                
        Returns:
            设置结果
        """
        return self._request('browser/cookies/set', {
            'browserId': browser_id,
            'cookies': cookies
        })
    
    def get_browser_cookies(self, browser_id: str) -> Dict[str, Any]:
        """
        获取已打开窗口的实时Cookie
        
        Args:
            browser_id: 窗口ID
            
        Returns:
            Cookie数组
        """
        return self._request('browser/cookies/get', {
            'browserId': browser_id
        })
    
    def clear_browser_cookies(
        self,
        browser_id: str,
        save_synced: bool = True
    ) -> Dict[str, Any]:
        """
        清空Cookie
        
        Args:
            browser_id: 窗口ID
            save_synced: 是否保留已同步到服务端的Cookie
            
        Returns:
            清理结果
        """
        return self._request('browser/cookies/clear', {
            'browserId': browser_id,
            'saveSynced': save_synced
        })
    
    def format_cookies(
        self,
        cookie: Union[str, List, Dict],
        hostname: str = None
    ) -> Dict[str, Any]:
        """
        格式化给定Cookie
        
        Args:
            cookie: Cookie数据
            hostname: Cookie的domain值
            
        Returns:
            格式化后的Cookie
        """
        data = {'cookie': cookie}
        if hostname:
            data['hostname'] = hostname
        return self._request('browser/cookies/format', data)
    
    # ==================== 缓存管理 ====================
    
    def clear_browser_cache(self, browser_ids: List[str]) -> Dict[str, Any]:
        """
        清理窗口缓存
        
        Args:
            browser_ids: 窗口ID列表
            
        Returns:
            清理结果
        """
        return self._request('cache/clear', {'ids': browser_ids})
    
    def clear_cache_except_extensions(self, browser_ids: List[str]) -> Dict[str, Any]:
        """
        清理窗口缓存（保留扩展数据）
        
        Args:
            browser_ids: 窗口ID列表
            
        Returns:
            清理结果
        """
        return self._request('cache/clear/exceptExtensions', {'ids': browser_ids})
    
    # ==================== 指纹管理 ====================
    
    def random_browser_fingerprint(self, browser_id: str) -> Dict[str, Any]:
        """
        随机指纹值
        
        Args:
            browser_id: 窗口ID
            
        Returns:
            指纹对象
        """
        return self._request('browser/fingerprint/random', {
            'browserId': browser_id
        })
    
    # ==================== 进程管理 ====================
    
    def get_browser_pids(self, browser_ids: List[str]) -> Dict[str, Any]:
        """
        获取已打开窗口的进程PID集合
        
        Args:
            browser_ids: 窗口ID列表
            
        Returns:
            ID到PID的映射字典
        """
        return self._request('browser/pids', {'ids': browser_ids})
    
    def get_all_browser_pids(self) -> Dict[str, Any]:
        """
        获取所有活着的已打开窗口的进程PID
        
        Returns:
            ID到PID的映射字典
        """
        return self._request('browser/pids/all')
    
    def get_alive_browser_pids(self, browser_ids: List[str]) -> Dict[str, Any]:
        """
        获取活着的给定窗口的PIDs
        
        Args:
            browser_ids: 窗口ID列表
            
        Returns:
            ID到PID的映射字典
        """
        return self._request('browser/pids/alive', {'ids': browser_ids})
    
    def get_browser_ports(self) -> Dict[str, Any]:
        """
        获取所有已打开窗口的调试端口
        
        Returns:
            ID到端口的映射字典
        """
        return self._request('browser/ports')
    
    # ==================== RPA任务 ====================
    
    def run_rpa_task(self, rpa_task_id: str) -> Dict[str, Any]:
        """
        执行RPA任务
        
        Args:
            rpa_task_id: RPA任务ID
            
        Returns:
            执行结果
        """
        return self._request('rpa/run', {'id': rpa_task_id})
    
    def stop_rpa_task(self, rpa_task_id: str) -> Dict[str, Any]:
        """
        停止RPA任务
        
        Args:
            rpa_task_id: RPA任务ID
            
        Returns:
            停止结果
        """
        return self._request('rpa/stop', {'id': rpa_task_id})
    
    def auto_paste(self, browser_id: str, url: str) -> Dict[str, Any]:
        """
        仿真输入
        
        Args:
            browser_id: 窗口ID
            url: 调用仿真输入的页面URL
            
        Returns:
            执行结果
        """
        return self._request('autopaste', {
            'browserId': browser_id,
            'url': url
        })
    
    # ==================== 工具函数 ====================
    
    def read_excel_file(self, filepath: str) -> Dict[str, Any]:
        """
        读取本地Excel文件内容
        
        Args:
            filepath: 本地Excel文件的绝对路径
            
        Returns:
            Excel内容
        """
        return self._request('utils/readexcel', {'filepath': filepath})
    
    def read_text_file(self, filepath: str) -> Dict[str, Any]:
        """
        读取文本类文件内容
        
        Args:
            filepath: 本地文件的绝对路径
            
        Returns:
            文件内容
        """
        return self._request('utils/readfile', {'filepath': filepath})
    
    def get_all_displays(self) -> Dict[str, Any]:
        """
        获取所有显示器列表
        
        Returns:
            显示器信息列表
        """
        return self._request('alldisplays')


class BitBrowserManager:
    """
    比特浏览器管理器
    提供更高级的业务封装
    """
    
    def __init__(self, api_url: str = None):
        self.api = BitBrowserAPI(api_url)
    
    def create_profile_simple(
        self,
        name: str,
        platform: str = "PC",
        os: str = "Win32",
        core_version: str = "130",
        proxy: Dict[str, Any] = None,
        group_id: str = None,
        **kwargs
    ) -> str:
        """
        简化的创建浏览器窗口方法
        
        Args:
            name: 窗口名称
            platform: 平台类型 PC/Android/IOS
            os: 操作系统
            core_version: 内核版本
            proxy: 代理配置
            group_id: 分组ID
            **kwargs: 其他参数
            
        Returns:
            窗口ID
        """
        fingerprint = {
            'coreVersion': core_version,
            'ostype': platform,
            'os': os
        }
        
        result = self.api.create_browser(
            name=name,
            browser_fingerprint=fingerprint,
            group_id=group_id,
            proxy_config=proxy,
            **kwargs
        )
        
        return result.get('data', {}).get('id')
    
    def open_and_get_ws(self, browser_id: str) -> str:
        """
        打开浏览器并获取WebSocket连接地址
        
        Args:
            browser_id: 窗口ID
            
        Returns:
            WebSocket连接地址
        """
        result = self.api.open_browser(browser_id)
        return result.get('data', {}).get('ws')
    
    def launch_browser(self, profile_id: str) -> Dict[str, Any]:
        """
        启动浏览器并返回连接信息
        
        Args:
            profile_id: 配置ID
            
        Returns:
            包含ws_endpoint等连接信息
        """
        result = self.api.open_browser(profile_id)
        data = result.get('data', {})
        
        return {
            'profile_id': profile_id,
            'ws_endpoint': data.get('ws'),
            'http_endpoint': data.get('http'),
            'webdriver_endpoint': data.get('webdriver'),
            'pid': data.get('pid'),
        }
    
    def batch_create_browsers(
        self,
        accounts: List[Dict[str, str]],
        template_config: Dict[str, Any],
        proxies: List[Dict[str, Any]] = None
    ) -> List[str]:
        """
        批量创建浏览器窗口
        
        Args:
            accounts: 账号列表
            template_config: 模板配置
            proxies: 代理列表
            
        Returns:
            创建成功的窗口ID列表
        """
        browser_ids = []
        
        for i, account in enumerate(accounts):
            proxy = proxies[i] if proxies and i < len(proxies) else None
            
            try:
                result = self.api.create_browser(
                    name=f"{account.get('email', 'unnamed')}",
                    browser_fingerprint=template_config.get('browserFingerPrint', {}),
                    proxy_config=proxy,
                    userName=account.get('email', ''),
                    password=account.get('password', ''),
                    remark=account.get('remark', '')
                )
                
                browser_id = result.get('data', {}).get('id')
                if browser_id:
                    browser_ids.append(browser_id)
                    
            except BitBrowserAPIError as e:
                print(f"创建失败: {account.get('email')} - {e}")
                continue
        
        return browser_ids
    
    def safe_close_and_delete(self, browser_id: str, wait_seconds: int = 5):
        """
        安全地关闭并删除浏览器窗口
        
        Args:
            browser_id: 窗口ID
            wait_seconds: 等待时间（秒）
        """
        import time
        
        try:
            self.api.close_browser(browser_id)
            time.sleep(wait_seconds)
            self.api.delete_browser(browser_id)
        except BitBrowserAPIError as e:
            print(f"关闭删除失败: {browser_id} - {e}")
    
    def cleanup(self, profile_id: str, delete_profile: bool = False):
        """
        清理浏览器
        
        Args:
            profile_id: 配置ID
            delete_profile: 是否删除配置
        """
        self.api.close_browser(profile_id)
        if delete_profile:
            self.api.delete_browser(profile_id)
    
    def get_all_browsers(self) -> List[Dict[str, Any]]:
        """
        获取所有浏览器（自动翻页）
        
        Returns:
            所有浏览器列表
        """
        all_browsers = []
        page = 0
        page_size = 100
        
        while True:
            result = self.api.list_browsers(page=page, page_size=page_size)
            data = result.get('data', {})
            
            if isinstance(data, list):
                browsers = data
            else:
                browsers = data.get('list', [])
            
            if not browsers:
                break
            
            all_browsers.extend(browsers)
            
            if len(browsers) < page_size:
                break
            
            page += 1
        
        return all_browsers
    
    def get_all_groups(self) -> List[Dict[str, Any]]:
        """
        获取所有分组
        
        Returns:
            所有分组列表
        """
        result = self.api.list_groups(page=0, page_size=100, all_groups=True)
        data = result.get('data', {})
        
        if isinstance(data, list):
            return data
        return data.get('list', [])
    
    def find_browser_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """
        按名称查找浏览器
        
        Args:
            name: 窗口名称
            
        Returns:
            浏览器信息或None
        """
        result = self.api.list_browsers(page=0, page_size=10, name=name)
        data = result.get('data', {})
        
        if isinstance(data, list):
            browsers = data
        else:
            browsers = data.get('list', [])
        
        for browser in browsers:
            if browser.get('name') == name:
                return browser
        
        return None
    
    def get_browsers_by_group(self, group_id: str) -> List[Dict[str, Any]]:
        """
        获取分组下的所有浏览器
        
        Args:
            group_id: 分组ID
            
        Returns:
            浏览器列表
        """
        all_browsers = []
        page = 0
        page_size = 100
        
        while True:
            result = self.api.list_browsers(
                page=page,
                page_size=page_size,
                group_id=group_id
            )
            data = result.get('data', {})
            
            if isinstance(data, list):
                browsers = data
            else:
                browsers = data.get('list', [])
            
            if not browsers:
                break
            
            all_browsers.extend(browsers)
            
            if len(browsers) < page_size:
                break
            
            page += 1
        
        return all_browsers
    
    def get_group_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """
        按名称获取分组
        
        Args:
            name: 分组名称
            
        Returns:
            分组信息或None
        """
        groups = self.get_all_groups()
        
        for group in groups:
            if group.get('groupName') == name:
                return group
        
        return None
