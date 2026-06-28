<template>
  <div class="driver">
    <h2 class="page-title">驱动管理</h2>
    
    <el-card class="driver-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><SetUp /></el-icon>
          <span>驱动列表</span>
          <el-button type="primary" size="small" style="margin-left: auto;" @click="scanDrivers">扫描驱动</el-button>
        </div>
      </template>
      <el-table :data="driverList" style="width: 100%" dark>
        <el-table-column prop="name" label="驱动名称" width="250" />
        <el-table-column prop="version" label="版本" width="150" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="publisher" label="发布者" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '正常' ? 'success' : 'warning'">{{ scope.row.status }}</el-tag>
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
  color: #e0e0e0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #409eff;
}

.driver-card {
  background-color: #1e1e1e;
  border: 1px solid #333;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #409eff;
  font-size: 16px;
  font-weight: bold;
}
</style>
