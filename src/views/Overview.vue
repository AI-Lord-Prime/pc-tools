<template>
  <div class="overview">
    <h2 class="page-title">系统概览</h2>
    
    <el-row :gutter="20">
      <!-- CPU 概览卡片 -->
      <el-col :span="12">
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Cpu /></el-icon>
              <span>CPU</span>
            </div>
          </template>
          <div class="card-content">
            <div class="info-item">
              <span class="label">处理器:</span>
              <span class="value">{{ cpuInfo.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">核心数:</span>
              <span class="value">{{ cpuInfo.cores }}</span>
            </div>
            <div class="info-item">
              <span class="label">使用率:</span>
              <el-progress :percentage="cpuInfo.usage" :color="getProgressColor(cpuInfo.usage)" />
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 内存概览卡片 -->
      <el-col :span="12">
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Coin /></el-icon>
              <span>内存</span>
            </div>
          </template>
          <div class="card-content">
            <div class="info-item">
              <span class="label">总容量:</span>
              <span class="value">{{ memoryInfo.total }}</span>
            </div>
            <div class="info-item">
              <span class="label">已使用:</span>
              <span class="value">{{ memoryInfo.used }}</span>
            </div>
            <div class="info-item">
              <span class="label">使用率:</span>
              <el-progress :percentage="memoryInfo.usage" :color="getProgressColor(memoryInfo.usage)" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- GPU 概览卡片 -->
      <el-col :span="12">
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><VideoCameraFilled /></el-icon>
              <span>显卡</span>
            </div>
          </template>
          <div class="card-content">
            <div class="info-item">
              <span class="label">显卡型号:</span>
              <span class="value">{{ gpuInfo.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">显存:</span>
              <span class="value">{{ gpuInfo.memory }}</span>
            </div>
            <div class="info-item">
              <span class="label">温度:</span>
              <span class="value">{{ formatNumber(gpuInfo.temperature) }}°C</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 系统信息卡片 -->
      <el-col :span="12">
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Monitor /></el-icon>
              <span>系统</span>
            </div>
          </template>
          <div class="card-content">
            <div class="info-item">
              <span class="label">操作系统:</span>
              <span class="value">{{ systemInfo.os }}</span>
            </div>
            <div class="info-item">
              <span class="label">系统版本:</span>
              <span class="value">{{ systemInfo.version }}</span>
            </div>
            <div class="info-item">
              <span class="label">主机名:</span>
              <span class="value">{{ systemInfo.hostname }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 磁盘概览 -->
    <el-card class="disk-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><Folder /></el-icon>
          <span>磁盘</span>
        </div>
      </template>
      <el-table :data="diskInfo" style="width: 100%" dark>
        <el-table-column prop="name" label="磁盘名称" width="200" />
        <el-table-column prop="total" label="总容量" width="120" />
        <el-table-column prop="used" label="已使用" width="120" />
        <el-table-column prop="free" label="可用空间" width="120" />
        <el-table-column label="使用率">
          <template #default="scope">
            <el-progress :percentage="scope.row.usage" :color="getProgressColor(scope.row.usage)" />
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
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
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
  // 每3秒更新一次动态数据
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
  color: #e0e0e0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #409eff;
}

.info-card {
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

.card-content {
  padding: 10px 0;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.info-item .label {
  width: 80px;
  color: #a0a0a0;
}

.info-item .value {
  flex: 1;
  color: #e0e0e0;
}

.disk-card {
  background-color: #1e1e1e;
  border: 1px solid #333;
}

:deep(.el-card__header) {
  border-bottom: 1px solid #333;
  padding: 15px 20px;
}

:deep(.el-progress__text) {
  color: #e0e0e0 !important;
}
</style>
