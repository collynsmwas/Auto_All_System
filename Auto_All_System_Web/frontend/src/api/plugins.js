/**
 * 插件管理API
 */
import request from './request';
const pluginsApi = {
    /**
     * 获取所有插件列表
     */
    getList() {
        return request.get('/plugins/');
    },
    /**
     * 获取插件详情
     */
    getDetail(name) {
        return request.get(`/plugins/${name}/`);
    },
    /**
     * 启用插件
     */
    enable(name) {
        return request.post(`/plugins/${name}/enable/`);
    },
    /**
     * 禁用插件
     */
    disable(name) {
        return request.post(`/plugins/${name}/disable/`);
    },
    /**
     * 获取插件统计信息
     */
    getStats() {
        return request.get('/plugins/stats/');
    },
    /**
     * 获取插件配置
     */
    getSettings(name) {
        return request.get(`/plugins/${name}/settings/`);
    },
    /**
     * 更新插件配置
     */
    updateSettings(name, settings) {
        return request.post(`/plugins/${name}/update_settings/`, { settings });
    },
    /**
     * 重新加载所有插件
     */
    reload() {
        return request.post('/plugins/reload/');
    }
};
export default pluginsApi;
