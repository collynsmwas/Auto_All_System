import request from './request'
import type { Card, PaginatedResponse, CardCreateForm } from '@/types'

export const cardsApi = {
  // 获取虚拟卡列表
  getCards(params?: any): Promise<PaginatedResponse<Card>> {
    return request.get('/cards/', { params })
  },

  // 创建虚拟卡
  createCard(data: CardCreateForm): Promise<Card> {
    return request.post('/cards/', data)
  },

  // 获取虚拟卡详情
  getCard(id: number): Promise<Card> {
    return request.get(`/cards/${id}/`)
  },

  // 更新虚拟卡
  updateCard(id: number, data: Partial<CardCreateForm>): Promise<Card> {
    return request.put(`/cards/${id}/`, data)
  },

  // 删除虚拟卡
  deleteCard(id: number): Promise<void> {
    return request.delete(`/cards/${id}/`)
  },

  // 获取可用虚拟卡
  getAvailableCards(params?: any): Promise<Card[]> {
    return request.get('/cards/available/', { params })
  },

  // 获取我的虚拟卡
  getMyCards(): Promise<Card[]> {
    return request.get('/cards/my_cards/')
  },

  // 批量导入虚拟卡
  importCards(data: { 
    cards_data: Array<{
      card_number: string
      card_holder?: string
      expiry_month: number
      expiry_year: number
      cvv: string
      card_type?: string
    }>, 
    pool_type: string 
  }): Promise<{ 
    total: number
    success: number
    failed: number
    errors: Array<{card_number: string, error: string}>
  }> {
    return request.post('/cards/import_cards/', data)
  }
}

