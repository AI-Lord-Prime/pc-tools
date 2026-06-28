<template>
  <div class="motherboard-info">
    <h2 class="page-title">主板信息</h2>
    
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Grid /></el-icon>
          <span>主板详情</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="主板型号">{{ motherboardInfo.model }}</el-descriptions-item>
        <el-descriptions-item label="制造商">{{ motherboardInfo.manufacturer }}</el-descriptions-item>
        <el-descriptions-item label="芯片组">{{ motherboardInfo.chipset }}</el-descriptions-item>
        <el-descriptions-item label="BIOS 版本">{{ motherboardInfo.biosVersion }}</el-descriptions-item>
        <el-descriptions-item label="BIOS 日期">{{ motherboardInfo.biosDate }}</el-descriptions-item>
        <el-descriptions-item label="主板序列号">{{ motherboardInfo.serialNumber }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <el-card class="bios-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>BIOS 信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="BIOS 厂商">{{ biosInfo.vendor }}</el-descriptions-item>
        <el-descriptions-item label="BIOS 版本">{{ biosInfo.version }}</el-descriptions-item>
        <el-descriptions-item label="发布日期">{{ biosInfo.date }}</el-descriptions-item>
        <el-descriptions-item label="BIOS 大小">{{ biosInfo.size }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

interface MotherboardInfo {
  model: string
  manufacturer: string
  chipset: string
  biosVersion: string
  biosDate: string
  serialNumber: string
}

interface BiosInfo {
  vendor: string
  version: string
  date: string
  size: string
}

const motherboardInfo = ref<MotherboardInfo>({
  model: '加载中...',
  manufacturer: '加载中...',
  chipset: '加载中...',
  biosVersion: '加载中...',
  biosDate: '加载中...',
  serialNumber: '加载中...'
})

const biosInfo = ref<BiosInfo>({
  vendor: '加载中...',
  version: '加载中...',
  date: '加载中...',
  size: '加载中...'
})

const fetchMotherboardInfo = async () => {
  try {
    const [mb, bios] = await Promise.all([
      invoke<MotherboardInfo>('get_motherboard_info'),
      invoke<BiosInfo>('get_bios_info')
    ])
    motherboardInfo.value = mb
    biosInfo.value = bios
  } catch (error) {
    console.error('获取主板信息失败:', error)
  }
}

onMounted(() => {
  fetchMotherboardInfo()
})
</script>

<style scoped>
.motherboard-info {
  color: #e0e0e0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #409eff;
}

.info-card, .bios-card {
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
