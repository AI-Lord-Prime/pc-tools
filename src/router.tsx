import { createHashRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './App'
import Overview from './pages/Overview'
import CPUInfo from './pages/CPUInfo'
import GPUInfo from './pages/GPUInfo'
import MemoryInfo from './pages/MemoryInfo'
import DiskInfo from './pages/DiskInfo'
import MotherboardInfo from './pages/MotherboardInfo'
import Temperature from './pages/Temperature'
import Usage from './pages/Usage'
import Fan from './pages/Fan'
import Clean from './pages/Clean'
import Startup from './pages/Startup'
import Driver from './pages/Driver'
import Network from './pages/Network'
import Benchmark from './pages/Benchmark'
import Settings from './pages/Settings'

const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Overview /> },
      { path: 'cpu', element: <CPUInfo /> },
      { path: 'gpu', element: <GPUInfo /> },
      { path: 'memory', element: <MemoryInfo /> },
      { path: 'disk', element: <DiskInfo /> },
      { path: 'motherboard', element: <MotherboardInfo /> },
      { path: 'temperature', element: <Temperature /> },
      { path: 'usage', element: <Usage /> },
      { path: 'fan', element: <Fan /> },
      { path: 'clean', element: <Clean /> },
      { path: 'startup', element: <Startup /> },
      { path: 'driver', element: <Driver /> },
      { path: 'network', element: <Network /> },
      { path: 'benchmark', element: <Benchmark /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
