<template>
  <div class="temperature">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">温度监控</h2>
        <span class="page-subtitle">硬件温度实时监测</span>
      </div>
    </div>
    
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card class="temp-card" shadow="never">
          <div class="temp-content">
            <div class="temp-icon-wrap cpu">
              <el-icon :size="28"><Cpu /></el-icon>
            </div>
            <div class="temp-info">
              <span class="temp-label">CPU 温度</span>
              <span class="temp-value" :class="getTempClass(temperatures.cpu)">{{ formatTemp(temperatures.cpu) }}<span v-if="isTempAvailable(temperatures.cpu)" class="temp-unit">°C</span></span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="temp-card" shadow="never">
          <div class="temp-content">
            <div class="temp-icon-wrap gpu">
              <el-icon :size="28"><VideoCameraFilled /></el-icon>
            </div>
            <div class="temp-info">
              <span class="temp-label">GPU 温度</span>
              <span class="temp-value" :class="getTempClass(temperatures.gpu)">{{ formatTemp(temperatures.gpu) }}<span v-if="isTempAvailable(temperatures.gpu)" class="temp-unit">°C</span></span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="temp-card" shadow="never">
          <div class="temp-content">
            <div class="temp-icon-wrap disk">
              <el-icon :size="28"><Folder /></el-icon>
            </div>
            <div class="temp-info">
              <span class="temp-label">硬盘温度</span>
              <span class="temp-value" :class="getTempClass(temperatures.disk)">{{ formatTemp(temperatures.disk) }}<span v-if="isTempAvailable(temperatures.disk)" class="temp-unit">°C</span></span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="chart-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge monitor">
            <el-icon :size="18"><TrendCharts /></el-icon>
          </div>
          <span>温度历史记录</span>
        </div>
      </template>
      <div class="temp-history">
        <div v-for="(item, index) in tempHistory" :key="index" class="history-item">
          <span class="time">{{ item.time }}</span>
          <span class="cpu-temp">CPU: {{ formatTemp(item.cpu) }}</span>
          <span class="gpu-temp">GPU: {{ formatTemp(item.gpu) }}</span>
          <span class="disk-temp">Disk: {{ formatTemp(item.disk) }}</span>
        </div>
        <div v-if="tempHistory.length === 0" class="history-empty">等待数据采集...</div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

interface Temperatures {
  cpu: number
  gpu: number
  disk: number
}

interface TempHistoryItem {
  time: string
  cpu: number
  gpu: number
  disk: number
}

const temperatures = ref<Temperatures>({
  cpu: 0,
  gpu: 0,
  disk: 0
})

const tempHistory = ref<TempHistoryItem[]>([])

let updateInterval: number | null = null

const getTempClass = (temp: number) => {
  if (temp <= 0) return 'temp-unavailable'
  if (temp < 60) return 'temp-normal'
  if (temp < 80) return 'temp-warning'
  return 'temp-danger'
}

const isTempAvailable = (temp: number) => temp > 0

const formatTemp = (temp: number) => {
  return isTempAvailable(temp) ? temp.toFixed(2) : 'N/A'
}

const fetchTemperatures = async () => {
  try {
    const temps = await invoke<Temperatures>('get_temperatures')
    temperatures.value = temps
    
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    
    tempHistory.value.unshift({
      time: timeStr,
      ...temps
    })
    
    if (tempHistory.value.length > 20) {
      tempHistory.value.pop()
    }
  } catch (error) {
    console.error('获取温度信息失败:', error)
  }
}

onMounted(() => {
  fetchTemperatures()
  updateInterval = window.setInterval(fetchTemperatures, 2000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.temperature {
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

.temp-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.temp-icon-wrap {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

.temp-icon-wrap.cpu {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.temp-icon-wrap.gpu {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.temp-icon-wrap.disk {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.temp-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.temp-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.temp-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.temp-unavailable {
  color: #94a3b8;
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

.temp-unit {
  font-size: 16px;
  font-weight: 500;
  margin-left: 2px;
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
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.temp-history {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item .time {
  color: #64748b;
  width: 80px;
}

.history-item .cpu-temp {
  color: #3b82f6;
}

.history-item .gpu-temp {
  color: #22c55e;
}

.history-item .disk-temp {
  color: #f97316;
}

.history-empty {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}
</style>
