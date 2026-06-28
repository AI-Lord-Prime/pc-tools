<template>
  <div class="fan">
    <h2 class="page-title">风扇转速</h2>
    
    <el-card class="fan-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><WindPower /></el-icon>
          <span>风扇状态</span>
        </div>
      </template>
      <el-table :data="fanList" style="width: 100%" dark>
        <el-table-column prop="name" label="风扇名称" width="200" />
        <el-table-column prop="speed" label="当前转速" width="150">
          <template #default="scope">
            <span class="speed-value">{{ scope.row.speed }} RPM</span>
          </template>
        </el-table-column>
        <el-table-column label="转速状态">
          <template #default="scope">
            <el-progress :percentage="getFanPercentage(scope.row.speed, scope.row.maxSpeed)" :color="getFanColor(scope.row.speed, scope.row.maxSpeed)" />
          </template>
        </el-table-column>
        <el-table-column prop="mode" label="控制模式" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.mode === 'Auto' ? 'success' : 'info'">{{ scope.row.mode }}</el-tag>
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
  if (percentage < 30) return '#67c23a'
  if (percentage < 70) return '#e6a23c'
  return '#f56c6c'
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
  color: #e0e0e0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #409eff;
}

.fan-card {
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

.speed-value {
  color: #409eff;
  font-weight: bold;
}

:deep(.el-progress__text) {
  color: #e0e0e0 !important;
}
</style>
