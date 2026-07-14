<template>
  <div class="driver">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">驱动管理</h2>
        <span class="page-subtitle">系统驱动扫描与更新</span>
      </div>
    </div>
    
    <el-card class="driver-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge driver">
            <el-icon :size="18"><SetUp /></el-icon>
          </div>
          <span>驱动列表</span>
          <el-button type="primary" size="small" style="margin-left: auto;" @click="scanDrivers">扫描驱动</el-button>
        </div>
      </template>
      <el-table :data="driverList" style="width: 100%">
        <el-table-column prop="name" label="驱动名称" width="250" />
        <el-table-column prop="version" label="版本" width="150" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="publisher" label="发布者" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '正常' ? 'success' : 'warning'" size="small">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" @click="updateDriver(scope.row)">更新</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { invoke } from '@tauri-apps/api/tauri'

interface DriverItem {
  name: string
  version: string
  date: string
  publisher: string
  status: string
}

const driverList = ref<DriverItem[]>([])

const scanDrivers = async () => {
  try {
    const drivers = await invoke<DriverItem[]>('scan_drivers')
    driverList.value = drivers
    ElMessage.success('扫描完成')
  } catch (error) {
    ElMessage.error('扫描失败: ' + error)
  }
}

const updateDriver = async (driver: DriverItem) => {
  try {
    await invoke('update_driver', { name: driver.name })
    ElMessage.success('驱动更新已开始')
  } catch (error) {
    ElMessage.error('更新失败: ' + error)
  }
}

onMounted(() => {
  scanDrivers()
})
</script>

<style scoped>
.driver {
  color: #334155;
}

.page-header {
  margin-bottom: 20px;
}

.page-title-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  font-size: 13px;
  color: #64748b;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1e293b;
  font-size: 15px;
  font-weight: 600;
}

.card-icon-badge {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
</style>
