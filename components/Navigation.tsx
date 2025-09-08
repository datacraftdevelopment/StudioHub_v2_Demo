'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  Home, 
  Calendar, 
  Menu,
  X
} from 'lucide-react'

interface NavigationProps {
  user: {
    username: string
    displayName: string
    isManager: boolean
    isDesigner: boolean
  }
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, show: true },
    { name: 'Calendar', href: '/calendar', icon: Calendar, show: true },
  ]

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-xl font-bold">StudioHub</span>
              {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
                <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded">
                  DEMO
                </span>
              )}
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navigation.filter(item => item.show).map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2
                        ${isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-gray-300 text-sm">
              <span className="hidden sm:inline">Welcome, </span>
              <span className="font-medium">{user.displayName}</span>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-gray-300 hover:text-white text-sm font-medium"
              >
                Logout
              </button>
            </form>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.filter(item => item.show).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2
                    ${isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}