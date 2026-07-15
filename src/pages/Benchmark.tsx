import { useState } from 'react'
import { Cpu, Monitor, Folder, TrendingUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { invoke } from '@/lib/tauri'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface BenchmarkResult {
  name: string
  score: number
  detail: string
  time: string
}

type BenchScore = { score: number; detail: string }

export default function Benchmark() {
  const [cpuRunning, setCpuRunning] = useState(false)
  const [gpuRunning, setGpuRunning] = useState(false)
  const [diskRunning, setDiskRunning] = useState(false)
  const [cpuScore, setCpuScore] = useState(0)
  const [gpuScore, setGpuScore] = useState(0)
  const [diskScore, setDiskScore] = useState(0)
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([])

  const runBench = async (
    cmd: string,
    name: string,
    setRunning: (v: boolean) => void,
    setScore: (v: number) => void
  ) => {
    setRunning(true)
    try {
      const result = await invoke<BenchScore>(cmd)
      setScore(result.score)
      setBenchmarkResults((prev) => [
        {
          name,
          score: result.score,
          detail: result.detail,
          time: new Date().toLocaleString(),
        },
        ...prev,
      ])
      toast.success('测试完成')
    } catch (error) {
      toast.error('测试失败: ' + error)
    } finally {
      setRunning(false)
    }
  }

  const benches = [
    {
      title: 'CPU 性能测试',
      icon: Cpu,
      score: cpuScore,
      running: cpuRunning,
      onClick: () => runBench('run_cpu_benchmark', 'CPU 性能测试', setCpuRunning, setCpuScore),
    },
    {
      title: 'GPU 性能测试',
      icon: Monitor,
      score: gpuScore,
      running: gpuRunning,
      onClick: () => runBench('run_gpu_benchmark', 'GPU 性能测试', setGpuRunning, setGpuScore),
    },
    {
      title: '磁盘性能测试',
      icon: Folder,
      score: diskScore,
      running: diskRunning,
      onClick: () => runBench('run_disk_benchmark', '磁盘性能测试', setDiskRunning, setDiskScore),
    },
  ]

  return (
    <div>
      <PageHeader title="性能测试" subtitle="CPU / GPU / 磁盘性能跑分" />

      <div className="grid grid-cols-3 gap-4">
        {benches.map((bench) => {
          const Icon = bench.icon
          return (
            <Card key={bench.title} className="transition-all hover:-translate-y-0.5">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center gap-3 p-5">
                  <Icon className="h-11 w-11 text-blue-500" />
                  <span className="text-[15px] font-semibold text-slate-800">{bench.title}</span>
                  <Button onClick={bench.onClick} disabled={bench.running}>
                    {bench.running && <Loader2 className="animate-spin" />}
                    开始测试
                  </Button>
                  {bench.score > 0 && (
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-500">得分:</span>
                      <span className="text-2xl font-bold text-green-500">{bench.score}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardHeaderTitle icon={<TrendingUp className="h-4 w-4" />} iconClassName="bg-blue-500/10 text-blue-500" title="测试结果" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">测试项目</TableHead>
                <TableHead className="w-[150px]">得分</TableHead>
                <TableHead>详细信息</TableHead>
                <TableHead className="w-[180px]">测试时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benchmarkResults.map((item, index) => (
                <TableRow key={`${item.name}-${item.time}-${index}`}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.score}</TableCell>
                  <TableCell>{item.detail}</TableCell>
                  <TableCell>{item.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
