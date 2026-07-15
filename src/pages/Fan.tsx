import { useCallback, useEffect, useState } from 'react'
import { Fan as FanIcon } from 'lucide-react'
import { invoke } from '@/lib/tauri'
import { useInterval } from '@/hooks/use-interval'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface FanInfo {
  name: string
  speed: number
  maxSpeed: number
  mode: string
}

function getFanPercentage(speed: number, maxSpeed: number) {
  if (!maxSpeed) return 0
  return Math.round((speed / maxSpeed) * 100)
}

function getFanColor(speed: number, maxSpeed: number) {
  const percentage = maxSpeed ? (speed / maxSpeed) * 100 : 0
  if (percentage < 30) return '#22c55e'
  if (percentage < 70) return '#f59e0b'
  return '#ef4444'
}

export default function Fan() {
  const [fanList, setFanList] = useState<FanInfo[]>([])

  const fetchFanInfo = useCallback(async () => {
    try {
      const fans = await invoke<FanInfo[]>('get_fan_info')
      setFanList(fans)
    } catch (error) {
      console.error('获取风扇信息失败:', error)
    }
  }, [])

  useEffect(() => {
    fetchFanInfo()
  }, [fetchFanInfo])

  useInterval(fetchFanInfo, 2000)

  return (
    <div>
      <PageHeader title="风扇转速" subtitle="风扇运行状态监控" />

      <Card>
        <CardHeader>
          <CardHeaderTitle icon={<FanIcon className="h-4 w-4" />} iconClassName="bg-cyan-500/10 text-cyan-500" title="风扇状态" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">风扇名称</TableHead>
                <TableHead className="w-[150px]">当前转速</TableHead>
                <TableHead>转速状态</TableHead>
                <TableHead className="w-[120px]">控制模式</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fanList.map((fan) => (
                <TableRow key={fan.name}>
                  <TableCell>{fan.name}</TableCell>
                  <TableCell>
                    <span className="font-bold text-blue-500">{fan.speed} RPM</span>
                  </TableCell>
                  <TableCell>
                    <Progress
                      value={getFanPercentage(fan.speed, fan.maxSpeed)}
                      className="h-2"
                      indicatorColor={getFanColor(fan.speed, fan.maxSpeed)}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={fan.mode === 'Auto' ? 'success' : 'info'}>{fan.mode}</Badge>
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
