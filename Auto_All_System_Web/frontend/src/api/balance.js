import request from './request';
export const balanceApi = {
    // 获取我的余额
    getMyBalance() {
        return request.get('/balance/my_balance/');
    },
    // 充值
    recharge(data) {
        return request.post('/balance/recharge/', data);
    },
    // 获取余额变动记录
    getBalanceLogs(params) {
        return request.get('/balance/logs/', { params });
    }
};
