import request from './request'
import type { ApiResponse, GoogleAccount, PaginatedResponse } from '@/types'

export const googleAccountsApi = {
  // 获取Google账号列表
  getAccounts(params?: any): Promise<PaginatedResponse<GoogleAccount>> {
    return request.get('/plugins/google-business/accounts/', { params })
  },

  // 获取账号统计
  getStats(): Promise<ApiResponse<any>> {
    return request.get('/plugins/google-business/accounts/stats/')
  },

  // 创建账号
  createAccount(data: Partial<GoogleAccount>): Promise<ApiResponse<GoogleAccount>> {
    return request.post('/plugins/google-business/accounts/', data)
  },

  // 更新账号
  updateAccount(id: number, data: Partial<GoogleAccount>): Promise<ApiResponse<GoogleAccount>> {
    return request.put(`/plugins/google-business/accounts/${id}/`, data)
  },

  // 删除账号
  deleteAccount(id: number): Promise<ApiResponse<any>> {
    return request.delete(`/plugins/google-business/accounts/${id}/`)
  },

  // 批量导入账号
  importAccounts(data: { accounts: string[]; format?: string; match_browser?: boolean; overwrite_existing?: boolean }): Promise<ApiResponse<any>> {
    return request.post('/plugins/google-business/accounts/import_accounts/', data)
  },

  // 批量删除账号
  bulkDeleteAccounts(ids: number[]): Promise<ApiResponse<any>> {
    return request.post('/plugins/google-business/accounts/bulk_delete/', { ids })
  },

  // SheerID验证
  verifyWithSheerID(id: number): Promise<ApiResponse<any>> {
    return request.post(`/plugins/google-business/accounts/${id}/verify_sheerid/`)
  },

  // 绑定虚拟卡
  bindCard(accountId: number, cardId: number): Promise<ApiResponse<any>> {
    return request.post(`/plugins/google-business/accounts/${accountId}/bind_card/`, { card_id: cardId })
  },

  // 一键自动化
  automate(accountId: number): Promise<ApiResponse<any>> {
    return request.post(`/plugins/google-business/accounts/${accountId}/automate/`)
  }
}

// Google虚拟卡API
export const googleCardsApi = {
  // 获取虚拟卡列表
  getCards(params?: any): Promise<PaginatedResponse<any>> {
    return request.get('/plugins/google-business/cards/', { params })
  },

  // 创建虚拟卡
  createCard(data: any): Promise<ApiResponse<any>> {
    return request.post('/plugins/google-business/cards/', data)
  },

  // 更新虚拟卡
  updateCard(id: number, data: any): Promise<ApiResponse<any>> {
    return request.put(`/plugins/google-business/cards/${id}/`, data)
  },

  // 删除虚拟卡
  deleteCard(id: number): Promise<ApiResponse<any>> {
    return request.delete(`/plugins/google-business/cards/${id}/`)
  },

  // 批量导入虚拟卡
  importCards(data: { cards_data: string[]; max_usage?: number; pool_type?: string }): Promise<ApiResponse<any>> {
    return request.post('/plugins/google-business/cards/import_cards/', data)
  }
}

