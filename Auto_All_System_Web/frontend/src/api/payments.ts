import request from './request'

export interface PaymentConfig {
  id?: number
  gateway: string
  name: string
  icon: string
  min_amount: string | number
  max_amount: string | number
  is_enabled?: boolean
  sort_order?: number
  fee_rate?: string | number
  description?: string
  created_at?: string
  updated_at?: string
}

export interface RechargeCardUseRequest {
  card_code: string
}

export interface Order {
  id: number
  order_no: string
  user: number
  user_info: {
    id: number
    username: string
    email: string
  }
  amount: string
  actual_amount?: string
  currency: string
  order_type: string
  status: string
  description: string
  items: any[]
  payment_method: string
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface OrderListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Order[]
}

export const paymentsApi = {
  // 获取启用的支付方式
  getEnabledPaymentMethods(): Promise<PaymentConfig[]> {
    return request.get('/payments/payment-configs/enabled/')
  },

  // 使用卡密充值
  useCardCode(data: RechargeCardUseRequest): Promise<any> {
    return request.post('/payments/card-recharge/use/', data)
  },

  // 获取订单列表
  getOrders(params?: {
    page?: number
    page_size?: number
    status?: string
    order_type?: string
  }): Promise<OrderListResponse> {
    return request.get('/payments/orders/', { params })
  },

  // 获取单个订单
  getOrder(id: number): Promise<Order> {
    return request.get(`/payments/orders/${id}/`)
  },

  // 取消订单
  cancelOrder(id: number): Promise<Order> {
    return request.post(`/payments/orders/${id}/cancel/`)
  },

  // 退款（管理员）
  refundOrder(id: number): Promise<Order> {
    return request.post(`/payments/orders/${id}/refund/`)
  },

  // ===== 支付配置管理API（管理员） =====
  
  // 获取所有支付配置
  getAllPaymentConfigs(): Promise<PaymentConfig[]> {
    return request.get('/payments/payment-configs/')
  },

  // 获取单个支付配置
  getPaymentConfig(id: number): Promise<PaymentConfig> {
    return request.get(`/payments/payment-configs/${id}/`)
  },

  // 更新支付配置
  updatePaymentConfig(id: number, data: Partial<PaymentConfig>): Promise<PaymentConfig> {
    return request.put(`/payments/payment-configs/${id}/`, data)
  },

  // 部分更新支付配置
  patchPaymentConfig(id: number, data: Partial<PaymentConfig>): Promise<PaymentConfig> {
    return request.patch(`/payments/payment-configs/${id}/`, data)
  },

  // ===== 充值卡密管理API（管理员） =====
  
  // 获取充值卡密列表
  getRechargeCards(params?: {
    page?: number
    page_size?: number
    status?: string
    amount?: number
  }): Promise<any> {
    return request.get('/payments/recharge-cards/', { params })
  },

  // 批量生成卡密
  batchCreateCards(data: {
    count: number
    amount: number
    prefix?: string
    expires_days?: number
    notes?: string
  }): Promise<any> {
    return request.post('/payments/recharge-cards/batch_create/', data)
  },

  // 禁用卡密
  disableCard(id: number): Promise<any> {
    return request.patch(`/payments/recharge-cards/${id}/`, { status: 'disabled' })
  },

  // 启用卡密
  enableCard(id: number): Promise<any> {
    return request.patch(`/payments/recharge-cards/${id}/`, { status: 'unused' })
  },

  // 导出批次卡密
  exportBatch(batch_no: string): Promise<any> {
    return request.get('/payments/recharge-cards/export_batch/', { params: { batch_no } })
  },

  // 批量导出卡密（支持筛选）
  exportFilteredCards(params?: {
    status?: string
    amount?: number
    batch_no?: string
  }): Promise<any> {
    return request.get('/payments/recharge-cards/export_filtered/', { params })
  }
}

