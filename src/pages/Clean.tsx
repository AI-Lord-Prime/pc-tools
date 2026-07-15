import { useState } from 'react'
import { Trash2, FileX, ScrollText, Trash, Globe, Sparkles, List } from 'lucide-react'
import { toast } from 'sonner'
import { invoke } from '@/lib/tauri'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ScanResult {
  name: string
  path: string
  size: string
  count: number
}

type ScanResponse = { size: string; items: ScanResult[] }

export default function Clean() {
  const [cacheSize, setCacheSize] = useState('0 MB')
  const [tempSize, setTempSize] = useState('0 MB')
  const [logsSize, setLogsSize] = useState('0 MB')
  const [recycleSize, setRecycleSize] = useState('0 MB')
  const [browserSize, setBrowserSize] = useState('0 MB')
  const [totalSize, setTotalSize] = useState('0 MB')
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const runScan = async (
    cmd: string,
    setSize: (s: string) => void
  ) => {
    try {
      const result = await invoke<ScanResponse>(cmd)
      setSize(result.size)
      setScanResults(result.items)
      setSelected(new Set())
      toast.success('扫描完成')
    } catch (error) {
      toast.error('扫描失败: ' + error)
    }
  }

  const tiles = [
    { title: '系统缓存', size: cacheSize, icon: Trash2, action: () => runScan('scan_cache', setCacheSize), btn: '扫描' },
    { title: '临时文件', size: tempSize, icon: FileX, action: () => runScan('scan_temp', setTempSize), btn: '扫描' },
    { title: '系统日志', size: logsSize, icon: ScrollText, action: () => runScan('scan_logs', setLogsSize), btn: '扫描' },
    { title: '回收站', size: recycleSize, icon: Trash, action: () => runScan('scan_recycle', setRecycleSize), btn: '清空' },
    { title: '浏览器缓存', size: browserSize, icon: Globe, action: () => runScan('scan_browser', setBrowserSize), btn: '扫描' },
    { title: '一键清理', size: totalSize, icon: Sparkles, action: () => runScan('scan_all', setTotalSize), btn: '全部清理', success: true },
  ]

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(scanResults.map((_, i) => i)) : new Set())
  }

  const toggleOne = (index: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(index)
      else next.delete(index)
      return next
    })
  }

  return (
    <div>
      <PageHeader title="系统清理" subtitle="垃圾文件扫描与清理" />

      <div className="grid grid-cols-3 gap-4">
        {tiles.map((tile) => {
          const Icon = tile.icon
          return (
            <Card key={tile.title} className="cursor-pointer transition-all hover:-translate-y-0.5" onClick={tile.action}>
              <CardContent className="pt-5">
                <div className="flex flex-col items-center gap-3 p-5">
                  <Icon className="h-11 w-11 text-blue-500" />
                  <span className="text-[15px] font-semibold text-slate-800">{tile.title}</span>
                  <span className="text-sm font-bold text-amber-500">{tile.size}</span>
                  <Button size="sm" variant={tile.success ? 'success' : 'default'} onClick={(e) => { e.stopPropagation(); tile.action() }}>
                    {tile.btn}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardHeaderTitle
            icon={<List className="h-4 w-4" />}
            iconClassName="bg-slate-100 text-slate-600"
            title="扫描结果"
            action={
              <Button size="sm" variant="destructive">
                清理选中项
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[55px]">
                  <Checkbox
                    checked={scanResults.length > 0 && selected.size === scanResults.length}
                    onCheckedChange={(v) => toggleAll(!!v)}
                  />
                </TableHead>
                <TableHead>项目名称</TableHead>
                <TableHead>路径</TableHead>
                <TableHead className="w-[120px]">大小</TableHead>
                <TableHead className="w-[100px]">文件数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scanResults.map((item, index) => (
                <TableRow key={`${item.path}-${index}`}>
                  <TableCell>
                    <Checkbox checked={selected.has(index)} onCheckedChange={(v) => toggleOne(index, !!v)} />
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.path}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
