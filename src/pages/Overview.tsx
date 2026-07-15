import { useCallback, useEffect, useState } from 'react'
import { Cpu, MemoryStick, Monitor, Folder } from 'lucide-react'
import { invoke } from '@/lib/tauri'
import { formatNumber, progressColor } from '@/lib/utils'
import { useInterval } from '@/hooks/use-interval'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface CpuInfo {
  name: string
  cores: number
  usage: number
}

interface MemoryInfo {
  total: string
  used: string
  usage: number
}

interface GpuInfo {
  name: string
  memory: string
  temperature: number
}

interface SystemInfo {
  os: string
  version: string
  hostname: string
}

interface DiskInfoItem {
  name: string
  total: string
  used: string
  free: string
  usage: number
}

export default function Overview() {
  const [cpuInfo, setCpuInfo] = useState<CpuInfo>({ name: '加载中...', cores: 0, usage: 0 })
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo>({ total: '0 GB', used: '0 GB', usage: 0 })
  const [gpuInfo, setGpuInfo] = useState<GpuInfo>({ name: '加载中...', memory: '0 GB', temperature: 0 })
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({ os: '加载中...', version: '加载中...', hostname: '加载中...' })
  const [diskInfo, setDiskInfo] = useState<DiskInfoItem[]>([])

  const fetchSystemInfo = useCallback(async () => {
    try {
      const [cpu, memory, gpu, system, disks] = await Promise.all([
        invoke<CpuInfo>('get_cpu_info'),
        invoke<MemoryInfo>('get_memory_info'),
        invoke<GpuInfo>('get_gpu_info'),
        invoke<SystemInfo>('get_system_info'),
        invoke<DiskInfoItem[]>('get_disk_info'),
      ])
      setCpuInfo({ ...cpu, usage: parseFloat(cpu.usage.toFixed(2)) })
      setMemoryInfo({ ...memory, usage: parseFloat(memory.usage.toFixed(2)) })
      setGpuInfo({ ...gpu, temperature: parseFloat(gpu.temperature.toFixed(2)) })
      setSystemInfo(system)
      setDiskInfo(disks.map((d) => ({ ...d, usage: parseFloat(d.usage.toFixed(2)) })))
    } catch (error) {
      console.error('获取系统信息失败:', error)
    }
  }, [])

  useEffect(() => {
    fetchSystemInfo()
  }, [fetchSystemInfo])

  useInterval(fetchSystemInfo, 3000)

  return (
    <div>
      <PageHeader title="系统概览" subtitle="实时硬件状态监控" />

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">CPU</span>
              <span className="text-sm font-medium text-slate-800 break-all">{cpuInfo.name}</span>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                <span>{cpuInfo.cores} 核心</span>
                <Progress value={cpuInfo.usage} className="h-1.5 flex-1" indicatorColor={progressColor(cpuInfo.usage)} />
                <span className="font-semibold text-blue-500">{cpuInfo.usage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <MemoryStick className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">内存</span>
              <span className="text-sm font-medium text-slate-800">
                {memoryInfo.used} / {memoryInfo.total}
              </span>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                <Progress value={memoryInfo.usage} className="h-1.5 flex-1" indicatorColor={progressColor(memoryInfo.usage)} />
                <span className="font-semibold text-blue-500">{memoryInfo.usage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <Monitor className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">显卡</span>
              <span className="text-sm font-medium text-slate-800 break-all">{gpuInfo.name}</span>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                <span>显存 {gpuInfo.memory}</span>
                <span className="font-semibold text-green-500">{formatNumber(gpuInfo.temperature)}°C</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
              <Monitor className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">系统</span>
              <span className="text-sm font-medium text-slate-800">{systemInfo.os}</span>
              <div className="mt-0.5 text-xs text-slate-500">{systemInfo.version}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardHeaderTitle icon={<Folder className="h-4 w-4" />} iconClassName="bg-orange-500/10 text-orange-500" title="磁盘存储" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">磁盘名称</TableHead>
                <TableHead className="w-[120px]">总容量</TableHead>
                <TableHead className="w-[120px]">已使用</TableHead>
                <TableHead className="w-[120px]">可用空间</TableHead>
                <TableHead>使用率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diskInfo.map((disk) => (
                <TableRow key={disk.name}>
                  <TableCell>{disk.name}</TableCell>
                  <TableCell>{disk.total}</TableCell>
                  <TableCell>{disk.used}</TableCell>
                  <TableCell>{disk.free}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Progress value={disk.usage} className="h-2 flex-1" indicatorColor={progressColor(disk.usage)} />
                      <span className="whitespace-nowrap text-[13px] font-semibold text-slate-700">{disk.usage}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
