<template>
  <div class="temperature">
    <h2 class="page-title">温度监控</h2>
    
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="temp-card" shadow="hover">
          <div class="temp-content">
            <el-icon class="temp-icon cpu"><Cpu /></el-icon>
            <div class="temp-info">
              <span class="temp-label">CPU 温度</span>
              <span class="temp-value" :class="getTempClass(temperatures.cpu)">{{ formatNumber(temperatures.cpu) }}°C</span>
            </div>
            <el-progress type="dashboard" :percentage="temperatures.cpu" :color="getTempColor(temperatures.cpu)" :width="80" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="temp-card" shadow="hover">
          <div class="temp-content">
            <el-icon class="temp-icon gpu"><VideoCameraFilled /></el-icon>
            <div class="temp-info">
              <span class="temp-label">GPU 温度</span>
              <span class="temp-value" :class="getTempClass(temperatures.gpu)">{{ formatNumber(temperatures.gpu) }}°C</span>
            </div>
            <el-progress type="dashboard" :percentage="temperatures.gpu" :color="getTempColor(temperatures.gpu)" :width="80" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="temp-card" shadow="hover">
          <div class="temp-content">
            <el-icon class="temp-icon disk"><Folder /></el-icon>
            <div class="temp-info">
              <span class="temp-label">硬盘温度</span>
              <span class="temp-value" :class="getTempClass(temperatures.disk)">{{ formatNumber(temperatures.disk) }}°C</span>
            </div>
            <el-progress type="dashboard" :percentage="temperatures.disk" :color="getTempColor(temperatures.disk)" :width="80" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="chart-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><TrendCharts /></el-icon>
          <span>温度历史记录</span>
        </div>
      </template>
      <div class="chart-placeholder">
        <p>温度曲线图（待实现）</p>
        <div class="temp-history">
          <div v-for="(item, index) in tempHistory" :key="index" class="history-item">
            <span class="time">{{ item.time }}</span>
            <span class="cpu">CPU: {{ item.cpu }}°C</span>
            <span class="gpu">GPU: {{ item.gpu }}°C</span>
            <span class="disk">Disk: {{ item.disk }}°C</span>
          </div>
        </div>
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

const getTempColor = (temp: number) => {
  if (temp < 60) return '#67c23a'
  if (temp < 80) return '#e6a23c'
  return '#f56c6c'
}

const getTempClass = (temp: number) => {
  if (temp < 60) return 'temp-normal'
  if (temp < 80) return 'temp-warning'
  return 'temp-danger'
}

const formatNumber = (num: number) => {
  return num.toFixed(2)
}

const fetchTemperatures = async () => {
  try {
    const temps = await invoke<Temperatures>('get_temperatures')
    temperatures.value = temps
    
    // 添加历史记录
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    
    tempHistory.value.unshift({
      time: timeStr,
      ...temps
    })
    
    // 保留最近20条记录
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
  color: #e0e0e0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #409eff;
}

.temp-card {
  background-color: #1e1e1e;
  border: 1px solid #333;
}

.temp-content {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
}

.temp-icon {
  font-size: 40px;
}

.temp-icon.cpu {
  color: #409eff;
}

.temp-icon.gpu {
  color: #67c23a;
}

.temp-icon.disk {
  color: #e6a23c;
}

.temp-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.temp-label {
  font-size: 14px;
  color: #a0a0a0;
}

.temp-value {
  font-size: 24px;
  font-weight: bold;
}

.temp-normal {
  color: #67c23a;
}

.temp-warning {
  color: #e6a23c;
}

.temp-danger {
  color: #f56c6c;
}

.chart-card {
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

.chart-placeholder {
  padding: 20px;
  text-align: center;
  color: #a0a0a0;
}

.temp-history {
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #333;
}

.history-item .time {
  color: #a0a0a0;
  width: 80px;
}

.history-item .cpu {
  color: #409eff;
}

.history-item .gpu {
  color: #67c23a;
}

.history-item .disk {
  color: #e6a23c;
}
</style>
