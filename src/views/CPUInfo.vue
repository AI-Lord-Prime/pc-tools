<template>
  <div class="cpu-info">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">CPU 信息</h2>
        <span class="page-subtitle">处理器详情与实时监控</span>
      </div>
    </div>
    
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge cpu">
            <el-icon :size="18"><Cpu /></el-icon>
          </div>
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
        <el-col :span="12">
          <div class="monitor-item">
            <span class="monitor-label">CPU 使用率</span>
            <el-progress type="dashboard" :percentage="cpuInfo.usage" :color="getProgressColor(cpuInfo.usage)" :width="120">
              <template #default="{ percentage }">
                <span class="dashboard-value">{{ formatNumber(percentage) }}%</span>
              </template>
            </el-progress>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="monitor-item">
            <span class="monitor-label">CPU 温度</span>
            <el-progress type="dashboard" :percentage="cpuInfo.temperature" :color="getTempColor(cpuInfo.temperature)" :width="120">
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

.card-icon-badge.cpu {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.card-icon-badge.monitor {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
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
