import { useEffect, useState } from 'react'
import { Settings as SettingsIcon, Bell, Info } from 'lucide-react'
import { toast } from 'sonner'
import { invoke } from '@/lib/tauri'
import { PageHeader, CardHeaderTitle } from '@/components/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'

interface AppSettings {
  autoStart: boolean
  minimizeToTray: boolean
  closeAction: string
  refreshRate: number
  tempWarning: boolean
  tempThreshold: number
}

const defaultSettings: AppSettings = {
  autoStart: false,
  minimizeToTray: true,
  closeAction: 'minimize',
  refreshRate: 2000,
  tempWarning: true,
  tempThreshold: 80,
}

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  const loadSettings = async () => {
    try {
      const saved = await invoke<AppSettings>('get_settings')
      if (saved) setSettings(saved)
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  const saveSettings = async (next: AppSettings) => {
    setSettings(next)
    try {
      await invoke('save_settings', { settings: next })
      toast.success('设置已保存')
    } catch (error) {
      toast.error('保存设置失败: ' + error)
    }
  }

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    saveSettings({ ...settings, [key]: value })
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <div>
      <PageHeader title="设置" subtitle="应用偏好与通知" />

      <Card>
        <CardHeader>
          <CardHeaderTitle icon={<SettingsIcon className="h-4 w-4" />} iconClassName="bg-blue-500/10 text-blue-500" title="常规设置" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Label className="w-[120px]">开机自启</Label>
            <Switch checked={settings.autoStart} onCheckedChange={(v) => update('autoStart', v)} />
          </div>
          <div className="flex items-center gap-4">
            <Label className="w-[120px]">最小化到托盘</Label>
            <Switch checked={settings.minimizeToTray} onCheckedChange={(v) => update('minimizeToTray', v)} />
          </div>
          <div className="flex items-center gap-4">
            <Label className="w-[120px]">关闭时</Label>
            <RadioGroup
              value={settings.closeAction}
              onValueChange={(v) => update('closeAction', v)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="minimize" id="minimize" />
                <Label htmlFor="minimize">最小化</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="exit" id="exit" />
                <Label htmlFor="exit">退出</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex items-center gap-4">
            <Label className="w-[120px]">刷新频率</Label>
            <Select
              value={String(settings.refreshRate)}
              onValueChange={(v) => update('refreshRate', Number(v))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1000">1 秒</SelectItem>
                <SelectItem value="2000">2 秒</SelectItem>
                <SelectItem value="5000">5 秒</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardHeaderTitle icon={<Bell className="h-4 w-4" />} iconClassName="bg-red-500/10 text-red-500" title="通知设置" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Label className="w-[120px]">温度警告</Label>
            <Switch checked={settings.tempWarning} onCheckedChange={(v) => update('tempWarning', v)} />
          </div>
          <div className="flex items-center gap-4">
            <Label className="w-[120px]">警告阈值</Label>
            <div className="flex flex-1 items-center gap-4">
              <Slider
                value={[settings.tempThreshold]}
                min={60}
                max={95}
                step={1}
                onValueCommit={(v) => update('tempThreshold', v[0])}
                className="max-w-md flex-1"
              />
              <Input
                type="number"
                className="w-20"
                value={settings.tempThreshold}
                min={60}
                max={95}
                onChange={(e) => update('tempThreshold', Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardHeaderTitle icon={<Info className="h-4 w-4" />} iconClassName="bg-purple-500/10 text-purple-500" title="关于" />
        </CardHeader>
        <CardContent>
          <div className="p-5">
            <div className="mb-3 text-lg font-bold text-slate-800">查机工具箱</div>
            <div className="mb-2 flex gap-3">
              <span className="w-[60px] text-slate-500">版本</span>
              <span>0.0.1</span>
            </div>
            <div className="mb-2 flex gap-3">
              <span className="w-[60px] text-slate-500">框架</span>
              <span>Tauri + React + shadcn/ui</span>
            </div>
            <div className="mt-4 text-[13px] text-slate-500">一款简洁高效的系统硬件检测工具集</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
