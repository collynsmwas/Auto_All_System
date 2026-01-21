import request from './request';
export const zonesApi = {
    // 获取专区列表
    getZones(params) {
        return request.get('/zones/', { params });
    },
    // 获取专区详情
    getZone(id) {
        return request.get(`/zones/${id}/`);
    },
    // 获取专区配置
    getZoneConfig(id) {
        return request.get(`/zones/${id}/config/`);
    },
    // 获取我的专区
    getMyZones() {
        return request.get('/zones/access/my_zones/');
    }
};
