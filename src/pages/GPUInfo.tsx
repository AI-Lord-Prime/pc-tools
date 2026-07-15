import { useCallback, useEffect, useState } from 'react'
import { Monitor, TrendingUp } from 'lucide-react'
import { invoke } from '@/lib/tauri'
import { formatNumber, progressColor, tempColor, toNumber } from '@/lib/utils'
import { useInterval } from '@/hooks/use-interval'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Descriptions } from '@/components/descriptions'
import { CircularProgress } from '@/components/circular-progress'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface GpuDetailedInfo {
  name: string
  vendor: string
  memory: string
  memoryType: string
  driverVersion: string
  coreFrequency: string
  memoryFrequency: string
  temperature: number
  usage: number
  memoryUsage: number
}

const defaultInfo: GpuDetailedInfo = {
  name: '加载中...',
  vendor: '加载中...',
  memory: '0 GB',
  memoryType: '加载中...',
  driverVersion: '加载中...',
  coreFrequency: '0 MHz',
  memoryFrequency: '0 MHz',
  temperature: 0,
  usage: 0,
  memoryUsage: 0,
}

export default function GPUInfo() {
  const [gpuInfo, setGpuInfo] = useState<GpuDetailedInfo>(defaultInfo)

  const fetchGpuInfo = useCallback(async () => {
    try {
      const info = await invoke<Partial<GpuDetailedInfo>>('get_gpu_detailed_info')
      setGpuInfo({
        ...defaultInfo,
        ...info,
        temperature: Number(info.temperature) || 0,
        usage: Number(info.usage) || 0,
        memoryUsage: Number(info.memoryUsage) || 0,
      })
    } catch (error) {
      console.error('获取GPU信息失败:', error)
    }
  }, [])

  useEffect(() => {
    fetchGpuInfo()
  }, [fetchGpuInfo])

  useInterval(fetchGpuInfo, 2000)

  return (
    <div>
      <PageHeader title="显卡信息" subtitle="GPU 详情与实时监控" />

      <Card>
        <CardHeader>
          <CardHeaderTitle icon={<Monitor className="h-4 w-4" />} iconClassName="bg-green-500/10 text-green-500" title="显卡详情" />
        </CardHeader>
        <CardContent>
          <Descriptions
            items={[
              { label: '显卡名称', value: gpuInfo.name },
              { label: '制造商', value: gpuInfo.vendor },
              { label: '显存大小', value: gpuInfo.memory },
              { label: '显存类型', value: gpuInfo.memoryType },
              { label: '驱动版本', value: gpuInfo.driverVersion },
              { label: 'GPU 核心频率', value: gpuInfo.coreFrequency },
              { label: '显存频率', value: gpuInfo.memoryFrequency },
              { label: '当前温度', value: `${gpuInfo.temperature}°C` },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardHeaderTitle icon={<TrendingUp className="h-4 w-4" />} iconClassName="bg-blue-500/10 text-blue-500" title="实时监控" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-5">
            <div className="flex flex-col items-center gap-4 py-3">
              <span className="text-[13px] font-semibold tracking-wide text-slate-500">GPU 使用率</span>
              <CircularProgress value={toNumber(gpuInfo.usage)} color={progressColor(toNumber(gpuInfo.usage))} label={`${formatNumber(gpuInfo.usage)}%`} />
            </div>
            <div className="flex flex-col items-center gap-4 py-3">
              <span className="text-[13px] font-semibold tracking-wide text-slate-500">显存使用率</span>
              <CircularProgress value={toNumber(gpuInfo.memoryUsage)} color={progressColor(toNumber(gpuInfo.memoryUsage))} label={`${formatNumber(gpuInfo.memoryUsage)}%`} />
            </div>
            <div className="flex flex-col items-center gap-4 py-3">
              <span className="text-[13px] font-semibold tracking-wide text-slate-500">GPU 温度</span>
              <CircularProgress value={toNumber(gpuInfo.temperature)} color={tempColor(toNumber(gpuInfo.temperature))} label={`${formatNumber(gpuInfo.temperature)}°C`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
