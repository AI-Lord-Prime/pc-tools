import { useEffect, useState } from 'react'
import { LayoutGrid, FileText } from 'lucide-react'
import { invoke } from '@/lib/tauri'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Descriptions } from '@/components/descriptions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface MotherboardData {
  model: string
  manufacturer: string
  chipset: string
  biosVersion: string
  biosDate: string
  serialNumber: string
}

interface BiosInfo {
  vendor: string
  version: string
  date: string
  size: string
}

export default function MotherboardInfo() {
  const [motherboardInfo, setMotherboardInfo] = useState<MotherboardData>({
    model: '加载中...',
    manufacturer: '加载中...',
    chipset: '加载中...',
    biosVersion: '加载中...',
    biosDate: '加载中...',
    serialNumber: '加载中...',
  })
  const [biosInfo, setBiosInfo] = useState<BiosInfo>({
    vendor: '加载中...',
    version: '加载中...',
    date: '加载中...',
    size: '加载中...',
  })

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const [mb, bios] = await Promise.all([
          invoke<MotherboardData>('get_motherboard_info'),
          invoke<BiosInfo>('get_bios_info'),
        ])
        setMotherboardInfo(mb)
        setBiosInfo(bios)
      } catch (error) {
        console.error('获取主板信息失败:', error)
      }
    }
    fetchInfo()
  }, [])

  return (
    <div>
      <PageHeader title="主板信息" subtitle="主板与 BIOS 详情" />

      <Card>
        <CardHeader>
          <CardHeaderTitle icon={<LayoutGrid className="h-4 w-4" />} iconClassName="bg-blue-500/10 text-blue-500" title="主板详情" />
        </CardHeader>
        <CardContent>
          <Descriptions
            items={[
              { label: '主板型号', value: motherboardInfo.model },
              { label: '制造商', value: motherboardInfo.manufacturer },
              { label: '芯片组', value: motherboardInfo.chipset },
              { label: 'BIOS 版本', value: motherboardInfo.biosVersion },
              { label: 'BIOS 日期', value: motherboardInfo.biosDate },
              { label: '主板序列号', value: motherboardInfo.serialNumber },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardHeaderTitle icon={<FileText className="h-4 w-4" />} iconClassName="bg-orange-500/10 text-orange-500" title="BIOS 信息" />
        </CardHeader>
        <CardContent>
          <Descriptions
            items={[
              { label: 'BIOS 厂商', value: biosInfo.vendor },
              { label: 'BIOS 版本', value: biosInfo.version },
              { label: '发布日期', value: biosInfo.date },
              { label: 'BIOS 大小', value: biosInfo.size },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
