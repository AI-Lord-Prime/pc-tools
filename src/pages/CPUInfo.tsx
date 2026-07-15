import { useCallback, useEffect, useState } from 'react'
import { Cpu, TrendingUp } from 'lucide-react'
import { invoke } from '@/lib/tauri'
import { formatNumber, progressColor, tempColor } from '@/lib/utils'
import { useInterval } from '@/hooks/use-interval'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Descriptions } from '@/components/descriptions'
import { CircularProgress } from '@/components/circular-progress'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface CpuDetailedInfo {
  name: string
  vendor: string
  cores: number
  threads: number
  baseFrequency: string
  currentFrequency: string
  l1Cache: string
  l2Cache: string
  l3Cache: string
  architecture: string
  usage: number
  temperature: number
}

const defaultInfo: CpuDetailedInfo = {
  name: '加载中...',
  vendor: '加载中...',
  cores: 0,
  threads: 0,
  baseFrequency: '0 GHz',
  currentFrequency: '0 GHz',
  l1Cache: '0 KB',
  l2Cache: '0 KB',
  l3Cache: '0 KB',
  architecture: '加载中...',
  usage: 0,
  temperature: 0,
}

export default function CPUInfo() {
  const [cpuInfo, setCpuInfo] = useState<CpuDetailedInfo>(defaultInfo)

  const fetchCpuInfo = useCallback(async () => {
    try {
      const info = await invoke<CpuDetailedInfo>('get_cpu_detailed_info')
      setCpuInfo({
        ...info,
        usage: parseFloat(info.usage.toFixed(2)),
        temperature: parseFloat(info.temperature.toFixed(2)),
      })
    } catch (error) {
      console.error('获取CPU信息失败:', error)
    }
  }, [])

  useEffect(() => {
    fetchCpuInfo()
  }, [fetchCpuInfo])

  useInterval(fetchCpuInfo, 2000)

  return (
    <div>
      <PageHeader title="CPU 信息" subtitle="处理器详情与实时监控" />

      <Card>
        <CardHeader>
          <CardHeaderTitle icon={<Cpu className="h-4 w-4" />} iconClassName="bg-blue-500/10 text-blue-500" title="处理器信息" />
        </CardHeader>
        <CardContent>
          <Descriptions
            items={[
              { label: '处理器名称', value: cpuInfo.name },
              { label: '制造商', value: cpuInfo.vendor },
              { label: '核心数', value: cpuInfo.cores },
              { label: '线程数', value: cpuInfo.threads },
              { label: '基础频率', value: cpuInfo.baseFrequency },
              { label: '当前频率', value: cpuInfo.currentFrequency },
              { label: '缓存 L1', value: cpuInfo.l1Cache },
              { label: '缓存 L2', value: cpuInfo.l2Cache },
              { label: '缓存 L3', value: cpuInfo.l3Cache },
              { label: '架构', value: cpuInfo.architecture },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardHeaderTitle icon={<TrendingUp className="h-4 w-4" />} iconClassName="bg-purple-500/10 text-purple-500" title="实时监控" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col items-center gap-4 py-3">
              <span className="text-[13px] font-semibold tracking-wide text-slate-500">CPU 使用率</span>
              <CircularProgress value={cpuInfo.usage} color={progressColor(cpuInfo.usage)} label={`${formatNumber(cpuInfo.usage)}%`} />
            </div>
            <div className="flex flex-col items-center gap-4 py-3">
              <span className="text-[13px] font-semibold tracking-wide text-slate-500">CPU 温度</span>
              <CircularProgress value={cpuInfo.temperature} color={tempColor(cpuInfo.temperature)} label={`${formatNumber(cpuInfo.temperature)}°C`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
