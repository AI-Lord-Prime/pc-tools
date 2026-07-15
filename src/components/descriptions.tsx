import { cn } from '@/lib/utils'

export function Descriptions({
  items,
  columns = 2,
}: {
  items: { label: string; value: React.ReactNode }[]
  columns?: 1 | 2
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-slate-200',
        columns === 2 ? 'grid grid-cols-2' : 'grid grid-cols-1'
      )}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            'grid grid-cols-[140px_1fr] border-slate-200 text-sm',
            i >= columns && 'border-t',
            columns === 2 && i % 2 === 1 && 'border-l'
          )}
        >
          <div className="bg-slate-50 px-3 py-2.5 font-medium text-slate-500">{item.label}</div>
          <div className="px-3 py-2.5 text-slate-700">{item.value}</div>
        </div>
      ))}
    </div>
  )
}
