<template>
  <div class="gpu-info">
    <h2 class="page-title">显卡信息</h2>
    
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><VideoCameraFilled /></el-icon>
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
    
    <el-card class="usage-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><TrendCharts /></el-icon>
          <span>实时监控</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="monitor-item">
            <span class="label">GPU 使用率</span>
            <el-progress type="dashboard" :percentage="gpuInfo.usage" :color="getProgressColor(gpuInfo.usage)" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="monitor-item">
            <span class="label">显存使用率</span>
            <el-progress type="dashboard" :percentage="gpuInfo.memoryUsage" :color="getProgressColor(gpuInfo.memoryUsage)" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="monitor-item">
            <span class="label">GPU 温度</span>
            <el-progress type="dashboard" :percentage="gpuInfo.temperature" :color="getTempColor(gpuInfo.temperature)">
              <template #default="{ percentage }">
                <span class="percentage-value">{{ formatNumber(percentage) }}°C</span>
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
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

const getTempColor = (temp: number) => {
  if (temp < 60) return '#67c23a'
  if (temp < 80) return '#e6a23c'
  return '#f56c6c'
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
  color: #e0e0e0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #409eff;
}

.info-card, .usage-card {
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

.monitor-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.monitor-item .label {
  font-size: 16px;
  color: #a0a0a0;
}

.percentage-value {
  color: #e0e0e0;
  font-size: 18px;
  font-weight: bold;
}

:deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: #2a2a2a;
}

:deep(.el-descriptions__label) {
  color: #a0a0a0;
}

:deep(.el-descriptions__content) {
  color: #e0e0e0;
}
</style>
