<template>
  <div class="network">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">网络工具</h2>
        <span class="page-subtitle">网络信息与测速</span>
      </div>
    </div>
    
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card class="tool-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-icon-badge info">
                <el-icon :size="18"><Connection /></el-icon>
              </div>
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
        <el-card class="tool-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-icon-badge test">
                <el-icon :size="18"><Promotion /></el-icon>
              </div>
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
    
    <el-card class="speed-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge speed">
            <el-icon :size="18"><Odometer /></el-icon>
          </div>
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

.card-icon-badge.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.card-icon-badge.test {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.card-icon-badge.speed {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
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
  background-color: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.test-result pre {
  margin: 0;
  color: #22c55e;
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
  font-size: 44px;
}

.speed-icon.download {
  color: #22c55e;
}

.speed-icon.upload {
  color: #3b82f6;
}

.speed-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.speed-label {
  color: #64748b;
  font-size: 14px;
}

.speed-value {
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
}
</style>
