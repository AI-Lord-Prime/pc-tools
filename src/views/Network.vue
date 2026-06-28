<template>
  <div class="network">
    <h2 class="page-title">网络工具</h2>
    
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="tool-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Connection /></el-icon>
              <span>网络信息</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="IP 地址">{{ networkInfo.ip }}</el-descriptions-item>
            <el-descriptions-item label="子网掩码">{{ networkInfo.subnet }}</el-descriptions-item>
            <el-descriptions-item label="默认网关">{{ networkInfo.gateway }}</el-descriptions-item>
            <el-descriptions-item label="DNS 服务器">{{ networkInfo.dns }}</el-descriptions-item>
            <el-descriptions-item label="MAC 地址">{{ networkInfo.mac }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="tool-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Promotion /></el-icon>
              <span>网络测试</span>
            </div>
          </template>
          <div class="test-tools">
            <div class="test-item">
              <el-input v-model="pingHost" placeholder="输入主机地址" style="width: 200px;" />
              <el-button type="primary" @click="runPing">Ping</el-button>
            </div>
            <div class="test-result">
              <pre>{{ pingResult }}</pre>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="speed-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><Odometer /></el-icon>
          <span>实时网速</span>
        </div>
      </template>
      <el-row :gutter="40">
        <el-col :span="12">
          <div class="speed-item">
            <el-icon class="speed-icon download"><Download /></el-icon>
            <div class="speed-info">
              <span class="speed-label">下载速度</span>
              <span class="speed-value">{{ networkSpeed.download }}</span>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="speed-item">
            <el-icon class="speed-icon upload"><Upload /></el-icon>
            <div class="speed-info">
              <span class="speed-label">上传速度</span>
              <span class="speed-value">{{ networkSpeed.upload }}</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { invoke } from '@tauri-apps/api/tauri'

interface NetworkInfo {
  ip: string
  subnet: string
  gateway: string
  dns: string
  mac: string
}

interface NetworkSpeed {
  download: string
  upload: string
}

const networkInfo = ref<NetworkInfo>({
  ip: '加载中...',
  subnet: '加载中...',
  gateway: '加载中...',
  dns: '加载中...',
  mac: '加载中...'
})

const networkSpeed = ref<NetworkSpeed>({
  download: '0 KB/s',
  upload: '0 KB/s'
})

const pingHost = ref('')
const pingResult = ref('')

let updateInterval: number | null = null

const fetchNetworkInfo = async () => {
  try {
    const info = await invoke<NetworkInfo>('get_network_info')
    networkInfo.value = info
  } catch (error) {
    console.error('获取网络信息失败:', error)
  }
}

const fetchNetworkSpeed = async () => {
  try {
    const speed = await invoke<NetworkSpeed>('get_network_speed')
    networkSpeed.value = speed
  } catch (error) {
    console.error('获取网速失败:', error)
  }
}

const runPing = async () => {
  if (!pingHost.value) {
    ElMessage.warning('请输入主机地址')
    return
  }
  
  try {
    pingResult.value = '正在测试...'
    const result = await invoke<string>('run_ping', { host: pingHost.value })
    pingResult.value = result
  } catch (error) {
    pingResult.value = '测试失败: ' + error
  }
}

onMounted(() => {
  fetchNetworkInfo()
  fetchNetworkSpeed()
  updateInterval = window.setInterval(fetchNetworkSpeed, 1000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.network {
  color: #e0e0e0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #409eff;
}

.tool-card, .speed-card {
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

.test-tools {
  padding: 20px;
}

.test-item {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.test-result {
  background-color: #121212;
  padding: 15px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.test-result pre {
  margin: 0;
  color: #67c23a;
  font-family: monospace;
  white-space: pre-wrap;
}

.speed-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.speed-icon {
  font-size: 48px;
}

.speed-icon.download {
  color: #67c23a;
}

.speed-icon.upload {
  color: #409eff;
}

.speed-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.speed-label {
  color: #a0a0a0;
  font-size: 14px;
}

.speed-value {
  color: #e0e0e0;
  font-size: 24px;
  font-weight: bold;
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
