<template>
  <div class="benchmark">
    <h2 class="page-title">性能测试</h2>
    
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="bench-card" shadow="hover">
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
        <el-card class="bench-card" shadow="hover">
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
        <el-card class="bench-card" shadow="hover">
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
    
    <el-card class="result-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><TrendCharts /></el-icon>
          <span>测试结果</span>
        </div>
      </template>
      <el-table :data="benchmarkResults" style="width: 100%" dark>
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
  color: #e0e0e0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #409eff;
}

.bench-card {
  background-color: #1e1e1e;
  border: 1px solid #333;
}

.bench-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px;
}

.bench-icon {
  font-size: 48px;
  color: #409eff;
}

.bench-title {
  font-size: 16px;
  font-weight: bold;
}

.bench-result {
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-label {
  color: #a0a0a0;
}

.score-value {
  color: #67c23a;
  font-size: 24px;
  font-weight: bold;
}

.result-card {
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
</style>
