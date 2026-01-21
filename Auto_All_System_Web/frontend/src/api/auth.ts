import request from './request'
import type { User } from '@/types'

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface RegisterResponse {
  access_token: string
  refresh_token: string
  user: User
}

export const authApi = {
  // 登录
  login(username: string, password: string): Promise<LoginResponse> {
    return request.post('/auth/login/', { username, password })
  },

  // 注册
  register(data: {
    username: string
    email: string
    password: string
    password_confirm: string
  }): Promise<RegisterResponse> {
    return request.post('/auth/register/', data)
  },

  // 登出
  logout(): Promise<void> {
    return request.post('/auth/logout/')
  },

  // 刷新Token
  refreshToken(refresh: string): Promise<{ access_token: string }> {
    return request.post('/token/refresh/', { refresh })
  },

  // 获取当前用户信息
  getCurrentUser(): Promise<User> {
    return request.get('/users/me/')
  }
}

