import request from './request';
export const paymentsApi = {
    // 获取启用的支付方式
    getEnabledPaymentMethods() {
        return request.get('/payments/payment-configs/enabled/');
    },
    // 使用卡密充值
    useCardCode(data) {
        return request.post('/payments/card-recharge/use/', data);
    },
    // 获取订单列表
    getOrders(params) {
        return request.get('/payments/orders/', { params });
    },
    // 获取单个订单
    getOrder(id) {
        return request.get(`/payments/orders/${id}/`);
    },
    // 取消订单
    cancelOrder(id) {
        return request.post(`/payments/orders/${id}/cancel/`);
    },
    // 退款（管理员）
    refundOrder(id) {
        return request.post(`/payments/orders/${id}/refund/`);
    },
    // ===== 支付配置管理API（管理员） =====
    // 获取所有支付配置
    getAllPaymentConfigs() {
        return request.get('/payments/payment-configs/');
    },
    // 获取单个支付配置
    getPaymentConfig(id) {
        return request.get(`/payments/payment-configs/${id}/`);
    },
    // 更新支付配置
    updatePaymentConfig(id, data) {
        return request.put(`/payments/payment-configs/${id}/`, data);
    },
    // 部分更新支付配置
    patchPaymentConfig(id, data) {
        return request.patch(`/payments/payment-configs/${id}/`, data);
    },
    // ===== 充值卡密管理API（管理员） =====
    // 获取充值卡密列表
    getRechargeCards(params) {
        return request.get('/payments/recharge-cards/', { params });
    },
    // 批量生成卡密
    batchCreateCards(data) {
        return request.post('/payments/recharge-cards/batch_create/', data);
    },
    // 禁用卡密
    disableCard(id) {
        return request.patch(`/payments/recharge-cards/${id}/`, { status: 'disabled' });
    },
    // 启用卡密
    enableCard(id) {
        return request.patch(`/payments/recharge-cards/${id}/`, { status: 'unused' });
    },
    // 导出批次卡密
    exportBatch(batch_no) {
        return request.get('/payments/recharge-cards/export_batch/', { params: { batch_no } });
    },
    // 批量导出卡密（支持筛选）
    exportFilteredCards(params) {
        return request.get('/payments/recharge-cards/export_filtered/', { params });
    }
};
