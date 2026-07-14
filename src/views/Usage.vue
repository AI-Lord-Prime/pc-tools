<template>
  <div class="usage">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">使用率监控</h2>
        <span class="page-subtitle">CPU / 内存 / GPU / 网络实时使用率</span>
      </div>
    </div>
    
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card class="usage-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-icon-badge cpu">
                <el-icon :size="18"><Cpu /></el-icon>
              </div>
              <span>CPU 使用率</span>
            </div>
          </template>
          <div class="usage-content">
            <el-progress type="dashboard" :percentage="cpuUsage.total" :color="getProgressColor(cpuUsage.total)" :width="120">
              <template #default="{ percentage }">
                <span class="dashboard-value">{{ formatNumber(percentage) }}%</span>
              </template>
            </el-progress>
            <div class="core-usage">
              <div v-for="(core, index) in cpuUsage.cores" :key="index" class="core-item">
                <span class="core-label">核心 {{ index }}</span>
                <el-progress :percentage="core" :color="getProgressColor(core)" :stroke-width="6" :show-text="false" />
                <span class="core-percent">{{ core }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="usage-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-icon-badge memory">
                <el-icon :size="18"><Coin /></el-icon>
              </div>
              <span>内存使用率</span>
            </div>
          </template>
          <div class="usage-content">
            <el-progress type="dashboard" :percentage="memoryUsage.percentage" :color="getProgressColor(memoryUsage.percentage)" :width="120">
              <template #default="{ percentage }">
                <span class="dashboard-value">{{ formatNumber(percentage) }}%</span>
              </template>
            </el-progress>
            <div class="memory-details">
              <div class="detail-row">
                <span class="detail-label">已使用</span>
                <span class="detail-value">{{ memoryUsage.used }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">可用</span>
                <span class="detail-value">{{ memoryUsage.available }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">总计</span>
                <span class="detail-value">{{ memoryUsage.total }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="12">
        <el-card class="usage-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-icon-badge gpu">
                <el-icon :size="18"><VideoCameraFilled /></el-icon>
              </div>
              <span>GPU 使用率</span>
            </div>
          </template>
          <div class="usage-content">
            <el-progress type="dashboard" :percentage="gpuUsage.core" :color="getProgressColor(gpuUsage.core)" :width="120">
              <template #default="{ percentage }">
                <span class="dashboard-value">{{ formatNumber(percentage) }}%</span>
              </template>
            </el-progress>
            <div class="gpu-details">
              <div class="detail-row">
                <span class="detail-label">GPU 核心</span>
                <el-progress :percentage="gpuUsage.core" :color="getProgressColor(gpuUsage.core)" :stroke-width="6" :show-text="false" style="flex: 1" />
                <span class="core-percent">{{ gpuUsage.core }}%</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">显存</span>
                <el-progress :percentage="gpuUsage.memory" :color="getProgressColor(gpuUsage.memory)" :stroke-width="6" :show-text="false" style="flex: 1" />
                <span class="core-percent">{{ gpuUsage.memory }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="usage-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-icon-badge network">
                <el-icon :size="18"><Connection /></el-icon>
              </div>
              <span>网络使用</span>
            </div>
          </template>
          <div class="usage-content">
            <div class="network-stats">
              <div class="network-item">
                <el-icon :size="20"><Download /></el-icon>
                <span class="network-label">下载速度</span>
                <span class="network-value">{{ networkUsage.download }}</span>
              </div>
              <div class="network-item">
                <el-icon :size="20"><Upload /></el-icon>
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
  if (percentage < 50) return '#3b82f6'
  if (percentage < 80) return '#f59e0b'
  return '#ef4444'
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

.card-icon-badge.memory {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.card-icon-badge.gpu {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.card-icon-badge.network {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.usage-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.dashboard-value {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.core-usage {
  width: 100%;
}

.core-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.core-label {
  width: 60px;
  color: #64748b;
  font-size: 12px;
}

.core-percent {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  width: 48px;
  text-align: right;
}

.memory-details, .gpu-details {
  width: 100%;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-label {
  color: #64748b;
  font-size: 13px;
}

.detail-value {
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.network-stats {
  width: 100%;
}

.network-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.network-item:last-child {
  border-bottom: none;
}

.network-label {
  color: #64748b;
  flex: 1;
  font-size: 14px;
}

.network-value {
  color: #1e293b;
  font-size: 18px;
  font-weight: 700;
}
</style>
