import request from './request'

export interface User {
  id: number
  username: string
  email: string
  phone?: string
  is_staff: boolean
  is_active: boolean
  created_at: string
  last_login?: string
}

export interface UserListResponse {
  count: number
  next: string | null
  previous: string | null
  results: User[]
}

export interface UserBalance {
  user: number
  user_info?: {
    username: string
    email: string
  }
  balance: string
  frozen_amount: string
  available_balance: string
  currency: string
  updated_at: string
}

export interface BalanceListResponse {
  count: number
  next: string | null
  previous: string | null
  results: UserBalance[]
}

const usersApi = {
  // 获取用户列表
  getUsers(params?: {
    page?: number
    page_size?: number
    search?: string
    is_active?: boolean
    is_staff?: boolean
  }): Promise<UserListResponse> {
    return request.get('/users/', { params })
  },

  // 获取单个用户
  getUser(id: number): Promise<User> {
    return request.get(`/users/${id}/`)
  },

  // 创建用户
  createUser(data: {
    username: string
    email: string
    password: string
    phone?: string
    is_staff?: boolean
    is_active?: boolean
  }): Promise<User> {
    return request.post('/users/', data)
  },

  // 更新用户
  updateUser(id: number, data: Partial<User>): Promise<User> {
    return request.put(`/users/${id}/`, data)
  },

  // 删除用户
  deleteUser(id: number): Promise<void> {
    return request.delete(`/users/${id}/`)
  },

  // 获取用户余额列表（管理员）
  getUserBalances(params?: {
    page?: number
    page_size?: number
  }): Promise<BalanceListResponse> {
    return request.get('/balance/', { params })
  },

  // 重置用户密码（管理员）
  resetPassword(id: number, password: string): Promise<void> {
    return request.post(`/users/${id}/reset_password/`, { password })
  }
}

export default usersApi

