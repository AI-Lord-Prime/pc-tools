<template>
  <div class="startup">
    <div class="page-header">
      <div class="page-title-row">
        <h2 class="page-title">启动项管理</h2>
        <span class="page-subtitle">开机启动项管理</span>
      </div>
    </div>
    
    <el-card class="startup-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-icon-badge startup">
            <el-icon :size="18"><Star /></el-icon>
          </div>
          <span>启动项列表</span>
          <el-button type="primary" size="small" style="margin-left: auto;" @click="refreshList">刷新</el-button>
        </div>
      </template>
      <el-table :data="startupItems" style="width: 100%">
        <el-table-column prop="name" label="名称" width="200" />
        <el-table-column prop="publisher" label="发布者" width="150" />
        <el-table-column prop="path" label="路径" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.enabled" @change="toggleStartup(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="danger" size="small" @click="deleteStartup(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { invoke } from '@tauri-apps/api/tauri'

interface StartupItem {
  name: string
  publisher: string
  path: string
  enabled: boolean
}

const startupItems = ref<StartupItem[]>([])

const refreshList = async () => {
  try {
    const items = await invoke<StartupItem[]>('get_startup_items')
    startupItems.value = items
    ElMessage.success('刷新成功')
  } catch (error) {
    ElMessage.error('获取启动项失败: ' + error)
  }
}

const toggleStartup = async (item: StartupItem) => {
  try {
    await invoke('toggle_startup', { name: item.name, enabled: item.enabled })
    ElMessage.success(item.enabled ? '已启用' : '已禁用')
  } catch (error) {
    ElMessage.error('操作失败: ' + error)
    item.enabled = !item.enabled
  }
}

const deleteStartup = async (item: StartupItem) => {
  try {
    await invoke('delete_startup', { name: item.name })
    startupItems.value = startupItems.value.filter(i => i.name !== item.name)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败: ' + error)
  }
}

onMounted(() => {
  refreshList()
})
</script>

<style scoped>
.startup {
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
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
</style>
