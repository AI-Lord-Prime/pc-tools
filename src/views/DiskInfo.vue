<template>
  <div class="disk-info">
    <h2 class="page-title">硬盘信息</h2>
    
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Folder /></el-icon>
          <span>磁盘列表</span>
        </div>
      </template>
      <el-table :data="diskList" style="width: 100%" dark>
        <el-table-column prop="name" label="磁盘名称" width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'SSD' ? 'success' : 'info'">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="total" label="总容量" width="120" />
        <el-table-column prop="used" label="已使用" width="120" />
        <el-table-column prop="free" label="可用空间" width="120" />
        <el-table-column prop="fileSystem" label="文件系统" width="100" />
        <el-table-column label="使用率">
          <template #default="scope">
            <el-progress :percentage="scope.row.usage" :color="getProgressColor(scope.row.usage)" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-card class="health-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><FirstAidKit /></el-icon>
          <span>磁盘健康状态</span>
        </div>
      </template>
      <el-table :data="diskHealth" style="width: 100%" dark>
        <el-table-column prop="name" label="磁盘" width="200" />
        <el-table-column prop="temperature" label="温度" width="100">
          <template #default="scope">
            <span :class="getTempClass(scope.row.temperature)">{{ scope.row.temperature }}°C</span>
          </template>
        </el-table-column>
        <el-table-column prop="health" label="健康度" width="100">
          <template #default="scope">
            <el-tag :type="getHealthType(scope.row.health)">{{ scope.row.health }}%</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="readSpeed" label="读取速度" width="120" />
        <el-table-column prop="writeSpeed" label="写入速度" width="120" />
        <el-table-column prop="powerOnHours" label="通电时间" width="120" />
        <el-table-column prop="powerCycle" label="通电次数" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

interface DiskItem {
  name: string
  type: string
  total: string
  used: string
  free: string
  fileSystem: string
  usage: number
}

interface DiskHealthItem {
  name: string
  temperature: number
  health: number
  readSpeed: string
  writeSpeed: string
  powerOnHours: string
  powerCycle: number
}

const diskList = ref<DiskItem[]>([])
const diskHealth = ref<DiskHealthItem[]>([])

const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

const getTempClass = (temp: number) => {
  if (temp < 50) return 'temp-normal'
  if (temp < 70) return 'temp-warning'
  return 'temp-danger'
}

const getHealthType = (health: number) => {
  if (health >= 90) return 'success'
  if (health >= 70) return 'warning'
  return 'danger'
}

const fetchDiskInfo = async () => {
  try {
    const [disks, health] = await Promise.all([
      invoke<DiskItem[]>('get_disk_list'),
      invoke<DiskHealthItem[]>('get_disk_health')
    ])
    diskList.value = disks
    diskHealth.value = health
  } catch (error) {
    console.error('获取磁盘信息失败:', error)
  }
}

onMounted(() => {
  fetchDiskInfo()
})
</script>

<style scoped>
.disk-info {
  color: #e0e0e0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #409eff;
}

.info-card, .health-card {
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

.temp-normal {
  color: #67c23a;
}

.temp-warning {
  color: #e6a23c;
}

.temp-danger {
  color: #f56c6c;
}

:deep(.el-progress__text) {
  color: #e0e0e0 !important;
}
</style>
