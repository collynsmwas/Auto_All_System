/**
 * 代理管理API
 */
import request from './request'
import type { ApiResponse } from '@/types'

// 类型定义
export interface Proxy {
  id: string
  proxy_type: 'http' | 'https' | 'socks5'
  host: string
  port: number
  username: string
  password: string
  country: string
  region: string
  city: string
  status: 'active' | 'inactive' | 'testing'
  response_time: number
  success_rate: number
  use_count: number
  last_used_at: string | null
  last_check_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  proxy_url: string
}

export interface ProxyCreateRequest {
  proxy_type: 'http' | 'https' | 'socks5'
  host: string
  port: number
  username?: string
  password?: string
  country?: string
  region?: string
  city?: string
  status?: 'active' | 'inactive' | 'testing'
}

export interface ProxyBatchImportRequest {
  proxy_text: string
}

export interface ProxyTestRequest {
  proxy_id?: string
  proxy_type?: 'http' | 'https' | 'socks5'
  host?: string
  port?: number
  username?: string
  password?: string
}

export interface ProxyTestResult {
  ip: string
  country: string
  city: string
  timezone: string
}

// API函数
export const proxiesApi = {
  /**
   * 获取代理列表
   */
  getProxies(params?: {
    status?: string
    country?: string
    proxy_type?: string
    page?: number
    page_size?: number
  }): Promise<ApiResponse<{ results: Proxy[]; count: number }>> {
    return request.get('/proxies/', { params })
  },

  /**
   * 创建代理
   */
  createProxy(data: ProxyCreateRequest): Promise<ApiResponse<Proxy>> {
    return request.post('/proxies/', data)
  },

  /**
   * 更新代理
   */
  updateProxy(id: string, data: Partial<ProxyCreateRequest>): Promise<ApiResponse<Proxy>> {
    return request.patch(`/proxies/${id}/`, data)
  },

  /**
   * 删除代理
   */
  deleteProxy(id: string): Promise<ApiResponse<any>> {
    return request.delete(`/proxies/${id}/`)
  },

  /**
   * 批量导入代理
   */
  batchImport(data: ProxyBatchImportRequest): Promise<ApiResponse<{
    total: number
    success: number
    failed: number
    errors: any[]
  }>> {
    return request.post('/proxies/batch_import/', data)
  },

  /**
   * 测试代理
   */
  testProxy(id: string): Promise<ApiResponse<ProxyTestResult>> {
    return request.post(`/proxies/${id}/test/`)
  },

  /**
   * 测试代理连接（不保存）
   */
  testConnection(data: ProxyTestRequest): Promise<ApiResponse<ProxyTestResult>> {
    return request.post('/proxies/test_connection/', data)
  },

  /**
   * 批量测试代理
   */
  batchTest(proxyIds: string[]): Promise<ApiResponse<any[]>> {
    return request.post('/proxies/batch_test/', { proxy_ids: proxyIds })
  }
}

