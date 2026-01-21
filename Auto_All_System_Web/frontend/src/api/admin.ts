import request from './request'

export interface DashboardStats {
  users: {
    total: number
    active: number
  }
  tasks: {
    total: number
    pending: number
    running: number
    completed: number
  }
  orders: {
    total: number
    paid: number
  }
  revenue: {
    total: number
  }
  cards: {
    total: number
    active: number
  }
}

const adminApi = {
  // 获取仪表盘统计数据
  getDashboardStats(): Promise<DashboardStats> {
    return request.get('/admin/statistics/dashboard/')
  }
}

export default adminApi

