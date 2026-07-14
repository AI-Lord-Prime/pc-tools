<template>
  <div class="settings">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">设置</h2>
        <span class="page-subtitle">应用偏好与通知</span>
      </div>
    </div>
    
    <el-card class="settings-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge general">
            <el-icon :size="18"><Setting /></el-icon>
          </div>
          <span>常规设置</span>
        </div>
      </template>
      <el-form label-width="120px">
        <el-form-item label="开机自启">
          <el-switch v-model="settings.autoStart" @change="saveSettings" />
        </el-form-item>
        <el-form-item label="最小化到托盘">
          <el-switch v-model="settings.minimizeToTray" @change="saveSettings" />
        </el-form-item>
        <el-form-item label="关闭时">
          <el-radio-group v-model="settings.closeAction" @change="saveSettings">
            <el-radio label="minimize">最小化</el-radio>
            <el-radio label="exit">退出</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="刷新频率">
          <el-select v-model="settings.refreshRate" @change="saveSettings">
            <el-option label="1 秒" :value="1000" />
            <el-option label="2 秒" :value="2000" />
            <el-option label="5 秒" :value="5000" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="settings-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge notify">
            <el-icon :size="18"><Bell /></el-icon>
          </div>
          <span>通知设置</span>
        </div>
      </template>
      <el-form label-width="120px">
        <el-form-item label="温度警告">
          <el-switch v-model="settings.tempWarning" @change="saveSettings" />
        </el-form-item>
        <el-form-item label="警告阈值">
          <el-slider v-model="settings.tempThreshold" :min="60" :max="95" show-input @change="saveSettings" />
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="settings-card" shadow="never" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge about">
            <el-icon :size="18"><InfoFilled /></el-icon>
          </div>
          <span>关于</span>
        </div>
      </template>
      <div class="about-content">
        <div class="about-name">查机工具箱</div>
        <div class="about-row"><span class="about-label">版本</span><span>0.0.1</span></div>
        <div class="about-row"><span class="about-label">框架</span><span>Tauri + Vue 3</span></div>
        <div class="about-desc">一款简洁高效的系统硬件检测工具集</div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { invoke } from '@tauri-apps/api/tauri'

interface AppSettings {
  autoStart: boolean
  minimizeToTray: boolean
  closeAction: string
  refreshRate: number
  tempWarning: boolean
  tempThreshold: number
}

const settings = ref<AppSettings>({
  autoStart: false,
  minimizeToTray: true,
  closeAction: 'minimize',
  refreshRate: 2000,
  tempWarning: true,
  tempThreshold: 80
})

const loadSettings = async () => {
  try {
    const saved = await invoke<AppSettings>('get_settings')
    if (saved) {
      settings.value = saved
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

const saveSettings = async () => {
  try {
    await invoke('save_settings', { settings: settings.value })
    ElMessage.success('设置已保存')
  } catch (error) {
    ElMessage.error('保存设置失败: ' + error)
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings {
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

.card-icon-badge.general {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.card-icon-badge.notify {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.card-icon-badge.about {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.about-content {
  padding: 20px;
}

.about-name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.about-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.about-label {
  color: #64748b;
  width: 60px;
}

.about-desc {
  margin-top: 16px;
  color: #64748b;
  font-size: 13px;
}
</style>
