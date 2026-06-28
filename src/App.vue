<template>
  <div class="app-container">
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-aside width="220px" class="sidebar">
        <div class="logo">
          <el-icon :size="28"><Monitor /></el-icon>
          <span class="logo-text">查机工具箱</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
          background-color="#1e1e1e"
          text-color="#a0a0a0"
          active-text-color="#409eff"
        >
          <el-menu-item index="overview">
            <el-icon><DataBoard /></el-icon>
            <span>系统概览</span>
          </el-menu-item>
          
          <el-sub-menu index="hardware">
            <template #title>
              <el-icon><Cpu /></el-icon>
              <span>硬件信息</span>
            </template>
            <el-menu-item index="cpu">CPU 信息</el-menu-item>
            <el-menu-item index="gpu">显卡信息</el-menu-item>
            <el-menu-item index="memory">内存信息</el-menu-item>
            <el-menu-item index="disk">硬盘信息</el-menu-item>
            <el-menu-item index="motherboard">主板信息</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="monitor">
            <template #title>
              <el-icon><TrendCharts /></el-icon>
              <span>硬件监控</span>
            </template>
            <el-menu-item index="temperature">温度监控</el-menu-item>
            <el-menu-item index="usage">使用率监控</el-menu-item>
            <el-menu-item index="fan">风扇转速</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="tools">
            <template #title>
              <el-icon><Tools /></el-icon>
              <span>系统工具</span>
            </template>
            <el-menu-item index="clean">系统清理</el-menu-item>
            <el-menu-item index="startup">启动项管理</el-menu-item>
            <el-menu-item index="driver">驱动管理</el-menu-item>
            <el-menu-item index="network">网络工具</el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="benchmark">
            <el-icon><Stopwatch /></el-icon>
            <span>性能测试</span>
          </el-menu-item>
          
          <el-menu-item index="settings">
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => {
  return route.name as string || 'overview'
})

const handleMenuSelect = (index: string) => {
  router.push({ name: index })
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  overflow: hidden;
}

.app-container {
  height: 100%;
  background-color: #121212;
}

.main-container {
  height: 100%;
}

.sidebar {
  background-color: #1e1e1e;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #409eff;
  border-bottom: 1px solid #333;
}

.logo-text {
  font-size: 16px;
  font-weight: bold;
}

.sidebar-menu {
  flex: 1;
  border-right: none !important;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.main-content {
  background-color: #121212;
  padding: 20px;
  overflow-y: auto;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1e1e1e;
}

::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Element Plus 暗色主题适配 */
.el-menu {
  border-right: none !important;
}

.el-sub-menu__title {
  color: #a0a0a0 !important;
}

.el-sub-menu__title:hover {
  background-color: #2a2a2a !important;
}
</style>
