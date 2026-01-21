import request from './request';
const usersApi = {
    // 获取用户列表
    getUsers(params) {
        return request.get('/users/', { params });
    },
    // 获取单个用户
    getUser(id) {
        return request.get(`/users/${id}/`);
    },
    // 创建用户
    createUser(data) {
        return request.post('/users/', data);
    },
    // 更新用户
    updateUser(id, data) {
        return request.put(`/users/${id}/`, data);
    },
    // 删除用户
    deleteUser(id) {
        return request.delete(`/users/${id}/`);
    },
    // 获取用户余额列表（管理员）
    getUserBalances(params) {
        return request.get('/balance/', { params });
    },
    // 重置用户密码（管理员）
    resetPassword(id, password) {
        return request.post(`/users/${id}/reset_password/`, { password });
    }
};
export default usersApi;
