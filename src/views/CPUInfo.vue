<template>
  <div class="cpu-info">
    <h2 class="page-title">CPU 信息</h2>
    
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Cpu /></el-icon>
          <span>处理器信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="处理器名称">{{ cpuInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="制造商">{{ cpuInfo.vendor }}</el-descriptions-item>
        <el-descriptions-item label="核心数">{{ cpuInfo.cores }}</el-descriptions-item>
        <el-descriptions-item label="线程数">{{ cpuInfo.threads }}</el-descriptions-item>
        <el-descriptions-item label="基础频率">{{ cpuInfo.baseFrequency }}</el-descriptions-item>
        <el-descriptions-item label="当前频率">{{ cpuInfo.currentFrequency }}</el-descriptions-item>
        <el-descriptions-item label="缓存 L1">{{ cpuInfo.l1Cache }}</el-descriptions-item>
        <el-descriptions-item label="缓存 L2">{{ cpuInfo.l2Cache }}</el-descriptions-item>
        <el-descriptions-item label="缓存 L3">{{ cpuInfo.l3Cache }}</el-descriptions-item>
        <el-descriptions-item label="架构">{{ cpuInfo.architecture }}</el-descriptions-item>
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
        <el-col :span="12">
          <div class="monitor-item">
            <span class="label">CPU 使用率</span>
            <el-progress type="dashboard" :percentage="cpuInfo.usage" :color="getProgressColor(cpuInfo.usage)" />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="monitor-item">
            <span class="label">CPU 温度</span>
            <el-progress type="dashboard" :percentage="cpuInfo.temperature" :color="getTempColor(cpuInfo.temperature)">
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

interface CpuDetailedInfo {
  name: string
  vendor: string
  cores: number
  threads: number
  baseFrequency: string
  currentFrequency: string
  l1Cache: string
  l2Cache: string
  l3Cache: string
  architecture: string
  usage: number
  temperature: number
}

const cpuInfo = ref<CpuDetailedInfo>({
  name: '加载中...',
  vendor: '加载中...',
  cores: 0,
  threads: 0,
  baseFrequency: '0 GHz',
  currentFrequency: '0 GHz',
  l1Cache: '0 KB',
  l2Cache: '0 KB',
  l3Cache: '0 KB',
  architecture: '加载中...',
  usage: 0,
  temperature: 0
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

const fetchCpuInfo = async () => {
  try {
    const info = await invoke<CpuDetailedInfo>('get_cpu_detailed_info')
    cpuInfo.value = {
      ...info,
      usage: parseFloat(info.usage.toFixed(2)),
      temperature: parseFloat(info.temperature.toFixed(2))
    }
  } catch (error) {
    console.error('获取CPU信息失败:', error)
  }
}

onMounted(() => {
  fetchCpuInfo()
  updateInterval = window.setInterval(fetchCpuInfo, 2000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.cpu-info {
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
