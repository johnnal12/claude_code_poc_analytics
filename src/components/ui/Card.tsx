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
        'rounded-2xl border border-stone-200/60 bg-white p-5 shadow-sm',
        'dark:border-gray-800/60 dark:bg-gray-900',
        className,
      )}
    >
      {title && (
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
