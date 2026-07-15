import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { invoke } from '@/lib/tauri'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface StartupItem {
  name: string
  publisher: string
  path: string
  enabled: boolean
}

export default function Startup() {
  const [startupItems, setStartupItems] = useState<StartupItem[]>([])

  const refreshList = async (showToast = true) => {
    try {
      const items = await invoke<StartupItem[]>('get_startup_items')
      setStartupItems(items)
      if (showToast) toast.success('刷新成功')
    } catch (error) {
      toast.error('获取启动项失败: ' + error)
    }
  }

  const toggleStartup = async (item: StartupItem, enabled: boolean) => {
    setStartupItems((prev) => prev.map((i) => (i.name === item.name ? { ...i, enabled } : i)))
    try {
      await invoke('toggle_startup', { name: item.name, enabled })
      toast.success(enabled ? '已启用' : '已禁用')
    } catch (error) {
      setStartupItems((prev) => prev.map((i) => (i.name === item.name ? { ...i, enabled: !enabled } : i)))
      toast.error('操作失败: ' + error)
    }
  }

  const deleteStartup = async (item: StartupItem) => {
    try {
      await invoke('delete_startup', { name: item.name })
      setStartupItems((prev) => prev.filter((i) => i.name !== item.name))
      toast.success('删除成功')
    } catch (error) {
      toast.error('删除失败: ' + error)
    }
  }

  useEffect(() => {
    refreshList(false)
  }, [])

  return (
    <div>
      <PageHeader title="启动项管理" subtitle="开机启动项管理" />

      <Card>
        <CardHeader>
          <CardHeaderTitle
            icon={<Star className="h-4 w-4" />}
            iconClassName="bg-amber-500/10 text-amber-500"
            title="启动项列表"
            action={
              <Button size="sm" onClick={() => refreshList(true)}>
                刷新
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">名称</TableHead>
                <TableHead className="w-[150px]">发布者</TableHead>
                <TableHead>路径</TableHead>
                <TableHead className="w-[100px]">状态</TableHead>
                <TableHead className="w-[150px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {startupItems.map((item) => (
                <TableRow key={item.name}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.publisher}</TableCell>
                  <TableCell>{item.path}</TableCell>
                  <TableCell>
                    <Switch checked={item.enabled} onCheckedChange={(v) => toggleStartup(item, v)} />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => deleteStartup(item)}>
                      删除
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
