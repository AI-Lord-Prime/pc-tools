<template>
  <div class="clean">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">系统清理</h2>
        <span class="page-subtitle">垃圾文件扫描与清理</span>
      </div>
    </div>
    
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card class="clean-card" shadow="never" @click="scanCache">
          <div class="clean-content">
            <el-icon class="clean-icon"><Delete /></el-icon>
            <span class="clean-title">系统缓存</span>
            <span class="clean-size">{{ cacheSize }}</span>
            <el-button type="primary" size="small">扫描</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="clean-card" shadow="never" @click="scanTemp">
          <div class="clean-content">
            <el-icon class="clean-icon"><DocumentDelete /></el-icon>
            <span class="clean-title">临时文件</span>
            <span class="clean-size">{{ tempSize }}</span>
            <el-button type="primary" size="small">扫描</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="clean-card" shadow="never" @click="scanLogs">
          <div class="clean-content">
            <el-icon class="clean-icon"><Tickets /></el-icon>
            <span class="clean-title">系统日志</span>
            <span class="clean-size">{{ logsSize }}</span>
            <el-button type="primary" size="small">扫描</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="8">
        <el-card class="clean-card" shadow="never" @click="scanRecycle">
          <div class="clean-content">
            <el-icon class="clean-icon"><DeleteFilled /></el-icon>
            <span class="clean-title">回收站</span>
            <span class="clean-size">{{ recycleSize }}</span>
            <el-button type="primary" size="small">清空</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="clean-card" shadow="never" @click="scanBrowser">
          <div class="clean-content">
            <el-icon class="clean-icon"><Browser /></el-icon>
            <span class="clean-title">浏览器缓存</span>
            <span class="clean-size">{{ browserSize }}</span>
            <el-button type="primary" size="small">扫描</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="clean-card" shadow="never" @click="scanAll">
          <div class="clean-content">
            <el-icon class="clean-icon"><Finished /></el-icon>
            <span class="clean-title">一键清理</span>
            <span class="clean-size">{{ totalSize }}</span>
            <el-button type="success" size="small">全部清理</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="result-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <el-icon><List /></el-icon>
          <span>扫描结果</span>
          <el-button type="danger" size="small" style="margin-left: auto;">清理选中项</el-button>
        </div>
      </template>
      <el-table :data="scanResults" style="width: 100%">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="path" label="路径" />
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column prop="count" label="文件数" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { invoke } from '@tauri-apps/api/tauri'

interface ScanResult {
  name: string
  path: string
  size: string
  count: number
}

const cacheSize = ref('0 MB')
const tempSize = ref('0 MB')
const logsSize = ref('0 MB')
const recycleSize = ref('0 MB')
const browserSize = ref('0 MB')
const totalSize = ref('0 MB')

const scanResults = ref<ScanResult[]>([])

const scanCache = async () => {
  try {
    const result = await invoke<{ size: string; items: ScanResult[] }>('scan_cache')
    cacheSize.value = result.size
    scanResults.value = result.items
    ElMessage.success('扫描完成')
  } catch (error) {
    ElMessage.error('扫描失败: ' + error)
  }
}

const scanTemp = async () => {
  try {
    const result = await invoke<{ size: string; items: ScanResult[] }>('scan_temp')
    tempSize.value = result.size
    scanResults.value = result.items
    ElMessage.success('扫描完成')
  } catch (error) {
    ElMessage.error('扫描失败: ' + error)
  }
}

const scanLogs = async () => {
  try {
    const result = await invoke<{ size: string; items: ScanResult[] }>('scan_logs')
    logsSize.value = result.size
    scanResults.value = result.items
    ElMessage.success('扫描完成')
  } catch (error) {
    ElMessage.error('扫描失败: ' + error)
  }
}

const scanRecycle = async () => {
  try {
    const result = await invoke<{ size: string; items: ScanResult[] }>('scan_recycle')
    recycleSize.value = result.size
    scanResults.value = result.items
    ElMessage.success('扫描完成')
  } catch (error) {
    ElMessage.error('扫描失败: ' + error)
  }
}

const scanBrowser = async () => {
  try {
    const result = await invoke<{ size: string; items: ScanResult[] }>('scan_browser')
    browserSize.value = result.size
    scanResults.value = result.items
    ElMessage.success('扫描完成')
  } catch (error) {
    ElMessage.error('扫描失败: ' + error)
  }
}

const scanAll = async () => {
  try {
    const result = await invoke<{ size: string; items: ScanResult[] }>('scan_all')
    totalSize.value = result.size
    scanResults.value = result.items
    ElMessage.success('扫描完成')
  } catch (error) {
    ElMessage.error('扫描失败: ' + error)
  }
}
</script>

<style scoped>
.clean {
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

.clean-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clean-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
}

.clean-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.clean-icon {
  font-size: 44px;
  color: #3b82f6;
}

.clean-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.clean-size {
  font-size: 14px;
  color: #f59e0b;
  font-weight: 700;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
  font-size: 15px;
  font-weight: 600;
}

.result-card {
  margin-top: 16px;
}
</style>
