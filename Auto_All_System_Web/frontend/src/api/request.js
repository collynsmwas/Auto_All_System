import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
// 创建axios实例
const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});
// 请求拦截器
service.interceptors.request.use((config) => {
    // 添加Token
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
});
// 响应拦截器
service.interceptors.response.use((response) => {
    // 如果响应有包装格式 {code, message, data}，解包data
    if (response.data && typeof response.data === 'object' && 'code' in response.data && 'data' in response.data) {
        return response.data.data;
    }
    // 否则直接返回原始数据（DRF标准格式）
    return response.data;
}, (error) => {
    console.error('Response error:', error);
    if (error.response) {
        const { status, data } = error.response;
        switch (status) {
            case 401:
                // 未授权，清除token并跳转登录页
                localStorage.removeItem('token');
                router.push({ name: 'Login' });
                ElMessage.error('登录已过期，请重新登录');
                break;
            case 403:
                ElMessage.error('没有权限访问');
                break;
            case 404:
                ElMessage.error('请求的资源不存在');
                break;
            case 500:
                ElMessage.error('服务器错误');
                break;
            default:
                ElMessage.error(data?.message || data?.detail || '请求失败');
        }
    }
    else if (error.request) {
        ElMessage.error('网络错误，请检查您的网络连接');
    }
    else {
        ElMessage.error('请求配置错误');
    }
    return Promise.reject(error);
});
export default service;
