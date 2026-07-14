<template>
  <div class="disk-info">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">硬盘信息</h2>
        <span class="page-subtitle">磁盘存储与健康状态</span>
      </div>
    </div>
    
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge disk">
            <el-icon :size="18"><Folder /></el-icon>
          </div>
          <span>磁盘列表</span>
        </div>
      </template>
      <el-table :data="diskList" style="width: 100%">
        <el-table-column prop="name" label="磁盘名称" width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'SSD' ? 'success' : 'info'" size="small">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="total" label="总容量" width="120" />
        <el-table-column prop="used" label="已使用" width="120" />
        <el-table-column prop="free" label="可用空间" width="120" />
        <el-table-column prop="fileSystem" label="文件系统" width="100" />
        <el-table-column label="使用率">
          <template #default="scope">
            <div class="usage-bar-wrap">
              <el-progress :percentage="scope.row.usage" :color="getProgressColor(scope.row.usage)" :stroke-width="8" :show-text="false" />
              <span class="usage-percent">{{ scope.row.usage }}%</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-card class="health-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge health">
            <el-icon :size="18"><FirstAidKit /></el-icon>
          </div>
          <span>磁盘健康状态</span>
        </div>
      </template>
      <el-table :data="diskHealth" style="width: 100%">
        <el-table-column prop="name" label="磁盘" width="200" />
        <el-table-column prop="temperature" label="温度" width="100">
          <template #default="scope">
            <span :class="getTempClass(scope.row.temperature)">{{ scope.row.temperature }}°C</span>
          </template>
        </el-table-column>
        <el-table-column prop="health" label="健康度" width="100">
          <template #default="scope">
            <el-tag :type="getHealthType(scope.row.health)" size="small">{{ scope.row.health }}%</el-tag>
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
  if (percentage < 50) return '#3b82f6'
  if (percentage < 80) return '#f59e0b'
  return '#ef4444'
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
}

.card-icon-badge.disk {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.card-icon-badge.health {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.temp-normal {
  color: #22c55e;
}

.temp-warning {
  color: #f59e0b;
}

.temp-danger {
  color: #ef4444;
}

.usage-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.usage-percent {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
}
</style>
