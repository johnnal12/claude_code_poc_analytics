import clsx from 'clsx'

interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl bg-white p-6 shadow-sm shadow-stone-900/[0.04]',
        'dark:bg-warm-900/80 dark:shadow-none dark:ring-1 dark:ring-white/[0.04]',
        className,
      )}
    >
      {title && (
        <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
