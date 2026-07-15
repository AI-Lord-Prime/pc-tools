import { useEffect, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import { invoke } from '@/lib/tauri'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface DriverItem {
  name: string
  version: string
  date: string
  publisher: string
  status: string
}

export default function Driver() {
  const [driverList, setDriverList] = useState<DriverItem[]>([])

  const scanDrivers = async (showToast = true) => {
    try {
      const drivers = await invoke<DriverItem[]>('scan_drivers')
      setDriverList(drivers)
      if (showToast) toast.success('扫描完成')
    } catch (error) {
      toast.error('扫描失败: ' + error)
    }
  }

  const updateDriver = async (driver: DriverItem) => {
    try {
      await invoke('update_driver', { name: driver.name })
      toast.success('驱动更新已开始')
    } catch (error) {
      toast.error('更新失败: ' + error)
    }
  }

  useEffect(() => {
    scanDrivers(false)
  }, [])

  return (
    <div>
      <PageHeader title="驱动管理" subtitle="系统驱动扫描与更新" />

      <Card>
        <CardHeader>
          <CardHeaderTitle
            icon={<Settings2 className="h-4 w-4" />}
            iconClassName="bg-blue-500/10 text-blue-500"
            title="驱动列表"
            action={
              <Button size="sm" onClick={() => scanDrivers(true)}>
                扫描驱动
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">驱动名称</TableHead>
                <TableHead className="w-[150px]">版本</TableHead>
                <TableHead className="w-[120px]">日期</TableHead>
                <TableHead className="w-[150px]">发布者</TableHead>
                <TableHead className="w-[100px]">状态</TableHead>
                <TableHead className="w-[150px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driverList.map((driver) => (
                <TableRow key={driver.name}>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver.version}</TableCell>
                  <TableCell>{driver.date}</TableCell>
                  <TableCell>{driver.publisher}</TableCell>
                  <TableCell>
                    <Badge variant={driver.status === '正常' ? 'success' : 'warning'}>{driver.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => updateDriver(driver)}>
                      更新
                    </Button>
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
