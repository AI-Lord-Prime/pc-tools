import { useEffect, useState } from 'react'
import { Folder, HeartPulse } from 'lucide-react'
import { invoke } from '@/lib/tauri'
import { progressColor, cn } from '@/lib/utils'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface DiskItem {
  name: string
  type: string
  total: string
  used: string
  free: string
  fileSystem: string
  usage: number
}

interface DiskHealthItem {
  name: string
  temperature: number
  health: number
  readSpeed: string
  writeSpeed: string
  powerOnHours: string
  powerCycle: number
}

function tempClass(temp: number) {
  if (temp < 50) return 'text-green-500'
  if (temp < 70) return 'text-amber-500'
  return 'text-red-500'
}

function healthVariant(health: number): 'success' | 'warning' | 'destructive' {
  if (health >= 90) return 'success'
  if (health >= 70) return 'warning'
  return 'destructive'
}

export default function DiskInfo() {
  const [diskList, setDiskList] = useState<DiskItem[]>([])
  const [diskHealth, setDiskHealth] = useState<DiskHealthItem[]>([])

  useEffect(() => {
    const fetchDiskInfo = async () => {
      try {
        const [disks, health] = await Promise.all([
          invoke<DiskItem[]>('get_disk_list'),
          invoke<DiskHealthItem[]>('get_disk_health'),
        ])
        setDiskList(disks)
        setDiskHealth(health)
      } catch (error) {
        console.error('获取磁盘信息失败:', error)
      }
    }
    fetchDiskInfo()
  }, [])

  return (
    <div>
      <PageHeader title="硬盘信息" subtitle="磁盘存储与健康状态" />

      <Card>
        <CardHeader>
          <CardHeaderTitle icon={<Folder className="h-4 w-4" />} iconClassName="bg-orange-500/10 text-orange-500" title="磁盘列表" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">磁盘名称</TableHead>
                <TableHead className="w-[100px]">类型</TableHead>
                <TableHead className="w-[120px]">总容量</TableHead>
                <TableHead className="w-[120px]">已使用</TableHead>
                <TableHead className="w-[120px]">可用空间</TableHead>
                <TableHead className="w-[100px]">文件系统</TableHead>
                <TableHead>使用率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diskList.map((disk) => (
                <TableRow key={disk.name}>
                  <TableCell>{disk.name}</TableCell>
                  <TableCell>
                    <Badge variant={disk.type === 'SSD' ? 'success' : 'info'}>{disk.type}</Badge>
                  </TableCell>
                  <TableCell>{disk.total}</TableCell>
                  <TableCell>{disk.used}</TableCell>
                  <TableCell>{disk.free}</TableCell>
                  <TableCell>{disk.fileSystem}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Progress value={disk.usage} className="h-2 flex-1" indicatorColor={progressColor(disk.usage)} />
                      <span className="whitespace-nowrap text-[13px] font-semibold">{disk.usage}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardHeaderTitle icon={<HeartPulse className="h-4 w-4" />} iconClassName="bg-green-500/10 text-green-500" title="磁盘健康状态" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">磁盘</TableHead>
                <TableHead className="w-[100px]">温度</TableHead>
                <TableHead className="w-[100px]">健康度</TableHead>
                <TableHead className="w-[120px]">读取速度</TableHead>
                <TableHead className="w-[120px]">写入速度</TableHead>
                <TableHead className="w-[120px]">通电时间</TableHead>
                <TableHead>通电次数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diskHealth.map((item) => (
                <TableRow key={item.name}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <span className={cn(tempClass(item.temperature))}>{item.temperature}°C</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={healthVariant(item.health)}>{item.health}%</Badge>
                  </TableCell>
                  <TableCell>{item.readSpeed}</TableCell>
                  <TableCell>{item.writeSpeed}</TableCell>
                  <TableCell>{item.powerOnHours}</TableCell>
                  <TableCell>{item.powerCycle}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
