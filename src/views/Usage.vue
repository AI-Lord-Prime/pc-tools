<template>
  <div class="usage">
    <h2 class="page-title">使用率监控</h2>
    
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="usage-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Cpu /></el-icon>
              <span>CPU 使用率</span>
            </div>
          </template>
          <div class="usage-content">
            <el-progress type="dashboard" :percentage="cpuUsage.total" :color="getProgressColor(cpuUsage.total)" :width="150">
              <template #default="{ percentage }">
                <span class="percentage-value">{{ formatNumber(percentage) }}%</span>
              </template>
            </el-progress>
            <div class="core-usage">
              <div v-for="(core, index) in cpuUsage.cores" :key="index" class="core-item">
                <span class="core-label">核心 {{ index }}</span>
                <el-progress :percentage="core" :color="getProgressColor(core)" :stroke-width="10" />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="usage-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Coin /></el-icon>
              <span>内存使用率</span>
            </div>
          </template>
          <div class="usage-content">
            <el-progress type="dashboard" :percentage="memoryUsage.percentage" :color="getProgressColor(memoryUsage.percentage)" :width="150">
              <template #default="{ percentage }">
                <span class="percentage-value">{{ formatNumber(percentage) }}%</span>
              </template>
            </el-progress>
            <div class="memory-details">
              <div class="detail-item">
                <span class="detail-label">已使用:</span>
                <span class="detail-value">{{ memoryUsage.used }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">可用:</span>
                <span class="detail-value">{{ memoryUsage.available }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">总计:</span>
                <span class="detail-value">{{ memoryUsage.total }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="usage-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><VideoCameraFilled /></el-icon>
              <span>GPU 使用率</span>
            </div>
          </template>
          <div class="usage-content">
            <el-progress type="dashboard" :percentage="gpuUsage.core" :color="getProgressColor(gpuUsage.core)" :width="150">
              <template #default="{ percentage }">
                <span class="percentage-value">{{ formatNumber(percentage) }}%</span>
              </template>
            </el-progress>
            <div class="gpu-details">
              <div class="detail-item">
                <span class="detail-label">GPU 核心:</span>
                <el-progress :percentage="gpuUsage.core" :color="getProgressColor(gpuUsage.core)" :stroke-width="10" />
              </div>
              <div class="detail-item">
                <span class="detail-label">显存:</span>
                <el-progress :percentage="gpuUsage.memory" :color="getProgressColor(gpuUsage.memory)" :stroke-width="10" />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="usage-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Connection /></el-icon>
              <span>网络使用</span>
            </div>
          </template>
          <div class="usage-content">
            <div class="network-stats">
              <div class="network-item">
                <el-icon><Download /></el-icon>
                <span class="network-label">下载速度</span>
                <span class="network-value">{{ networkUsage.download }}</span>
              </div>
              <div class="network-item">
                <el-icon><Upload /></el-icon>
                <span class="network-label">上传速度</span>
                <span class="network-value">{{ networkUsage.upload }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

interface CpuUsage {
  total: number
  cores: number[]
}

interface MemoryUsage {
  percentage: number
  used: string
  available: string
  total: string
}

interface GpuUsage {
  core: number
  memory: number
}

interface NetworkUsage {
  download: string
  upload: string
}

const cpuUsage = ref<CpuUsage>({
  total: 0,
  cores: []
})

const memoryUsage = ref<MemoryUsage>({
  percentage: 0,
  used: '0 GB',
  available: '0 GB',
  total: '0 GB'
})

const gpuUsage = ref<GpuUsage>({
  core: 0,
  memory: 0
})

const networkUsage = ref<NetworkUsage>({
  download: '0 KB/s',
  upload: '0 KB/s'
})

let updateInterval: number | null = null

const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

const formatNumber = (num: number) => {
  return num.toFixed(2)
}

const fetchUsage = async () => {
  try {
    const [cpu, memory, gpu, network] = await Promise.all([
      invoke<CpuUsage>('get_cpu_usage'),
      invoke<MemoryUsage>('get_memory_usage'),
      invoke<GpuUsage>('get_gpu_usage'),
      invoke<NetworkUsage>('get_network_usage')
    ])
    
    cpuUsage.value = {
      total: parseFloat(cpu.total.toFixed(2)),
      cores: cpu.cores.map(c => parseFloat(c.toFixed(2)))
    }
    memoryUsage.value = { ...memory, percentage: parseFloat(memory.percentage.toFixed(2)) }
    gpuUsage.value = {
      core: parseFloat(gpu.core.toFixed(2)),
      memory: parseFloat(gpu.memory.toFixed(2))
    }
    networkUsage.value = network
  } catch (error) {
    console.error('获取使用率失败:', error)
  }
}

onMounted(() => {
  fetchUsage()
  updateInterval = window.setInterval(fetchUsage, 1000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.usage {
  color: #e0e0e0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #409eff;
}

.usage-card {
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

.usage-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.percentage-value {
  font-size: 28px;
  font-weight: bold;
  color: #e0e0e0;
}

.core-usage {
  width: 100%;
}

.core-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.core-label {
  width: 60px;
  color: #a0a0a0;
  font-size: 12px;
}

.memory-details, .gpu-details {
  width: 100%;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-label {
  color: #a0a0a0;
  margin-right: 10px;
}

.detail-value {
  color: #e0e0e0;
}

.network-stats {
  width: 100%;
}

.network-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-bottom: 1px solid #333;
}

.network-item:last-child {
  border-bottom: none;
}

.network-label {
  color: #a0a0a0;
  flex: 1;
}

.network-value {
  color: #409eff;
  font-size: 18px;
  font-weight: bold;
}

:deep(.el-progress__text) {
  color: #e0e0e0 !important;
}
</style>
