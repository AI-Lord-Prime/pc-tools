import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'overview',
      component: () => import('@/views/Overview.vue')
    },
    {
      path: '/cpu',
      name: 'cpu',
      component: () => import('@/views/CPUInfo.vue')
    },
    {
      path: '/gpu',
      name: 'gpu',
      component: () => import('@/views/GPUInfo.vue')
    },
    {
      path: '/memory',
      name: 'memory',
      component: () => import('@/views/MemoryInfo.vue')
    },
    {
      path: '/disk',
      name: 'disk',
      component: () => import('@/views/DiskInfo.vue')
    },
    {
      path: '/motherboard',
      name: 'motherboard',
      component: () => import('@/views/MotherboardInfo.vue')
    },
    {
      path: '/temperature',
      name: 'temperature',
      component: () => import('@/views/Temperature.vue')
    },
    {
      path: '/usage',
      name: 'usage',
      component: () => import('@/views/Usage.vue')
    },
    {
      path: '/fan',
      name: 'fan',
      component: () => import('@/views/Fan.vue')
    },
    {
      path: '/clean',
      name: 'clean',
      component: () => import('@/views/Clean.vue')
    },
    {
      path: '/startup',
      name: 'startup',
      component: () => import('@/views/Startup.vue')
    },
    {
      path: '/driver',
      name: 'driver',
      component: () => import('@/views/Driver.vue')
    },
    {
      path: '/network',
      name: 'network',
      component: () => import('@/views/Network.vue')
    },
    {
      path: '/benchmark',
      name: 'benchmark',
      component: () => import('@/views/Benchmark.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/Settings.vue')
    }
  ]
})

export default router
