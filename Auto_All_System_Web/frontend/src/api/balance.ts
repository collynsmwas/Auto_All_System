import request from './request'
import type { UserBalance } from '@/types'

export interface BalanceLog {
  id: number
  user: number
  amount: string
  balance_after: string
  transaction_type: string
  description: string
  related_task: number | null
  related_order: number | null
  created_at: string
}

export const balanceApi = {
  // 获取我的余额
  getMyBalance(): Promise<UserBalance> {
    return request.get('/balance/my_balance/')
  },

  // 充值
  recharge(data: { amount: number }): Promise<UserBalance> {
    return request.post('/balance/recharge/', data)
  },

  // 获取余额变动记录
  getBalanceLogs(params?: any): Promise<{ count: number; results: BalanceLog[] }> {
    return request.get('/balance/logs/', { params })
  }
}

