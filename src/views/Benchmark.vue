<template>
  <div class="benchmark">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">性能测试</h2>
        <span class="page-subtitle">CPU / GPU / 磁盘性能跑分</span>
      </div>
    </div>
    
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card class="bench-card" shadow="never">
          <div class="bench-content">
            <el-icon class="bench-icon"><Cpu /></el-icon>
            <span class="bench-title">CPU 性能测试</span>
            <el-button type="primary" @click="runCpuBench" :loading="cpuRunning">开始测试</el-button>
            <div class="bench-result" v-if="cpuScore">
              <span class="score-label">得分:</span>
              <span class="score-value">{{ cpuScore }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="bench-card" shadow="never">
          <div class="bench-content">
            <el-icon class="bench-icon"><VideoCameraFilled /></el-icon>
            <span class="bench-title">GPU 性能测试</span>
            <el-button type="primary" @click="runGpuBench" :loading="gpuRunning">开始测试</el-button>
            <div class="bench-result" v-if="gpuScore">
              <span class="score-label">得分:</span>
              <span class="score-value">{{ gpuScore }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="bench-card" shadow="never">
          <div class="bench-content">
            <el-icon class="bench-icon"><Folder /></el-icon>
            <span class="bench-title">磁盘性能测试</span>
            <el-button type="primary" @click="runDiskBench" :loading="diskRunning">开始测试</el-button>
            <div class="bench-result" v-if="diskScore">
              <span class="score-label">得分:</span>
              <span class="score-value">{{ diskScore }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="result-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge result">
            <el-icon :size="18"><TrendCharts /></el-icon>
          </div>
          <span>测试结果</span>
        </div>
      </template>
      <el-table :data="benchmarkResults" style="width: 100%">
        <el-table-column prop="name" label="测试项目" width="200" />
        <el-table-column prop="score" label="得分" width="150" />
        <el-table-column prop="detail" label="详细信息" />
        <el-table-column prop="time" label="测试时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { invoke } from '@tauri-apps/api/tauri'

interface BenchmarkResult {
  name: string
  score: number
  detail: string
  time: string
}

const cpuRunning = ref(false)
const gpuRunning = ref(false)
const diskRunning = ref(false)

const cpuScore = ref(0)
const gpuScore = ref(0)
const diskScore = ref(0)

const benchmarkResults = ref<BenchmarkResult[]>([])

const runCpuBench = async () => {
  cpuRunning.value = true
  try {
    const result = await invoke<{ score: number; detail: string }>('run_cpu_benchmark')
    cpuScore.value = result.score
    benchmarkResults.value.unshift({
      name: 'CPU 性能测试',
      score: result.score,
      detail: result.detail,
      time: new Date().toLocaleString()
    })
    ElMessage.success('测试完成')
  } catch (error) {
    ElMessage.error('测试失败: ' + error)
  } finally {
    cpuRunning.value = false
  }
}

const runGpuBench = async () => {
  gpuRunning.value = true
  try {
    const result = await invoke<{ score: number; detail: string }>('run_gpu_benchmark')
    gpuScore.value = result.score
    benchmarkResults.value.unshift({
      name: 'GPU 性能测试',
      score: result.score,
      detail: result.detail,
      time: new Date().toLocaleString()
    })
    ElMessage.success('测试完成')
  } catch (error) {
    ElMessage.error('测试失败: ' + error)
  } finally {
    gpuRunning.value = false
  }
}

const runDiskBench = async () => {
  diskRunning.value = true
  try {
    const result = await invoke<{ score: number; detail: string }>('run_disk_benchmark')
    diskScore.value = result.score
    benchmarkResults.value.unshift({
      name: '磁盘性能测试',
      score: result.score,
      detail: result.detail,
      time: new Date().toLocaleString()
    })
    ElMessage.success('测试完成')
  } catch (error) {
    ElMessage.error('测试失败: ' + error)
  } finally {
    diskRunning.value = false
  }
}
</script>

<style scoped>
.benchmark {
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

.bench-card {
  transition: all 0.3s ease;
}

.bench-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
}

.bench-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.bench-icon {
  font-size: 44px;
  color: #3b82f6;
}

.bench-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.bench-result {
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-label {
  color: #64748b;
}

.score-value {
  color: #22c55e;
  font-size: 24px;
  font-weight: 700;
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

.result-card {
  margin-top: 16px;
}
</style>
