/**
 * Google Business 插件 API
 * 提供账号、任务、卡信息等管理接口
 */
import request from './request'

// ==================== 账号管理 ====================

/**
 * 获取Google账号列表
 */
export function getGoogleAccounts(params?: {
  page?: number
  page_size?: number
  search?: string
  status?: string
  ordering?: string
}) {
  return request({
    url: '/plugins/google-business/accounts/',
    method: 'get',
    params
  })
}

/**
 * 获取单个Google账号详情
 */
export function getGoogleAccount(id: number) {
  return request({
    url: `/plugins/google-business/accounts/${id}/`,
    method: 'get'
  })
}

/**
 * 创建Google账号
 */
export function createGoogleAccount(data: {
  email: string
  password?: string
  secret_key?: string
  recovery_email?: string
  browser_id?: string
}) {
  return request({
    url: '/plugins/google-business/accounts/',
    method: 'post',
    data
  })
}

/**
 * 更新Google账号
 */
export function updateGoogleAccount(id: number, data: any) {
  return request({
    url: `/plugins/google-business/accounts/${id}/`,
    method: 'patch',
    data
  })
}

/**
 * 删除Google账号
 */
export function deleteGoogleAccount(id: number) {
  return request({
    url: `/plugins/google-business/accounts/${id}/`,
    method: 'delete'
  })
}

/**
 * 批量导入Google账号
 */
export function batchImportAccounts(data: {
  accounts: Array<{
    email: string
    password?: string
    secret_key?: string
    recovery_email?: string
    browser_id?: string
  }>
}) {
  return request({
    url: '/plugins/google-business/accounts/import-accounts/',
    method: 'post',
    data
  })
}

/**
 * 批量导入Google账号（简化版）
 */
export function batchImportGoogleAccounts(accounts: Array<any>) {
  return request({
    url: '/plugins/google-business/accounts/import-accounts/',
    method: 'post',
    data: { accounts }
  })
}

/**
 * 批量删除Google账号
 */
export function batchDeleteAccounts(data: { ids: number[] }) {
  return request({
    url: '/plugins/google-business/accounts/bulk-delete/',
    method: 'post',
    data
  })
}

/**
 * 获取账号统计信息
 */
export function getAccountStats() {
  return request({
    url: '/plugins/google-business/accounts/stats/',
    method: 'get'
  })
}

/**
 * 获取Google统计信息（别名）
 */
export function getGoogleStatistics() {
  return request({
    url: '/plugins/google-business/accounts/stats/',
    method: 'get'
  })
}

// ==================== 任务管理 ====================

/**
 * 获取任务列表
 */
export function getTasks(params?: {
  page?: number
  page_size?: number
  status?: string
  task_type?: string
  ordering?: string
}) {
  return request({
    url: '/plugins/google-business/tasks/',
    method: 'get',
    params
  })
}

/**
 * 获取单个任务详情
 */
export function getTask(id: number) {
  return request({
    url: `/plugins/google-business/tasks/${id}/`,
    method: 'get'
  })
}

/**
 * 创建任务
 */
export function createTask(data: {
  task_type: 'login' | 'get_link' | 'verify' | 'bind_card' | 'one_click'
  account_ids: number[]
  config?: {
    api_key?: string
    card_id?: number
    [key: string]: any
  }
}) {
  return request({
    url: '/plugins/google-business/tasks/',
    method: 'post',
    data
  })
}

/**
 * 创建Google任务（别名）
 */
export function createGoogleTask(data: any) {
  return request({
    url: '/plugins/google-business/tasks/',
    method: 'post',
    data
  })
}

/**
 * 取消任务
 */
export function cancelTask(id: number) {
  return request({
    url: `/plugins/google-business/tasks/${id}/cancel/`,
    method: 'post'
  })
}

/**
 * 删除任务
 */
export function deleteTask(id: number) {
  return request({
    url: `/plugins/google-business/tasks/${id}/`,
    method: 'delete'
  })
}

/**
 * 获取任务日志
 */
export function getTaskLogs(taskId: number, params?: {
  page?: number
  page_size?: number
}) {
  return request({
    url: `/plugins/google-business/tasks/${taskId}/logs/`,
    method: 'get',
    params
  })
}

/**
 * 获取任务统计
 */
export function getTaskStats() {
  return request({
    url: '/plugins/google-business/tasks/stats/',
    method: 'get'
  })
}

/**
 * 重试失败的任务账号
 */
export function retryTaskAccounts(taskId: number, data: { account_ids: number[] }) {
  return request({
    url: `/plugins/google-business/tasks/${taskId}/retry/`,
    method: 'post',
    data
  })
}

// ==================== 任务账号管理 ====================

/**
 * 获取任务账号列表
 */
export function getTaskAccounts(params?: {
  task_id?: number
  status?: string
  page?: number
  page_size?: number
}) {
  return request({
    url: '/plugins/google-business/task-accounts/',
    method: 'get',
    params
  })
}

/**
 * 获取单个任务账号详情
 */
export function getTaskAccount(id: number) {
  return request({
    url: `/plugins/google-business/task-accounts/${id}/`,
    method: 'get'
  })
}

// ==================== 卡信息管理 ====================

/**
 * 获取卡信息列表
 */
export function getCards(params?: {
  page?: number
  page_size?: number
  search?: string
  is_active?: boolean
  ordering?: string
}) {
  return request({
    url: '/plugins/google-business/cards/',
    method: 'get',
    params
  })
}

/**
 * 获取单个卡信息详情
 */
export function getCard(id: number) {
  return request({
    url: `/plugins/google-business/cards/${id}/`,
    method: 'get'
  })
}

/**
 * 创建卡信息
 */
export function createCard(data: {
  card_number: string
  exp_month: string
  exp_year: string
  cvv: string
  card_holder?: string
  billing_address?: string
  is_active?: boolean
}) {
  return request({
    url: '/plugins/google-business/cards/',
    method: 'post',
    data
  })
}

/**
 * 更新卡信息
 */
export function updateCard(id: number, data: any) {
  return request({
    url: `/plugins/google-business/cards/${id}/`,
    method: 'patch',
    data
  })
}

/**
 * 删除卡信息
 */
export function deleteCard(id: number) {
  return request({
    url: `/plugins/google-business/cards/${id}/`,
    method: 'delete'
  })
}

/**
 * 批量导入卡信息
 */
export function batchImportCards(data: {
  cards: Array<{
    card_number: string
    exp_month: string
    exp_year: string
    cvv: string
    card_holder?: string
  }>
}) {
  return request({
    url: '/plugins/google-business/cards/import_cards/',
    method: 'post',
    data
  })
}

/**
 * 上传Google卡片（简化版）
 */
export function uploadGoogleCards(cards: string[]) {
  return request({
    url: '/plugins/google-business/cards/import_cards/',
    method: 'post',
    data: { cards }
  })
}

/**
 * 批量删除卡信息
 */
export function batchDeleteCards(data: { ids: number[] }) {
  return request({
    url: '/plugins/google-business/cards/bulk-delete/',
    method: 'post',
    data
  })
}

/**
 * 获取卡信息统计
 */
export function getCardStats() {
  return request({
    url: '/plugins/google-business/cards/stats/',
    method: 'get'
  })
}

// ==================== 插件配置 ====================

/**
 * 获取插件配置
 */
export function getPluginConfig() {
  return request({
    url: '/plugins/google-business/config/',
    method: 'get'
  })
}

/**
 * 更新插件配置
 */
export function updatePluginConfig(data: {
  sheerid_api_key?: string
  default_timeout?: number
  max_concurrent_tasks?: number
  [key: string]: any
}) {
  return request({
    url: '/plugins/google-business/config/',
    method: 'post',
    data
  })
}

// ==================== 统计数据 ====================

/**
 * 获取插件仪表板统计
 */
export function getDashboardStats() {
  return request({
    url: '/plugins/google-business/dashboard/stats/',
    method: 'get'
  })
}

/**
 * 获取费用统计
 */
export function getCostStats(params?: {
  start_date?: string
  end_date?: string
  group_by?: 'day' | 'week' | 'month'
}) {
  return request({
    url: '/plugins/google-business/dashboard/cost-stats/',
    method: 'get',
    params
  })
}

/**
 * 获取任务趋势
 */
export function getTaskTrends(params?: {
  start_date?: string
  end_date?: string
  group_by?: 'day' | 'week' | 'month'
}) {
  return request({
    url: '/plugins/google-business/dashboard/task-trends/',
    method: 'get',
    params
  })
}

// ==================== WebSocket ====================

/**
 * 获取WebSocket连接URL
 */
export function getWebSocketUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  return `${protocol}//${host}/ws/google-business/`
}

/**
 * 订阅任务进度
 */
export function subscribeTaskProgress(taskId: number, callback: (data: any) => void) {
  const ws = new WebSocket(`${getWebSocketUrl()}tasks/${taskId}/`)
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    callback(data)
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
  
  return ws
}

export default {
  // 账号管理
  getGoogleAccounts,
  getGoogleAccount,
  createGoogleAccount,
  updateGoogleAccount,
  deleteGoogleAccount,
  batchImportAccounts,
  batchDeleteAccounts,
  getAccountStats,
  
  // 任务管理
  getTasks,
  getTask,
  createTask,
  cancelTask,
  deleteTask,
  getTaskLogs,
  getTaskStats,
  retryTaskAccounts,
  
  // 任务账号
  getTaskAccounts,
  getTaskAccount,
  
  // 卡信息管理
  getCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  batchImportCards,
  batchDeleteCards,
  getCardStats,
  
  // 插件配置
  getPluginConfig,
  updatePluginConfig,
  
  // 统计数据
  getDashboardStats,
  getCostStats,
  getTaskTrends,
  
  // WebSocket
  getWebSocketUrl,
  subscribeTaskProgress
}

