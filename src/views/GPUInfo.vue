<template>
  <div class="gpu-info">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">显卡信息</h2>
        <span class="page-subtitle">GPU 详情与实时监控</span>
      </div>
    </div>
    
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge gpu">
            <el-icon :size="18"><VideoCameraFilled /></el-icon>
          </div>
          <span>显卡详情</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="显卡名称">{{ gpuInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="制造商">{{ gpuInfo.vendor }}</el-descriptions-item>
        <el-descriptions-item label="显存大小">{{ gpuInfo.memory }}</el-descriptions-item>
        <el-descriptions-item label="显存类型">{{ gpuInfo.memoryType }}</el-descriptions-item>
        <el-descriptions-item label="驱动版本">{{ gpuInfo.driverVersion }}</el-descriptions-item>
        <el-descriptions-item label="GPU 核心频率">{{ gpuInfo.coreFrequency }}</el-descriptions-item>
        <el-descriptions-item label="显存频率">{{ gpuInfo.memoryFrequency }}</el-descriptions-item>
        <el-descriptions-item label="当前温度">{{ gpuInfo.temperature }}°C</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <el-card class="usage-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge monitor">
            <el-icon :size="18"><TrendCharts /></el-icon>
          </div>
          <span>实时监控</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="monitor-item">
            <span class="monitor-label">GPU 使用率</span>
            <el-progress type="dashboard" :percentage="gpuInfo.usage" :color="getProgressColor(gpuInfo.usage)" :width="120">
              <template #default="{ percentage }">
                <span class="dashboard-value">{{ formatNumber(percentage) }}%</span>
              </template>
            </el-progress>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="monitor-item">
            <span class="monitor-label">显存使用率</span>
            <el-progress type="dashboard" :percentage="gpuInfo.memoryUsage" :color="getProgressColor(gpuInfo.memoryUsage)" :width="120">
              <template #default="{ percentage }">
                <span class="dashboard-value">{{ formatNumber(percentage) }}%</span>
              </template>
            </el-progress>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="monitor-item">
            <span class="monitor-label">GPU 温度</span>
            <el-progress type="dashboard" :percentage="gpuInfo.temperature" :color="getTempColor(gpuInfo.temperature)" :width="120">
              <template #default="{ percentage }">
                <span class="dashboard-value">{{ formatNumber(percentage) }}°C</span>
              </template>
            </el-progress>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

interface GpuDetailedInfo {
  name: string
  vendor: string
  memory: string
  memoryType: string
  driverVersion: string
  coreFrequency: string
  memoryFrequency: string
  temperature: number
  usage: number
  memoryUsage: number
}

const gpuInfo = ref<GpuDetailedInfo>({
  name: '加载中...',
  vendor: '加载中...',
  memory: '0 GB',
  memoryType: '加载中...',
  driverVersion: '加载中...',
  coreFrequency: '0 MHz',
  memoryFrequency: '0 MHz',
  temperature: 0,
  usage: 0,
  memoryUsage: 0
})

let updateInterval: number | null = null

const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#3b82f6'
  if (percentage < 80) return '#f59e0b'
  return '#ef4444'
}

const getTempColor = (temp: number) => {
  if (temp < 60) return '#22c55e'
  if (temp < 80) return '#f59e0b'
  return '#ef4444'
}

const formatNumber = (num: number) => {
  return num.toFixed(2)
}

const fetchGpuInfo = async () => {
  try {
    const info = await invoke<GpuDetailedInfo>('get_gpu_detailed_info')
    gpuInfo.value = info
  } catch (error) {
    console.error('获取GPU信息失败:', error)
  }
}

onMounted(() => {
  fetchGpuInfo()
  updateInterval = window.setInterval(fetchGpuInfo, 2000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.gpu-info {
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

.card-icon-badge.gpu {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.card-icon-badge.monitor {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.monitor-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.monitor-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.dashboard-value {
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
}
</style>
