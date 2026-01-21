// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  phone: string | null
  avatar: string | null
  role: 'user' | 'admin' | 'super_admin'
  is_active: boolean
  is_verified: boolean
  is_staff: boolean
  is_superuser: boolean
  date_joined: string
  last_login: string | null
  created_at: string
  balance?: string | number  // 余额字段
}

export interface UserBalance {
  id: number
  user: number
  balance: string
  frozen_balance: string
  currency: string
  last_recharge_at: string | null
}

export interface BalanceTransaction {
  id: number
  user: number
  transaction_type: string
  amount: string
  balance_before: string
  balance_after: string
  related_task: number | null
  description: string
  created_at: string
}

// 专区相关类型
export interface Zone {
  id: number
  name: string
  slug: string
  description: string
  icon: string | null
  category: string
  is_active: boolean
  base_price: string
  min_balance: string
  created_at: string
}

export interface ZoneConfig {
  id: number
  zone: number
  config_key: string
  config_value: any
  value_type: string
  description: string
  is_user_configurable: boolean
}

// 任务相关类型
export type TaskStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled'

export interface Task {
  id: number
  user: number
  zone: number
  zone_name?: string
  task_type: string
  status: TaskStatus
  priority: number
  progress: number
  input_data: any
  output_data: any
  error_message: string | null
  cost_amount: string
  start_time: string | null
  end_time: string | null
  created_at: string
  celery_task_id: string | null
}

export interface TaskLog {
  id: number
  task: number
  timestamp: string
  level: string
  message: string
  step: string | null
  metadata: any
}

// 虚拟卡相关类型
export type CardStatus = 'available' | 'in_use' | 'used' | 'invalid' | 'expired'

export interface Card {
  id: number
  owner_user: number | null
  owner_user_name?: string | null
  card_number?: string // write_only
  masked_card_number: string
  card_holder: string
  expiry_month: number
  expiry_year: number
  cvv?: string // write_only
  card_type: string
  bank_name: string | null
  billing_address: any
  status: CardStatus
  status_display?: string
  balance: string | number | null
  use_count: number
  success_count: number
  success_rate: number
  max_use_count: number | null
  pool_type: 'public' | 'private'
  pool_type_display?: string
  notes?: string
  last_used_at: string | null
  created_at: string
  updated_at: string
}

// API响应类型
export interface ApiResponse<T = any> {
  code?: number
  message?: string
  data?: T
  success?: boolean
  created_count?: number
  updated_count?: number
  failed_count?: number
  errors?: any[]
  [key: string]: any  // 允许额外的字段
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// 表单相关类型
export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm {
  username: string
  email: string
  password: string
  password_confirm: string
}

export interface TaskCreateForm {
  zone: number
  task_type: string
  priority: number
  input_data: any
}

export interface CardCreateForm {
  card_number: string
  card_holder?: string
  expiry_month: number
  expiry_year: number
  cvv: string
  card_type: string
  pool_type: string
}

// Google账号相关类型
export interface GoogleAccount {
  id: number
  email: string
  password?: string
  recovery_email?: string
  status: string
  status_display?: string
  sheerid_verified: boolean
  sheerid_link?: string
  gemini_status?: string
  card_bound: boolean
  subscribed?: boolean
  notes?: string
  last_login_at?: string
  created_at: string
  updated_at: string
}

