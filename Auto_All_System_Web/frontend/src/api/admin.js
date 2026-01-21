import request from './request';
const adminApi = {
    // 获取仪表盘统计数据
    getDashboardStats() {
        return request.get('/admin/statistics/dashboard/');
    }
};
export default adminApi;
