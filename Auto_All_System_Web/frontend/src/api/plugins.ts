/**
 * 插件管理API
 */
import request from './request'

export interface PluginInfo {
  name: string
  display_name: string
  version: string
  author: string
  description: string
  enabled: boolean
  installed: boolean
  dependencies_met: boolean
  dependencies: string[]
  category: string
  icon: string
  settings_available?: boolean
}

export interface PluginDetail extends PluginInfo {
  long_description: string
  homepage: string
  documentation: string
  support: string
  urls_count: number
  has_settings: boolean
  settings?: any
}

export interface PluginStats {
  total: number
  enabled: number
  disabled: number
  categories: Record<string, number>
}

const pluginsApi = {
  /**
   * 获取所有插件列表
   */
  getList(): Promise<{ data: PluginInfo[]; total: number }> {
    return request.get('/plugins/')
  },

  /**
   * 获取插件详情
   */
  getDetail(name: string): Promise<{ data: PluginDetail }> {
    return request.get(`/plugins/${name}/`)
  },

  /**
   * 启用插件
   */
  enable(name: string): Promise<any> {
    return request.post(`/plugins/${name}/enable/`)
  },

  /**
   * 禁用插件
   */
  disable(name: string): Promise<any> {
    return request.post(`/plugins/${name}/disable/`)
  },

  /**
   * 获取插件统计信息
   */
  getStats(): Promise<{ data: PluginStats }> {
    return request.get('/plugins/stats/')
  },

  /**
   * 获取插件配置
   */
  getSettings(name: string): Promise<any> {
    return request.get(`/plugins/${name}/settings/`)
  },

  /**
   * 更新插件配置
   */
  updateSettings(name: string, settings: any): Promise<any> {
    return request.post(`/plugins/${name}/update_settings/`, { settings })
  },

  /**
   * 重新加载所有插件
   */
  reload(): Promise<any> {
    return request.post('/plugins/reload/')
  }
}

export default pluginsApi

