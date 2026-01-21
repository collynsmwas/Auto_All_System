import request from './request';
export const cardsApi = {
    // 获取虚拟卡列表
    getCards(params) {
        return request.get('/cards/', { params });
    },
    // 创建虚拟卡
    createCard(data) {
        return request.post('/cards/', data);
    },
    // 获取虚拟卡详情
    getCard(id) {
        return request.get(`/cards/${id}/`);
    },
    // 更新虚拟卡
    updateCard(id, data) {
        return request.put(`/cards/${id}/`, data);
    },
    // 删除虚拟卡
    deleteCard(id) {
        return request.delete(`/cards/${id}/`);
    },
    // 获取可用虚拟卡
    getAvailableCards(params) {
        return request.get('/cards/available/', { params });
    },
    // 获取我的虚拟卡
    getMyCards() {
        return request.get('/cards/my_cards/');
    },
    // 批量导入虚拟卡
    importCards(data) {
        return request.post('/cards/import_cards/', data);
    }
};
