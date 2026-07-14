<template>
  <div class="app-container">
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-aside width="220px" class="sidebar">
        <div class="logo">
          <div class="logo-icon">
            <el-icon :size="24"><Monitor /></el-icon>
          </div>
          <span class="logo-text">查机工具箱</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
          background-color="transparent"
          text-color="#64748b"
          active-text-color="#ffffff"
        >
          <el-menu-item index="overview" class="menu-top-item">
            <el-icon><DataBoard /></el-icon>
            <span>系统概览</span>
          </el-menu-item>
          
          <div class="menu-group-title">硬件信息</div>
          <el-sub-menu index="hardware" class="submenu-item">
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
          
          <div class="menu-group-title">硬件监控</div>
          <el-sub-menu index="monitor" class="submenu-item">
            <template #title>
              <el-icon><TrendCharts /></el-icon>
              <span>硬件监控</span>
            </template>
            <el-menu-item index="temperature">温度监控</el-menu-item>
            <el-menu-item index="usage">使用率监控</el-menu-item>
            <el-menu-item index="fan">风扇转速</el-menu-item>
          </el-sub-menu>
          
          <div class="menu-group-title">系统工具</div>
          <el-sub-menu index="tools" class="submenu-item">
            <template #title>
              <el-icon><Tools /></el-icon>
              <span>系统工具</span>
            </template>
            <el-menu-item index="clean">系统清理</el-menu-item>
            <el-menu-item index="startup">启动项管理</el-menu-item>
            <el-menu-item index="driver">驱动管理</el-menu-item>
            <el-menu-item index="network">网络工具</el-menu-item>
          </el-sub-menu>
          
          <div class="menu-group-title">性能</div>
          <el-menu-item index="benchmark">
            <el-icon><Stopwatch /></el-icon>
            <span>性能测试</span>
          </el-menu-item>
          
          <div class="menu-divider"></div>
          
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
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.app-container {
  height: 100%;
  background-color: #f5f7fa;
}

.main-container {
  height: 100%;
}

.sidebar {
  background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid #e2e8f0;
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  border-radius: 10px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.logo-text {
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 1px;
}

.sidebar-menu {
  flex: 1;
  border-right: none !important;
  padding: 8px 0;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.menu-group-title {
  font-size: 11px;
  color: #94a3b8;
  padding: 16px 20px 6px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  user-select: none;
}

.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 8px 16px;
}

/* 菜单项样式 */
.el-menu-item {
  margin: 2px 8px !important;
  border-radius: 8px !important;
  height: 40px !important;
  line-height: 40px !important;
  transition: all 0.2s ease !important;
  color: #64748b !important;
}

.el-menu-item:hover {
  background-color: #f1f5f9 !important;
  color: #334155 !important;
}

.el-menu-item.is-active {
  background: linear-gradient(135deg, #3b82f6, #06b6d4) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.el-sub-menu__title {
  margin: 2px 8px !important;
  border-radius: 8px !important;
  height: 40px !important;
  line-height: 40px !important;
  color: #64748b !important;
  transition: all 0.2s ease !important;
}

.el-sub-menu__title:hover {
  background-color: #f1f5f9 !important;
  color: #334155 !important;
}

/* 子菜单内部项 */
.el-sub-menu .el-menu-item {
  padding-left: 52px !important;
  min-width: auto !important;
  color: #64748b !important;
}

.main-content {
  background-color: transparent;
  padding: 24px 28px;
  overflow-y: auto;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Element Plus 全局样式适配 */
.el-menu {
  border-right: none !important;
}

/* 全局卡片样式 */
.el-card {
  background-color: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
  transition: box-shadow 0.3s ease !important;
}

.el-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
}

.el-card__header {
  border-bottom: 1px solid #f1f5f9 !important;
  padding: 16px 20px !important;
}

.el-card__body {
  padding: 20px !important;
}

/* 表格亮色 */
.el-table {
  --el-table-bg-color: #ffffff !important;
  --el-table-tr-bg-color: #ffffff !important;
  --el-table-header-bg-color: #f8fafc !important;
  --el-table-row-hover-bg-color: #f1f5f9 !important;
  --el-table-border-color: #e2e8f0 !important;
  --el-table-text-color: #334155 !important;
  --el-table-header-text-color: #64748b !important;
}

.el-table th.el-table__cell {
  background-color: #f8fafc !important;
  font-weight: 600 !important;
}

/* 描述列表亮色 */
.el-descriptions {
  --el-descriptions-item-bordered-label-background: #f8fafc !important;
}

.el-descriptions__label {
  color: #64748b !important;
  font-weight: 500 !important;
}

.el-descriptions__content {
  color: #334155 !important;
}

.el-descriptions__cell {
  border-color: #e2e8f0 !important;
}

/* 进度条文字 */
.el-progress__text {
  color: #334155 !important;
}

/* Tag 亮色 */
.el-tag {
  border-color: transparent !important;
}

/* 表单项 */
.el-form-item__label {
  color: #475569 !important;
  font-weight: 500 !important;
}

.el-input__wrapper,
.el-textarea__inner {
  background-color: #ffffff !important;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
}

.el-slider__runway {
  background-color: #e2e8f0 !important;
}
</style>
