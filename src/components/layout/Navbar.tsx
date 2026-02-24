import { Activity, Moon, Sun } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useTheme } from '@/hooks/useTheme'

const navLinks = [
  { to: '/', label: 'Analytics' },
  { to: '/leaderboard', label: 'Leaderboard' },
]

export function Navbar() {
  const { dark, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-30 border-b border-warm-200/80 bg-warm-50/90 backdrop-blur-md dark:border-warm-800/40 dark:bg-warm-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-terra-500">
              <Activity className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-serif text-[17px] font-semibold text-stone-800 dark:text-stone-100">
              Claude Analytics
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-terra-600 dark:text-terra-400'
                      : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <button
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 transition-colors hover:bg-warm-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-warm-800 dark:hover:text-stone-300"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}
