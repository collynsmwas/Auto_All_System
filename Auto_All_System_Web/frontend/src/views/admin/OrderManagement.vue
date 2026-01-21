<template>
  <div class="order-management">
    <h1>订单管理</h1>

    <el-card shadow="hover">
      <el-table :data="orders" v-loading="loading" stripe>
        <el-table-column prop="order_no" label="订单号" width="200">
          <template #default="{ row }">
            <span style="font-family: monospace; font-weight: bold;">{{ row.order_no }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="150">
          <template #default="{ row }">
            <el-tag>{{ row.user_info?.username || row.user }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getOrderTypeColor(row.order_type)">{{ getOrderTypeName(row.order_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold; font-size: 16px;">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" width="120">
          <template #default="{ row }">
            {{ row.payment_method || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewDetail(row)">详情</el-button>
            <el-button 
              v-if="row.status === 'pending' || row.status === 'processing'" 
              text 
              type="danger" 
              @click="cancelOrder(row)"
            >
              取消
            </el-button>
            <el-button 
              v-if="row.status === 'paid'" 
              text 
              type="warning" 
              @click="refundOrder(row)"
            >
              退款
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchOrders"
        @current-change="fetchOrders"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { paymentsApi, type Order } from '@/api/payments'
import dayjs from 'dayjs'

const loading = ref(false)
const orders = ref<Order[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const fetchOrders = async () => {
  loading.value = true
  try {
    const response = await paymentsApi.getOrders({
      page: currentPage.value,
      page_size: pageSize.value
    })
    orders.value = response.results
    total.value = response.count
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    ElMessage.error('获取订单失败')
  } finally {
    loading.value = false
  }
}

const getOrderTypeColor = (type: string) => {
  const map: Record<string, any> = {
    recharge: 'success',
    task: 'primary',
    vip: 'warning',
    service_purchase: 'info'
  }
  return map[type] || 'info'
}

const getOrderTypeName = (type: string) => {
  const map: Record<string, string> = {
    recharge: '充值',
    task: '任务',
    vip: 'VIP',
    service_purchase: '服务购买'
  }
  return map[type] || type
}

const getStatusColor = (status: string) => {
  const map: Record<string, any> = {
    pending: 'warning',
    paid: 'success',
    processing: 'primary',
    completed: 'success',
    cancelled: 'danger',
    refunded: 'info'
  }
  return map[status] || 'info'
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return map[status] || status
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const viewDetail = (row: Order) => {
  ElMessageBox.alert(
    `
      <div style="text-align: left;">
        <p><strong>订单号：</strong>${row.order_no}</p>
        <p><strong>用户：</strong>${row.user_info.username}</p>
        <p><strong>订单类型：</strong>${getOrderTypeName(row.order_type)}</p>
        <p><strong>金额：</strong>¥${row.amount}</p>
        <p><strong>状态：</strong>${getStatusName(row.status)}</p>
        <p><strong>支付方式：</strong>${row.payment_method || '未支付'}</p>
        <p><strong>描述：</strong>${row.description || '无'}</p>
        <p><strong>创建时间：</strong>${formatDate(row.created_at)}</p>
      </div>
    `,
    '订单详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

const cancelOrder = async (row: Order) => {
  if (row.status !== 'pending' && row.status !== 'processing') {
    ElMessage.warning('只能取消待支付或处理中的订单')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要取消订单 ${row.order_no} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await paymentsApi.cancelOrder(row.id)
    ElMessage.success('订单已取消')
    fetchOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to cancel order:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

const refundOrder = async (row: Order) => {
  if (row.status !== 'paid') {
    ElMessage.warning('只能退款已支付的订单')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要退款订单 ${row.order_no} 吗？`,
      '警告',
      {
        confirmButtonText: '确定退款',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await paymentsApi.refundOrder(row.id)
    ElMessage.success('退款成功')
    fetchOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to refund order:', error)
      ElMessage.error('退款失败')
    }
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped lang="scss">
.order-management {
  h1 {
    margin-bottom: 24px;
  }

  .el-pagination {
    margin-top: 20px;
    justify-content: center;
  }
}
</style>
