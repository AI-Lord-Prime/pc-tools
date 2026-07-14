<template>
  <div class="motherboard-info">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">主板信息</h2>
        <span class="page-subtitle">主板与 BIOS 详情</span>
      </div>
    </div>
    
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge board">
            <el-icon :size="18"><Grid /></el-icon>
          </div>
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
    
    <el-card class="bios-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge bios">
            <el-icon :size="18"><Document /></el-icon>
          </div>
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

.card-icon-badge.board {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.card-icon-badge.bios {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}
</style>
