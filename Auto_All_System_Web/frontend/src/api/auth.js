import request from './request';
export const authApi = {
    // 登录
    login(username, password) {
        return request.post('/auth/login/', { username, password });
    },
    // 注册
    register(data) {
        return request.post('/auth/register/', data);
    },
    // 登出
    logout() {
        return request.post('/auth/logout/');
    },
    // 刷新Token
    refreshToken(refresh) {
        return request.post('/token/refresh/', { refresh });
    },
    // 获取当前用户信息
    getCurrentUser() {
        return request.get('/users/me/');
    }
};
