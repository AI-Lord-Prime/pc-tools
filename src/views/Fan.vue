<template>
  <div class="fan">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">风扇转速</h2>
        <span class="page-subtitle">风扇运行状态监控</span>
      </div>
    </div>
    
    <el-card class="fan-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge fan">
            <el-icon :size="18"><WindPower /></el-icon>
          </div>
          <span>风扇状态</span>
        </div>
      </template>
      <el-table :data="fanList" style="width: 100%">
        <el-table-column prop="name" label="风扇名称" width="200" />
        <el-table-column prop="speed" label="当前转速" width="150">
          <template #default="scope">
            <span class="speed-value">{{ scope.row.speed }} RPM</span>
          </template>
        </el-table-column>
        <el-table-column label="转速状态">
          <template #default="scope">
            <el-progress :percentage="getFanPercentage(scope.row.speed, scope.row.maxSpeed)" :color="getFanColor(scope.row.speed, scope.row.maxSpeed)" :stroke-width="8" :show-text="false" />
          </template>
        </el-table-column>
        <el-table-column prop="mode" label="控制模式" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.mode === 'Auto' ? 'success' : 'info'" size="small">{{ scope.row.mode }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

interface FanInfo {
  name: string
  speed: number
  maxSpeed: number
  mode: string
}

const fanList = ref<FanInfo[]>([])

let updateInterval: number | null = null

const getFanPercentage = (speed: number, maxSpeed: number) => {
  return Math.round((speed / maxSpeed) * 100)
}

const getFanColor = (speed: number, maxSpeed: number) => {
  const percentage = (speed / maxSpeed) * 100
  if (percentage < 30) return '#22c55e'
  if (percentage < 70) return '#f59e0b'
  return '#ef4444'
}

const fetchFanInfo = async () => {
  try {
    const fans = await invoke<FanInfo[]>('get_fan_info')
    fanList.value = fans
  } catch (error) {
    console.error('获取风扇信息失败:', error)
  }
}

onMounted(() => {
  fetchFanInfo()
  updateInterval = window.setInterval(fetchFanInfo, 2000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.fan {
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
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
}

.speed-value {
  color: #3b82f6;
  font-weight: 700;
}
</style>
