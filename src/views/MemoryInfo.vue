<template>
  <div class="memory-info">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">内存信息</h2>
        <span class="page-subtitle">内存详情与使用情况</span>
      </div>
    </div>
    
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge memory">
            <el-icon :size="18"><Coin /></el-icon>
          </div>
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
    
    <el-card class="usage-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge monitor">
            <el-icon :size="18"><TrendCharts /></el-icon>
          </div>
          <span>内存使用情况</span>
        </div>
      </template>
      <div class="memory-bar">
        <div class="bar-label">
          <span>内存使用率</span>
          <span class="bar-percent">{{ memoryInfo.usagePercent }}%</span>
        </div>
        <el-progress :percentage="memoryInfo.usagePercent" :color="getProgressColor(memoryInfo.usagePercent)" :stroke-width="18" :show-text="false" />
        <div class="bar-detail">
          <span>已使用: {{ memoryInfo.used }}</span>
          <span>可用: {{ memoryInfo.available }}</span>
          <span>总计: {{ memoryInfo.total }}</span>
        </div>
      </div>
    </el-card>
    
    <el-card class="modules-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge list">
            <el-icon :size="18"><List /></el-icon>
          </div>
          <span>内存条详情</span>
        </div>
      </template>
      <el-table :data="memoryModules" style="width: 100%">
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
  if (percentage < 50) return '#a855f7'
  if (percentage < 80) return '#f59e0b'
  return '#ef4444'
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

.card-icon-badge.memory {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.card-icon-badge.monitor {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.card-icon-badge.list {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.memory-bar {
  padding: 16px;
}

.bar-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #64748b;
}

.bar-percent {
  font-weight: 700;
  color: #a855f7;
}

.bar-detail {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  color: #64748b;
  font-size: 13px;
}
</style>
