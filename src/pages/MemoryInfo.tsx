import { useCallback, useEffect, useState } from 'react'
import { MemoryStick, TrendingUp, List } from 'lucide-react'
import { invoke } from '@/lib/tauri'
import { useInterval } from '@/hooks/use-interval'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Descriptions } from '@/components/descriptions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface MemoryDetailedInfo {
  total: string
  available: string
  used: string
  usagePercent: number
  type: string
  frequency: string
  slots: number
  usedSlots: number
}

interface MemoryModule {
  slot: string
  manufacturer: string
  model: string
  size: string
  type: string
  speed: string
}

const defaultInfo: MemoryDetailedInfo = {
  total: '0 GB',
  available: '0 GB',
  used: '0 GB',
  usagePercent: 0,
  type: '加载中...',
  frequency: '0 MHz',
  slots: 0,
  usedSlots: 0,
}

function memColor(p: number) {
  if (p < 50) return '#a855f7'
  if (p < 80) return '#f59e0b'
  return '#ef4444'
}

export default function MemoryInfo() {
  const [memoryInfo, setMemoryInfo] = useState<MemoryDetailedInfo>(defaultInfo)
  const [memoryModules, setMemoryModules] = useState<MemoryModule[]>([])

  const fetchMemoryInfo = useCallback(async () => {
    try {
      const [info, modules] = await Promise.all([
        invoke<MemoryDetailedInfo>('get_memory_detailed_info'),
        invoke<MemoryModule[]>('get_memory_modules'),
      ])
      setMemoryInfo(info)
      setMemoryModules(modules)
    } catch (error) {
      console.error('获取内存信息失败:', error)
    }
  }, [])

  useEffect(() => {
    fetchMemoryInfo()
  }, [fetchMemoryInfo])

  useInterval(fetchMemoryInfo, 2000)

  return (
    <div>
      <PageHeader title="内存信息" subtitle="内存详情与使用情况" />

      <Card>
        <CardHeader>
          <CardHeaderTitle icon={<MemoryStick className="h-4 w-4" />} iconClassName="bg-purple-500/10 text-purple-500" title="内存详情" />
        </CardHeader>
        <CardContent>
          <Descriptions
            items={[
              { label: '总容量', value: memoryInfo.total },
              { label: '可用容量', value: memoryInfo.available },
              { label: '已使用', value: memoryInfo.used },
              { label: '使用率', value: `${memoryInfo.usagePercent}%` },
              { label: '内存类型', value: memoryInfo.type },
              { label: '内存频率', value: memoryInfo.frequency },
              { label: '内存插槽数', value: memoryInfo.slots },
              { label: '已使用插槽', value: memoryInfo.usedSlots },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardHeaderTitle icon={<TrendingUp className="h-4 w-4" />} iconClassName="bg-blue-500/10 text-blue-500" title="内存使用情况" />
        </CardHeader>
        <CardContent>
          <div className="p-4">
            <div className="mb-2.5 flex justify-between text-slate-500">
              <span>内存使用率</span>
              <span className="font-bold text-purple-500">{memoryInfo.usagePercent}%</span>
            </div>
            <Progress value={memoryInfo.usagePercent} className="h-[18px]" indicatorColor={memColor(memoryInfo.usagePercent)} />
            <div className="mt-3 flex justify-between text-[13px] text-slate-500">
              <span>已使用: {memoryInfo.used}</span>
              <span>可用: {memoryInfo.available}</span>
              <span>总计: {memoryInfo.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardHeaderTitle icon={<List className="h-4 w-4" />} iconClassName="bg-orange-500/10 text-orange-500" title="内存条详情" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">插槽</TableHead>
                <TableHead className="w-[150px]">制造商</TableHead>
                <TableHead>型号</TableHead>
                <TableHead className="w-[100px]">容量</TableHead>
                <TableHead className="w-[100px]">类型</TableHead>
                <TableHead className="w-[120px]">频率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memoryModules.map((m) => (
                <TableRow key={m.slot}>
                  <TableCell>{m.slot}</TableCell>
                  <TableCell>{m.manufacturer}</TableCell>
                  <TableCell>{m.model}</TableCell>
                  <TableCell>{m.size}</TableCell>
                  <TableCell>{m.type}</TableCell>
                  <TableCell>{m.speed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
