import { Outlet, useLocation } from 'react-router-dom'
import { Compass, Stamp, Heart, User } from 'lucide-react'
import { Link } from 'react-router-dom'

const navItems = [
  { path: '/', icon: Compass, label: 'Explore' },
  { path: '/passport', icon: Stamp, label: 'Passport' },
  { path: '/saved', icon: Heart, label: 'Saved' },
  { path: '/profile', icon: User, label: 'Profile' }
]

export function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-beige-50 flex flex-col">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-beige-200 z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center h-16">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                  isActive
                    ? 'text-matcha-600'
                    : 'text-beige-500 hover:text-matcha-500'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
