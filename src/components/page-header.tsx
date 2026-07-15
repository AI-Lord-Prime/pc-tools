import { cn } from '@/lib/utils'

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-3">
      <h2 className="m-0 text-[22px] font-bold text-slate-800">{title}</h2>
      <span className="text-[13px] text-slate-500">{subtitle}</span>
    </div>
  )
}

export function IconBadge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', className)}>
      {children}
    </div>
  )
}

export function CardHeaderTitle({
  icon,
  iconClassName,
  title,
  action,
}: {
  icon: React.ReactNode
  iconClassName?: string
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5">
      <IconBadge className={iconClassName}>{icon}</IconBadge>
      <span className="text-[15px] font-semibold text-slate-800">{title}</span>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  )
}
