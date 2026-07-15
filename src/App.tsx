import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Monitor,
  LayoutDashboard,
  Cpu,
  TrendingUp,
  Wrench,
  Timer,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'

const hardwareLinks = [
  { to: '/cpu', label: 'CPU 信息' },
  { to: '/gpu', label: '显卡信息' },
  { to: '/memory', label: '内存信息' },
  { to: '/disk', label: '硬盘信息' },
  { to: '/motherboard', label: '主板信息' },
]

const monitorLinks = [
  { to: '/temperature', label: '温度监控' },
  { to: '/usage', label: '使用率监控' },
  { to: '/fan', label: '风扇转速' },
]

const toolLinks = [
  { to: '/clean', label: '系统清理' },
  { to: '/startup', label: '启动项管理' },
  { to: '/driver', label: '驱动管理' },
  { to: '/network', label: '网络工具' },
]

function NavItem({ to, children, icon }: { to: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'mx-2 flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-slate-500 transition-all',
          isActive
            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25'
            : 'hover:bg-slate-100 hover:text-slate-700'
        )
      }
    >
      {icon}
      <span>{children}</span>
    </NavLink>
  )
}

function SubNav({
  title,
  icon,
  links,
  paths,
}: {
  title: string
  icon: React.ReactNode
  links: { to: string; label: string }[]
  paths: string[]
}) {
  const location = useLocation()
  const active = paths.some((p) => location.pathname.startsWith(p))
  const [open, setOpen] = useState(active)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mx-2 flex h-10 w-[calc(100%-1rem)] items-center gap-2 rounded-lg px-3 text-sm text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
      >
        {icon}
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'mx-2 flex h-10 items-center rounded-lg pl-[52px] pr-3 text-sm text-slate-500 transition-all',
                  isActive
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25'
                    : 'hover:bg-slate-100 hover:text-slate-700'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="select-none px-5 pb-1.5 pt-4 text-[11px] font-bold uppercase tracking-[2px] text-slate-400">
      {children}
    </div>
  )
}

export default function AppLayout() {
  return (
    <div className="flex h-full bg-[#f5f7fa]">
      <aside className="flex w-[220px] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-gradient-to-b from-white to-slate-100">
        <div className="flex h-16 items-center justify-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25">
            <Monitor className="h-5 w-5" />
          </div>
          <span className="text-[17px] font-bold tracking-wide text-slate-800">查机工具箱</span>
        </div>

        <nav className="flex-1 space-y-0.5 py-2">
          <NavItem to="/" icon={<LayoutDashboard className="h-4 w-4" />}>
            系统概览
          </NavItem>

          <GroupTitle>硬件信息</GroupTitle>
          <SubNav
            title="硬件信息"
            icon={<Cpu className="h-4 w-4" />}
            links={hardwareLinks}
            paths={['/cpu', '/gpu', '/memory', '/disk', '/motherboard']}
          />

          <GroupTitle>硬件监控</GroupTitle>
          <SubNav
            title="硬件监控"
            icon={<TrendingUp className="h-4 w-4" />}
            links={monitorLinks}
            paths={['/temperature', '/usage', '/fan']}
          />

          <GroupTitle>系统工具</GroupTitle>
          <SubNav
            title="系统工具"
            icon={<Wrench className="h-4 w-4" />}
            links={toolLinks}
            paths={['/clean', '/startup', '/driver', '/network']}
          />

          <GroupTitle>性能</GroupTitle>
          <NavItem to="/benchmark" icon={<Timer className="h-4 w-4" />}>
            性能测试
          </NavItem>

          <div className="mx-4 my-2 h-px bg-slate-200" />

          <NavItem to="/settings" icon={<Settings className="h-4 w-4" />}>
            设置
          </NavItem>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto px-7 py-6">
        <Outlet />
      </main>

      <Toaster position="top-right" richColors />
    </div>
  )
}
