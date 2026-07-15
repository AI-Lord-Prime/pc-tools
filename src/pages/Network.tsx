import { useCallback, useEffect, useState } from 'react'
import { Network as NetworkIcon, Send, Gauge, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { invoke } from '@/lib/tauri'
import { useInterval } from '@/hooks/use-interval'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Descriptions } from '@/components/descriptions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NetworkInfo {
  ip: string
  subnet: string
  gateway: string
  dns: string
  mac: string
}

interface NetworkSpeed {
  download: string
  upload: string
}

export default function Network() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    ip: '加载中...',
    subnet: '加载中...',
    gateway: '加载中...',
    dns: '加载中...',
    mac: '加载中...',
  })
  const [networkSpeed, setNetworkSpeed] = useState<NetworkSpeed>({ download: '0 KB/s', upload: '0 KB/s' })
  const [pingHost, setPingHost] = useState('')
  const [pingResult, setPingResult] = useState('')

  const fetchNetworkInfo = useCallback(async () => {
    try {
      const info = await invoke<NetworkInfo>('get_network_info')
      setNetworkInfo(info)
    } catch (error) {
      console.error('获取网络信息失败:', error)
    }
  }, [])

  const fetchNetworkSpeed = useCallback(async () => {
    try {
      const speed = await invoke<NetworkSpeed>('get_network_speed')
      setNetworkSpeed(speed)
    } catch (error) {
      console.error('获取网速失败:', error)
    }
  }, [])

  const runPing = async () => {
    if (!pingHost) {
      toast.warning('请输入主机地址')
      return
    }
    try {
      setPingResult('正在测试...')
      const result = await invoke<string>('run_ping', { host: pingHost })
      setPingResult(result)
    } catch (error) {
      setPingResult('测试失败: ' + error)
    }
  }

  useEffect(() => {
    fetchNetworkInfo()
    fetchNetworkSpeed()
  }, [fetchNetworkInfo, fetchNetworkSpeed])

  useInterval(fetchNetworkSpeed, 1000)

  return (
    <div>
      <PageHeader title="网络工具" subtitle="网络信息与测速" />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardHeaderTitle icon={<NetworkIcon className="h-4 w-4" />} iconClassName="bg-blue-500/10 text-blue-500" title="网络信息" />
          </CardHeader>
          <CardContent>
            <Descriptions
              columns={1}
              items={[
                { label: 'IP 地址', value: networkInfo.ip },
                { label: '子网掩码', value: networkInfo.subnet },
                { label: '默认网关', value: networkInfo.gateway },
                { label: 'DNS 服务器', value: networkInfo.dns },
                { label: 'MAC 地址', value: networkInfo.mac },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardHeaderTitle icon={<Send className="h-4 w-4" />} iconClassName="bg-green-500/10 text-green-500" title="网络测试" />
          </CardHeader>
          <CardContent>
            <div className="p-5">
              <div className="mb-5 flex gap-2.5">
                <Input
                  value={pingHost}
                  onChange={(e) => setPingHost(e.target.value)}
                  placeholder="输入主机地址"
                  className="w-[200px]"
                />
                <Button onClick={runPing}>Ping</Button>
              </div>
              <div className="max-h-[200px] overflow-y-auto rounded-lg bg-slate-50 p-4">
                <pre className="m-0 whitespace-pre-wrap font-mono text-green-500">{pingResult}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardHeaderTitle icon={<Gauge className="h-4 w-4" />} iconClassName="bg-orange-500/10 text-orange-500" title="实时网速" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-10">
            <div className="flex items-center gap-5 p-5">
              <Download className="h-11 w-11 text-green-500" />
              <div className="flex flex-col gap-1">
                <span className="text-sm text-slate-500">下载速度</span>
                <span className="text-2xl font-bold text-slate-800">{networkSpeed.download}</span>
              </div>
            </div>
            <div className="flex items-center gap-5 p-5">
              <Upload className="h-11 w-11 text-blue-500" />
              <div className="flex flex-col gap-1">
                <span className="text-sm text-slate-500">上传速度</span>
                <span className="text-2xl font-bold text-slate-800">{networkSpeed.upload}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
