import request from './request';
export const tasksApi = {
    // 获取任务列表
    getTasks(params) {
        return request.get('/tasks/', { params });
    },
    // 创建任务
    createTask(data) {
        return request.post('/tasks/', data);
    },
    // 获取任务详情
    getTask(id) {
        return request.get(`/tasks/${id}/`);
    },
    // 删除任务
    deleteTask(id) {
        return request.delete(`/tasks/${id}/`);
    },
    // 获取任务日志
    getTaskLogs(id) {
        return request.get(`/tasks/${id}/logs/`);
    },
    // 取消任务
    cancelTask(id) {
        return request.post(`/tasks/${id}/cancel/`);
    },
    // 获取任务统计
    getTaskStatistics(params) {
        return request.get('/tasks/statistics/', { params });
    }
};
