/**
 * Google Business 插件 API
 * 提供账号、任务、卡信息等管理接口
 */
import request from './request';
// ==================== 账号管理 ====================
/**
 * 获取Google账号列表
 */
export function getGoogleAccounts(params) {
    return request({
        url: '/plugins/google-business/accounts/',
        method: 'get',
        params
    });
}
/**
 * 获取单个Google账号详情
 */
export function getGoogleAccount(id) {
    return request({
        url: `/plugins/google-business/accounts/${id}/`,
        method: 'get'
    });
}
/**
 * 创建Google账号
 */
export function createGoogleAccount(data) {
    return request({
        url: '/plugins/google-business/accounts/',
        method: 'post',
        data
    });
}
/**
 * 更新Google账号
 */
export function updateGoogleAccount(id, data) {
    return request({
        url: `/plugins/google-business/accounts/${id}/`,
        method: 'patch',
        data
    });
}
/**
 * 删除Google账号
 */
export function deleteGoogleAccount(id) {
    return request({
        url: `/plugins/google-business/accounts/${id}/`,
        method: 'delete'
    });
}
/**
 * 批量导入Google账号
 */
export function batchImportAccounts(data) {
    return request({
        url: '/plugins/google-business/accounts/import-accounts/',
        method: 'post',
        data
    });
}
/**
 * 批量导入Google账号（简化版）
 */
export function batchImportGoogleAccounts(accounts) {
    return request({
        url: '/plugins/google-business/accounts/import-accounts/',
        method: 'post',
        data: { accounts }
    });
}
/**
 * 批量删除Google账号
 */
export function batchDeleteAccounts(data) {
    return request({
        url: '/plugins/google-business/accounts/bulk-delete/',
        method: 'post',
        data
    });
}
/**
 * 获取账号统计信息
 */
export function getAccountStats() {
    return request({
        url: '/plugins/google-business/accounts/stats/',
        method: 'get'
    });
}
/**
 * 获取Google统计信息（别名）
 */
export function getGoogleStatistics() {
    return request({
        url: '/plugins/google-business/accounts/stats/',
        method: 'get'
    });
}
// ==================== 任务管理 ====================
/**
 * 获取任务列表
 */
export function getTasks(params) {
    return request({
        url: '/plugins/google-business/tasks/',
        method: 'get',
        params
    });
}
/**
 * 获取单个任务详情
 */
export function getTask(id) {
    return request({
        url: `/plugins/google-business/tasks/${id}/`,
        method: 'get'
    });
}
/**
 * 创建任务
 */
export function createTask(data) {
    return request({
        url: '/plugins/google-business/tasks/',
        method: 'post',
        data
    });
}
/**
 * 创建Google任务（别名）
 */
export function createGoogleTask(data) {
    return request({
        url: '/plugins/google-business/tasks/',
        method: 'post',
        data
    });
}
/**
 * 取消任务
 */
export function cancelTask(id) {
    return request({
        url: `/plugins/google-business/tasks/${id}/cancel/`,
        method: 'post'
    });
}
/**
 * 删除任务
 */
export function deleteTask(id) {
    return request({
        url: `/plugins/google-business/tasks/${id}/`,
        method: 'delete'
    });
}
/**
 * 获取任务日志
 */
export function getTaskLogs(taskId, params) {
    return request({
        url: `/plugins/google-business/tasks/${taskId}/logs/`,
        method: 'get',
        params
    });
}
/**
 * 获取任务统计
 */
export function getTaskStats() {
    return request({
        url: '/plugins/google-business/tasks/stats/',
        method: 'get'
    });
}
/**
 * 重试失败的任务账号
 */
export function retryTaskAccounts(taskId, data) {
    return request({
        url: `/plugins/google-business/tasks/${taskId}/retry/`,
        method: 'post',
        data
    });
}
// ==================== 任务账号管理 ====================
/**
 * 获取任务账号列表
 */
export function getTaskAccounts(params) {
    return request({
        url: '/plugins/google-business/task-accounts/',
        method: 'get',
        params
    });
}
/**
 * 获取单个任务账号详情
 */
export function getTaskAccount(id) {
    return request({
        url: `/plugins/google-business/task-accounts/${id}/`,
        method: 'get'
    });
}
// ==================== 卡信息管理 ====================
/**
 * 获取卡信息列表
 */
export function getCards(params) {
    return request({
        url: '/plugins/google-business/cards/',
        method: 'get',
        params
    });
}
/**
 * 获取单个卡信息详情
 */
export function getCard(id) {
    return request({
        url: `/plugins/google-business/cards/${id}/`,
        method: 'get'
    });
}
/**
 * 创建卡信息
 */
export function createCard(data) {
    return request({
        url: '/plugins/google-business/cards/',
        method: 'post',
        data
    });
}
/**
 * 更新卡信息
 */
export function updateCard(id, data) {
    return request({
        url: `/plugins/google-business/cards/${id}/`,
        method: 'patch',
        data
    });
}
/**
 * 删除卡信息
 */
export function deleteCard(id) {
    return request({
        url: `/plugins/google-business/cards/${id}/`,
        method: 'delete'
    });
}
/**
 * 批量导入卡信息
 */
export function batchImportCards(data) {
    return request({
        url: '/plugins/google-business/cards/import_cards/',
        method: 'post',
        data
    });
}
/**
 * 上传Google卡片（简化版）
 */
export function uploadGoogleCards(cards) {
    return request({
        url: '/plugins/google-business/cards/import_cards/',
        method: 'post',
        data: { cards }
    });
}
/**
 * 批量删除卡信息
 */
export function batchDeleteCards(data) {
    return request({
        url: '/plugins/google-business/cards/bulk-delete/',
        method: 'post',
        data
    });
}
/**
 * 获取卡信息统计
 */
export function getCardStats() {
    return request({
        url: '/plugins/google-business/cards/stats/',
        method: 'get'
    });
}
// ==================== 插件配置 ====================
/**
 * 获取插件配置
 */
export function getPluginConfig() {
    return request({
        url: '/plugins/google-business/config/',
        method: 'get'
    });
}
/**
 * 更新插件配置
 */
export function updatePluginConfig(data) {
    return request({
        url: '/plugins/google-business/config/',
        method: 'post',
        data
    });
}
// ==================== 统计数据 ====================
/**
 * 获取插件仪表板统计
 */
export function getDashboardStats() {
    return request({
        url: '/plugins/google-business/dashboard/stats/',
        method: 'get'
    });
}
/**
 * 获取费用统计
 */
export function getCostStats(params) {
    return request({
        url: '/plugins/google-business/dashboard/cost-stats/',
        method: 'get',
        params
    });
}
/**
 * 获取任务趋势
 */
export function getTaskTrends(params) {
    return request({
        url: '/plugins/google-business/dashboard/task-trends/',
        method: 'get',
        params
    });
}
// ==================== WebSocket ====================
/**
 * 获取WebSocket连接URL
 */
export function getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/google-business/`;
}
/**
 * 订阅任务进度
 */
export function subscribeTaskProgress(taskId, callback) {
    const ws = new WebSocket(`${getWebSocketUrl()}tasks/${taskId}/`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callback(data);
    };
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    return ws;
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
};
