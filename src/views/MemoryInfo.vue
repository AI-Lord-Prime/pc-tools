<template>
  <div class="memory-info">
    <h2 class="page-title">内存信息</h2>
    
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Coin /></el-icon>
          <span>内存详情</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="总容量">{{ memoryInfo.total }}</el-descriptions-item>
        <el-descriptions-item label="可用容量">{{ memoryInfo.available }}</el-descriptions-item>
        <el-descriptions-item label="已使用">{{ memoryInfo.used }}</el-descriptions-item>
        <el-descriptions-item label="使用率">{{ memoryInfo.usagePercent }}%</el-descriptions-item>
        <el-descriptions-item label="内存类型">{{ memoryInfo.type }}</el-descriptions-item>
        <el-descriptions-item label="内存频率">{{ memoryInfo.frequency }}</el-descriptions-item>
        <el-descriptions-item label="内存插槽数">{{ memoryInfo.slots }}</el-descriptions-item>
        <el-descriptions-item label="已使用插槽">{{ memoryInfo.usedSlots }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <el-card class="usage-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><TrendCharts /></el-icon>
          <span>内存使用情况</span>
        </div>
      </template>
      <div class="memory-bar">
        <div class="bar-label">
          <span>内存使用率</span>
          <span>{{ memoryInfo.usagePercent }}%</span>
        </div>
        <el-progress :percentage="memoryInfo.usagePercent" :color="getProgressColor(memoryInfo.usagePercent)" :stroke-width="20" />
        <div class="bar-detail">
          <span>已使用: {{ memoryInfo.used }}</span>
          <span>可用: {{ memoryInfo.available }}</span>
          <span>总计: {{ memoryInfo.total }}</span>
        </div>
      </div>
    </el-card>
    
    <el-card class="modules-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><List /></el-icon>
          <span>内存条详情</span>
        </div>
      </template>
      <el-table :data="memoryModules" style="width: 100%" dark>
        <el-table-column prop="slot" label="插槽" width="100" />
        <el-table-column prop="manufacturer" label="制造商" width="150" />
        <el-table-column prop="model" label="型号" />
        <el-table-column prop="size" label="容量" width="100" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="speed" label="频率" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

interface MemoryDetailedInfo {
  total: string
  available: string
  used: string
  usagePercent: number
  type: string
  frequency: string
  slots: number
  usedSlots: number
}

interface MemoryModule {
  slot: string
  manufacturer: string
  model: string
  size: string
  type: string
  speed: string
}

const memoryInfo = ref<MemoryDetailedInfo>({
  total: '0 GB',
  available: '0 GB',
  used: '0 GB',
  usagePercent: 0,
  type: '加载中...',
  frequency: '0 MHz',
  slots: 0,
  usedSlots: 0
})

const memoryModules = ref<MemoryModule[]>([])

let updateInterval: number | null = null

const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

const fetchMemoryInfo = async () => {
  try {
    const [info, modules] = await Promise.all([
      invoke<MemoryDetailedInfo>('get_memory_detailed_info'),
      invoke<MemoryModule[]>('get_memory_modules')
    ])
    memoryInfo.value = info
    memoryModules.value = modules
  } catch (error) {
    console.error('获取内存信息失败:', error)
  }
}

onMounted(() => {
  fetchMemoryInfo()
  updateInterval = window.setInterval(fetchMemoryInfo, 2000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.memory-info {
  color: #e0e0e0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #409eff;
}

.info-card, .usage-card, .modules-card {
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

.memory-bar {
  padding: 20px;
}

.bar-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #a0a0a0;
}

.bar-detail {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: #a0a0a0;
  font-size: 14px;
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
