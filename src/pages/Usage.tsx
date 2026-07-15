import { useCallback, useEffect, useState } from 'react'
import { Cpu, MemoryStick, Monitor, Network, Download, Upload } from 'lucide-react'
import { invoke } from '@/lib/tauri'
import { formatNumber, progressColor } from '@/lib/utils'
import { useInterval } from '@/hooks/use-interval'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { CircularProgress } from '@/components/circular-progress'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface CpuUsage {
  total: number
  cores: number[]
}

interface MemoryUsage {
  percentage: number
  used: string
  available: string
  total: string
}

interface GpuUsage {
  core: number
  memory: number
}

interface NetworkUsage {
  download: string
  upload: string
}

export default function Usage() {
  const [cpuUsage, setCpuUsage] = useState<CpuUsage>({ total: 0, cores: [] })
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage>({
    percentage: 0,
    used: '0 GB',
    available: '0 GB',
    total: '0 GB',
  })
  const [gpuUsage, setGpuUsage] = useState<GpuUsage>({ core: 0, memory: 0 })
  const [networkUsage, setNetworkUsage] = useState<NetworkUsage>({ download: '0 KB/s', upload: '0 KB/s' })

  const fetchUsage = useCallback(async () => {
    try {
      const [cpu, memory, gpu, network] = await Promise.all([
        invoke<CpuUsage>('get_cpu_usage'),
        invoke<MemoryUsage>('get_memory_usage'),
        invoke<GpuUsage>('get_gpu_usage'),
        invoke<NetworkUsage>('get_network_usage'),
      ])
      setCpuUsage({
        total: parseFloat(cpu.total.toFixed(2)),
        cores: cpu.cores.map((c) => parseFloat(c.toFixed(2))),
      })
      setMemoryUsage({ ...memory, percentage: parseFloat(memory.percentage.toFixed(2)) })
      setGpuUsage({
        core: parseFloat(gpu.core.toFixed(2)),
        memory: parseFloat(gpu.memory.toFixed(2)),
      })
      setNetworkUsage(network)
    } catch (error) {
      console.error('获取使用率失败:', error)
    }
  }, [])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  useInterval(fetchUsage, 1000)

  return (
    <div>
      <PageHeader title="使用率监控" subtitle="CPU / 内存 / GPU / 网络实时使用率" />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardHeaderTitle icon={<Cpu className="h-4 w-4" />} iconClassName="bg-blue-500/10 text-blue-500" title="CPU 使用率" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-5 p-5">
              <CircularProgress value={cpuUsage.total} color={progressColor(cpuUsage.total)} label={`${formatNumber(cpuUsage.total)}%`} />
              <div className="w-full">
                {cpuUsage.cores.map((core, index) => (
                  <div key={index} className="mb-2 flex items-center gap-2.5">
                    <span className="w-[60px] text-xs text-slate-500">核心 {index}</span>
                    <Progress value={core} className="h-1.5 flex-1" indicatorColor={progressColor(core)} />
                    <span className="w-12 text-right text-xs font-semibold text-slate-700">{core}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardHeaderTitle icon={<MemoryStick className="h-4 w-4" />} iconClassName="bg-purple-500/10 text-purple-500" title="内存使用率" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-5 p-5">
              <CircularProgress
                value={memoryUsage.percentage}
                color={progressColor(memoryUsage.percentage)}
                label={`${formatNumber(memoryUsage.percentage)}%`}
              />
              <div className="w-full space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500">已使用</span>
                  <span className="font-semibold text-slate-700">{memoryUsage.used}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500">可用</span>
                  <span className="font-semibold text-slate-700">{memoryUsage.available}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500">总计</span>
                  <span className="font-semibold text-slate-700">{memoryUsage.total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardHeaderTitle icon={<Monitor className="h-4 w-4" />} iconClassName="bg-green-500/10 text-green-500" title="GPU 使用率" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-5 p-5">
              <CircularProgress value={gpuUsage.core} color={progressColor(gpuUsage.core)} label={`${formatNumber(gpuUsage.core)}%`} />
              <div className="w-full space-y-2">
                <div className="flex items-center gap-2.5 text-[13px]">
                  <span className="w-16 text-slate-500">GPU 核心</span>
                  <Progress value={gpuUsage.core} className="h-1.5 flex-1" indicatorColor={progressColor(gpuUsage.core)} />
                  <span className="w-12 text-right text-xs font-semibold">{gpuUsage.core}%</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px]">
                  <span className="w-16 text-slate-500">显存</span>
                  <Progress value={gpuUsage.memory} className="h-1.5 flex-1" indicatorColor={progressColor(gpuUsage.memory)} />
                  <span className="w-12 text-right text-xs font-semibold">{gpuUsage.memory}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardHeaderTitle icon={<Network className="h-4 w-4" />} iconClassName="bg-orange-500/10 text-orange-500" title="网络使用" />
          </CardHeader>
          <CardContent>
            <div className="w-full p-5">
              <div className="flex items-center gap-4 border-b border-slate-100 px-4 py-6">
                <Download className="h-5 w-5 text-slate-500" />
                <span className="flex-1 text-sm text-slate-500">下载速度</span>
                <span className="text-lg font-bold text-slate-800">{networkUsage.download}</span>
              </div>
              <div className="flex items-center gap-4 px-4 py-6">
                <Upload className="h-5 w-5 text-slate-500" />
                <span className="flex-1 text-sm text-slate-500">上传速度</span>
                <span className="text-lg font-bold text-slate-800">{networkUsage.upload}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
