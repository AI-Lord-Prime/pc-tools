<template>
  <div class="overview">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">系统概览</h2>
        <span class="page-subtitle">实时硬件状态监控</span>
      </div>
    </div>
    
    <el-row :gutter="16">
      <!-- CPU 概览卡片 -->
      <el-col :span="6">
        <el-card class="info-card" shadow="never">
          <div class="card-icon-wrap cpu">
            <el-icon :size="22"><Cpu /></el-icon>
          </div>
          <div class="card-data">
            <span class="card-label">CPU</span>
            <span class="card-value">{{ cpuInfo.name }}</span>
            <div class="card-stats">
              <span>{{ cpuInfo.cores }} 核心</span>
              <el-progress :percentage="cpuInfo.usage" :color="getProgressColor(cpuInfo.usage)" :stroke-width="6" :show-text="false" />
              <span class="usage-text">{{ cpuInfo.usage }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 内存概览卡片 -->
      <el-col :span="6">
        <el-card class="info-card" shadow="never">
          <div class="card-icon-wrap memory">
            <el-icon :size="22"><Coin /></el-icon>
          </div>
          <div class="card-data">
            <span class="card-label">内存</span>
            <span class="card-value">{{ memoryInfo.used }} / {{ memoryInfo.total }}</span>
            <div class="card-stats">
              <el-progress :percentage="memoryInfo.usage" :color="getProgressColor(memoryInfo.usage)" :stroke-width="6" :show-text="false" />
              <span class="usage-text">{{ memoryInfo.usage }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- GPU 概览卡片 -->
      <el-col :span="6">
        <el-card class="info-card" shadow="never">
          <div class="card-icon-wrap gpu">
            <el-icon :size="22"><VideoCameraFilled /></el-icon>
          </div>
          <div class="card-data">
            <span class="card-label">显卡</span>
            <span class="card-value">{{ gpuInfo.name }}</span>
            <div class="card-stats">
              <span>显存 {{ gpuInfo.memory }}</span>
              <span class="temp-text">{{ formatNumber(gpuInfo.temperature) }}°C</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 系统信息卡片 -->
      <el-col :span="6">
        <el-card class="info-card" shadow="never">
          <div class="card-icon-wrap system">
            <el-icon :size="22"><Monitor /></el-icon>
          </div>
          <div class="card-data">
            <span class="card-label">系统</span>
            <span class="card-value">{{ systemInfo.os }}</span>
            <div class="card-stats">
              <span>{{ systemInfo.version }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 磁盘概览 -->
    <el-card class="disk-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <el-icon><Folder /></el-icon>
          <span>磁盘存储</span>
        </div>
      </template>
      <el-table :data="diskInfo" style="width: 100%">
        <el-table-column prop="name" label="磁盘名称" width="200" />
        <el-table-column prop="total" label="总容量" width="120" />
        <el-table-column prop="used" label="已使用" width="120" />
        <el-table-column prop="free" label="可用空间" width="120" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

interface CpuInfo {
  name: string
  cores: number
  usage: number
}

interface MemoryInfo {
  total: string
  used: string
  usage: number
}

interface GpuInfo {
  name: string
  memory: string
  temperature: number
}

interface SystemInfo {
  os: string
  version: string
  hostname: string
}

interface DiskInfoItem {
  name: string
  total: string
  used: string
  free: string
  usage: number
}

const cpuInfo = ref<CpuInfo>({
  name: '加载中...',
  cores: 0,
  usage: 0
})

const memoryInfo = ref<MemoryInfo>({
  total: '0 GB',
  used: '0 GB',
  usage: 0
})

const gpuInfo = ref<GpuInfo>({
  name: '加载中...',
  memory: '0 GB',
  temperature: 0
})

const systemInfo = ref<SystemInfo>({
  os: '加载中...',
  version: '加载中...',
  hostname: '加载中...'
})

const diskInfo = ref<DiskInfoItem[]>([])

let updateInterval: number | null = null

const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#3b82f6'
  if (percentage < 80) return '#f59e0b'
  return '#ef4444'
}

const formatNumber = (num: number) => {
  return num.toFixed(2)
}

const fetchSystemInfo = async () => {
  try {
    const [cpu, memory, gpu, system, disks] = await Promise.all([
      invoke<CpuInfo>('get_cpu_info'),
      invoke<MemoryInfo>('get_memory_info'),
      invoke<GpuInfo>('get_gpu_info'),
      invoke<SystemInfo>('get_system_info'),
      invoke<DiskInfoItem[]>('get_disk_info')
    ])
    
    cpuInfo.value = { ...cpu, usage: parseFloat(cpu.usage.toFixed(2)) }
    memoryInfo.value = { ...memory, usage: parseFloat(memory.usage.toFixed(2)) }
    gpuInfo.value = { ...gpu, temperature: parseFloat(gpu.temperature.toFixed(2)) }
    systemInfo.value = system
    diskInfo.value = disks.map(disk => ({
      ...disk,
      usage: parseFloat(disk.usage.toFixed(2))
    }))
  } catch (error) {
    console.error('获取系统信息失败:', error)
  }
}

onMounted(() => {
  fetchSystemInfo()
  updateInterval = window.setInterval(fetchSystemInfo, 3000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.overview {
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

.info-card {
  height: 100%;
}

.card-icon-wrap {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin-bottom: 12px;
}

.card-icon-wrap.cpu {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.card-icon-wrap.memory {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.card-icon-wrap.gpu {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.card-icon-wrap.system {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.card-data {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.card-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.4;
  word-break: break-all;
}

.card-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
  margin-top: 2px;
}

.usage-text {
  font-weight: 600;
  color: #3b82f6;
}

.temp-text {
  font-weight: 600;
  color: #22c55e;
}

.disk-card {
  margin-top: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
  font-size: 15px;
  font-weight: 600;
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
