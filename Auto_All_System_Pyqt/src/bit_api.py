import requests
import json
import time
from bitbrowser_api import BitBrowserAPI

# 官方文档地址
# https://doc2.bitbrowser.cn/jiekou/ben-di-fu-wu-zhi-nan.html

# 已迁移到 Auto_All_System 内部: apps/integrations/bitbrowser/

url = "http://127.0.0.1:54345"
headers = {'Content-Type': 'application/json'}

# 初始化新API实例（全局）
_api_instance = None

def get_api():
    """获取API实例（单例模式）"""
    global _api_instance
    if _api_instance is None:
        _api_instance = BitBrowserAPI()
    return _api_instance


def createBrowser():  # 创建或者更新窗口（使用新API）
    print("正在创建窗口...")
    api = get_api()
    result = api.create_browser(
        name='google',
        browser_fingerprint={'coreVersion': '130'},  # 使用更新的内核版本
        remark=''
    )
    
    if result['success']:
        browserId = result['data']['id']
        print(f"窗口创建成功，ID: {browserId}")
        return browserId
    else:
        raise Exception(f"创建窗口失败: {result}")


def updateBrowser():  # 更新窗口（使用新API）
    api = get_api()
    result = api.update_browser_partial(
        ['93672cf112a044f08b653cab691216f0'],
        {'remark': '我是一个备注'}
    )
    print(result)


def openBrowser(id):  # 直接指定ID打开窗口（使用新API）
    print(f"正在打开窗口 {id}...")
    api = get_api()
    result = api.open_browser(id, queue=True)
    print(f"窗口打开响应: {result}")
    return result


def closeBrowser(id):  # 关闭窗口（使用新API）
    print(f"正在关闭窗口 {id}...")
    api = get_api()
    result = api.close_browser(id)
    print(f"窗口关闭响应: {result}")


def deleteBrowser(id):  # 删除窗口（使用新API）
    print(f"正在删除窗口 {id}...")
    api = get_api()
    result = api.delete_browser(id)
    print(f"窗口删除响应: {result}")


if __name__ == '__main__':
    try:
        browser_id = createBrowser()
        openBrowser(browser_id)

        print("\n等待10秒后自动关闭窗口...")
        time.sleep(10)  # 等待10秒自动关闭窗口

        closeBrowser(browser_id)

        print("\n等待10秒后自动删除窗口...")
        time.sleep(10)  # 等待10秒自动删掉窗口

        deleteBrowser(browser_id)
        print("\n程序执行完成！")
    except requests.exceptions.Timeout:
        print("\n[错误] 请求超时，请检查比特浏览器服务是否正常运行")
    except requests.exceptions.ConnectionError:
        print("\n[错误] 无法连接到比特浏览器API服务，请确保比特浏览器正在运行")
    except Exception as e:
        print(f"\n[错误] 发生异常: {e}")
        import traceback
        traceback.print_exc()
