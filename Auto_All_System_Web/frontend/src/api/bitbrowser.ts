/**
 * 比特浏览器管理API
 */
import request from './request'
import type { ApiResponse } from '@/types'

// 类型定义
export interface BrowserGroup {
  id: string
  group_name: string
  bitbrowser_group_id: string
  description: string
  sort_order: number
  window_count: number
  created_at: string
  updated_at: string
}

export interface ProxyInfo {
  id: string
  name: string
  country: string
  status: string
}

export interface BrowserWindowRecord {
  id: string
  browser_id: string
  browser_name: string
  group: string | null
  group_name?: string
  account_email: string
  proxy: string | null
  proxy_info?: ProxyInfo | null
  platform_url: string
  extra_urls: string
  status: 'active' | 'inactive' | 'deleted'
  open_count: number
  last_opened_at: string | null
  remark: string
  created_at: string
  updated_at: string
}

export interface AccountData {
  email: string
  password: string
  backup_email?: string
  '2fa_secret'?: string
}

export interface BatchCreateRequest {
  template_browser_id?: string
  group_name: string
  platform_url?: string
  extra_urls?: string
  accounts: AccountData[]
  proxy_ids?: string[]
  name_prefix?: string
}

export interface BatchCreateResult {
  email: string
  browser_id?: string
  browser_name?: string
  error?: string
  status: 'success' | 'failed'
}

export interface ParseAccountsRequest {
  account_text: string
  separator?: string
}

// API函数
export const bitbrowserApi = {
  // ========== 分组管理 ==========
  
  /**
   * 获取分组列表
   */
  getGroups(): Promise<ApiResponse<BrowserGroup[]>> {
    return request.get('/bitbrowser/groups/')
  },
  
  /**
   * 创建分组
   */
  createGroup(data: { group_name: string; description?: string }): Promise<ApiResponse<BrowserGroup>> {
    return request.post('/bitbrowser/groups/', data)
  },
  
  /**
   * 从比特浏览器同步分组
   */
  syncGroups(): Promise<ApiResponse<{ synced: number; total: number }>> {
    return request.post('/bitbrowser/groups/sync/')
  },
  
  // ========== 窗口记录管理 ==========
  
  /**
   * 获取窗口记录列表
   * 注意：返回的是比特浏览器API的原始格式 { list, total }
   */
  getWindows(params?: {
    group_id?: string
    status?: string
    page?: number
    page_size?: number
  }): Promise<ApiResponse<{ list: any[]; total: number }>> {
    return request.get('/bitbrowser/windows/', { params })
  },
  
  /**
   * 解析账号文本
   */
  parseAccounts(data: ParseAccountsRequest): Promise<ApiResponse<{
    accounts: AccountData[]
    count: number
  }>> {
    return request.post('/bitbrowser/windows/parse_accounts/', data)
  },
  
  /**
   * 批量创建窗口
   */
  batchCreateWindows(data: BatchCreateRequest): Promise<ApiResponse<{
    total: number
    success: number
    failed: number
    results: BatchCreateResult[]
  }>> {
    return request.post('/bitbrowser/windows/batch_create/', data)
  },
  
  /**
   * 打开窗口
   */
  openWindow(id: string): Promise<ApiResponse<{
    ws: string
    http: string
    driver: string
    pid: number
  }>> {
    return request.post(`/bitbrowser/windows/${id}/open_window/`)
  },
  
  /**
   * 关闭窗口
   */
  closeWindow(id: string): Promise<ApiResponse<any>> {
    return request.post(`/bitbrowser/windows/${id}/close_window/`)
  },
  
  /**
   * 删除窗口
   */
  deleteWindow(id: string): Promise<ApiResponse<any>> {
    return request.delete(`/bitbrowser/windows/${id}/delete_window/`)
  },
  
  /**
   * 从比特浏览器同步窗口列表
   */
  syncWindows(): Promise<ApiResponse<{ synced: number; total: number }>> {
    return request.post('/bitbrowser/windows/sync/')
  }
}

