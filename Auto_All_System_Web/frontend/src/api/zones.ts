import request from './request'
import type { Zone, ZoneConfig, PaginatedResponse } from '@/types'

export const zonesApi = {
  // 获取专区列表
  getZones(params?: any): Promise<PaginatedResponse<Zone>> {
    return request.get('/zones/', { params })
  },

  // 获取专区详情
  getZone(id: number): Promise<Zone> {
    return request.get(`/zones/${id}/`)
  },

  // 获取专区配置
  getZoneConfig(id: number): Promise<ZoneConfig[]> {
    return request.get(`/zones/${id}/config/`)
  },

  // 获取我的专区
  getMyZones(): Promise<Zone[]> {
    return request.get('/zones/access/my_zones/')
  }
}

