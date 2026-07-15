import { useCallback, useEffect, useState } from 'react'
import { Cpu, Monitor, Folder, TrendingUp } from 'lucide-react'
import { invoke } from '@/lib/tauri'
import { cn } from '@/lib/utils'
import { useInterval } from '@/hooks/use-interval'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface Temperatures {
  cpu: number
  gpu: number
  disk: number
}

interface TempHistoryItem {
  time: string
  cpu: number
  gpu: number
  disk: number
}

function isTempAvailable(temp: number) {
  return temp > 0
}

function formatTemp(temp: number) {
  return isTempAvailable(temp) ? temp.toFixed(2) : 'N/A'
}

function tempClass(temp: number) {
  if (temp <= 0) return 'text-slate-400'
  if (temp < 60) return 'text-green-500'
  if (temp < 80) return 'text-amber-500'
  return 'text-red-500'
}

export default function Temperature() {
  const [temperatures, setTemperatures] = useState<Temperatures>({ cpu: 0, gpu: 0, disk: 0 })
  const [tempHistory, setTempHistory] = useState<TempHistoryItem[]>([])

  const fetchTemperatures = useCallback(async () => {
    try {
      const temps = await invoke<Temperatures>('get_temperatures')
      setTemperatures(temps)
      const now = new Date()
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      setTempHistory((prev) => [{ time: timeStr, ...temps }, ...prev].slice(0, 20))
    } catch (error) {
      console.error('获取温度信息失败:', error)
    }
  }, [])

  useEffect(() => {
    fetchTemperatures()
  }, [fetchTemperatures])

  useInterval(fetchTemperatures, 2000)

  const cards = [
    { key: 'cpu' as const, label: 'CPU 温度', icon: Cpu, wrap: 'bg-blue-500/10 text-blue-500' },
    { key: 'gpu' as const, label: 'GPU 温度', icon: Monitor, wrap: 'bg-green-500/10 text-green-500' },
    { key: 'disk' as const, label: '硬盘温度', icon: Folder, wrap: 'bg-orange-500/10 text-orange-500' },
  ]

  return (
    <div>
      <PageHeader title="温度监控" subtitle="硬件温度实时监测" />

      <div className="grid grid-cols-3 gap-4">
        {cards.map(({ key, label, icon: Icon, wrap }) => (
          <Card key={key}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-4 p-4">
                <div className={cn('flex h-14 w-14 items-center justify-center rounded-[14px]', wrap)}>
                  <Icon className="h-7 w-7" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold tracking-wide text-slate-500">{label}</span>
                  <span className={cn('text-[28px] font-bold leading-tight', tempClass(temperatures[key]))}>
                    {formatTemp(temperatures[key])}
                    {isTempAvailable(temperatures[key]) && <span className="ml-0.5 text-base font-medium">°C</span>}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardHeaderTitle icon={<TrendingUp className="h-4 w-4" />} iconClassName="bg-blue-500/10 text-blue-500" title="温度历史记录" />
        </CardHeader>
        <CardContent>
          <div className="max-h-[300px] overflow-y-auto">
            {tempHistory.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400">等待数据采集...</div>
            ) : (
              tempHistory.map((item, index) => (
                <div key={index} className="flex justify-between border-b border-slate-100 px-3 py-2.5 text-[13px] last:border-0">
                  <span className="w-20 text-slate-500">{item.time}</span>
                  <span className="text-blue-500">CPU: {formatTemp(item.cpu)}</span>
                  <span className="text-green-500">GPU: {formatTemp(item.gpu)}</span>
                  <span className="text-orange-500">Disk: {formatTemp(item.disk)}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
