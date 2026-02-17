import { Activity, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function Navbar() {
  const { dark, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-analytics-500">
            <Activity className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
            Claude Analytics
          </span>
        </div>
        <button
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-stone-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}
