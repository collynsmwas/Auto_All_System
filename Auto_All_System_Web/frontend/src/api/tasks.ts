import request from './request'
import type { Task, TaskLog, PaginatedResponse, TaskCreateForm } from '@/types'

export const tasksApi = {
  // 获取任务列表
  getTasks(params?: any): Promise<PaginatedResponse<Task>> {
    return request.get('/tasks/', { params })
  },

  // 创建任务
  createTask(data: TaskCreateForm): Promise<Task> {
    return request.post('/tasks/', data)
  },

  // 获取任务详情
  getTask(id: number): Promise<Task> {
    return request.get(`/tasks/${id}/`)
  },

  // 删除任务
  deleteTask(id: number): Promise<void> {
    return request.delete(`/tasks/${id}/`)
  },

  // 获取任务日志
  getTaskLogs(id: number): Promise<TaskLog[]> {
    return request.get(`/tasks/${id}/logs/`)
  },

  // 取消任务
  cancelTask(id: number): Promise<{ message: string }> {
    return request.post(`/tasks/${id}/cancel/`)
  },

  // 获取任务统计
  getTaskStatistics(params?: any): Promise<any> {
    return request.get('/tasks/statistics/', { params })
  }
}

