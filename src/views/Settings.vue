<template>
  <div class="settings">
    <h2 class="page-title">设置</h2>
    
    <el-card class="settings-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
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
    
    <el-card class="settings-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><Bell /></el-icon>
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
    
    <el-card class="settings-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>关于</span>
        </div>
      </template>
      <div class="about-content">
        <p><strong>查机工具箱</strong></p>
        <p>版本: 0.0.1</p>
        <p>基于 Tauri + Vue 3 开发</p>
        <p>一款简洁高效的系统工具集</p>
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
  color: #e0e0e0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #409eff;
}

.settings-card {
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

.about-content {
  padding: 20px;
  line-height: 2;
}

.about-content p {
  margin: 0;
}

:deep(.el-form-item__label) {
  color: #a0a0a0;
}
</style>
