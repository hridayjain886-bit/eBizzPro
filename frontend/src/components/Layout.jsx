import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Users, Boxes, FileText, Truck, BarChart3,
  Settings, LogOut, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import BrandMark from './ui/BrandMark'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/parties', label: 'Parties', icon: Users },
  { to: '/stock', label: 'Stock', icon: Boxes },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/transporters', label: 'Transporters', icon: Truck },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

const MOBILE_NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutGrid, end: true },
  { to: '/parties', label: 'Parties', icon: Users },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U'
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
      isActive ? 'bg-ink text-paper' : 'text-ink hover:bg-tint'
    }`

  return (
    <div className="min-h-screen bg-paper">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r-2 border-ink bg-surface p-5 lg:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <item.icon size={19} strokeWidth={2.1} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/settings" className={linkClass}>
          <Settings size={19} strokeWidth={2.1} />
          Settings
        </NavLink>
        <div className="mt-4 flex items-center gap-3 rounded-2xl hand-border bg-tint p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-extrabold text-paper">
            {initials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{user?.name}</p>
            <p className="truncate text-xs text-ink-soft">{user?.email}</p>
          </div>
          <button onClick={handleLogout} aria-label="Log out" className="rounded-full p-1.5 hover:bg-surface">
            <LogOut size={17} strokeWidth={2.1} />
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-ink bg-surface px-4 py-3 lg:hidden">
        <Brand compact />
        <button onClick={() => setMobileOpen(true)} className="rounded-full p-2 hand-border" aria-label="Open menu">
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-surface p-5 border-r-2 border-ink animate-rise">
            <div className="flex items-center justify-between">
              <Brand compact />
              <button onClick={() => setMobileOpen(false)} className="rounded-full p-1.5 hover:bg-tint">
                <X size={20} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1.5">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setMobileOpen(false)}>
                  <item.icon size={19} strokeWidth={2.1} />
                  {item.label}
                </NavLink>
              ))}
              <NavLink to="/settings" className={linkClass} onClick={() => setMobileOpen(false)}>
                <Settings size={19} strokeWidth={2.1} />
                Settings
              </NavLink>
              <button onClick={handleLogout} className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-[#8a2e20] hover:bg-tint">
                <LogOut size={19} strokeWidth={2.1} />
                Log out
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64 pb-24 lg:pb-8">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t-2 border-ink bg-surface px-2 py-2 lg:hidden">
        {MOBILE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[10px] font-bold ${
                isActive ? 'bg-ink text-paper' : 'text-ink-soft'
              }`
            }
          >
            <item.icon size={19} strokeWidth={2.1} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function Brand({ compact }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark compact={compact} />
      {!compact && <span className="text-lg font-extrabold tracking-tight">eBizzPro</span>}
      {compact && <span className="text-base font-extrabold tracking-tight">eBizzPro</span>}
    </div>
  )
}
