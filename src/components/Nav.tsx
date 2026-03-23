import { Search, ShoppingCart, Menu } from 'lucide-react'
import { useState } from 'react'

const topLinks = ['Golf', 'Baseball', 'Softball', 'Careers']
const golfLinks = ['Products', 'Learning Center', 'Community', 'Support', 'R-Cloud']

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar */}
      <div className="bg-black border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-1 shrink-0">
            <span className="text-white font-black text-xl tracking-tight">
              <span className="text-brand">R</span>apsodo
            </span>
          </a>

          {/* Primary nav — desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {topLinks.map(link => (
              <a
                key={link}
                href="#"
                className={`text-xs font-semibold tracking-widest uppercase transition-colors ${
                  link === 'Golf'
                    ? 'text-white border-b-2 border-brand pb-[2px]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <button className="hidden md:flex text-gray-400 hover:text-white transition-colors">
              <Search size={17} />
            </button>
            <button className="hidden md:flex text-gray-400 hover:text-white transition-colors">
              <ShoppingCart size={17} />
            </button>
            <a
              href="#"
              className="hidden md:inline-flex bg-brand hover:bg-brand-hover text-white text-xs font-bold tracking-widest uppercase px-5 py-2 transition-colors"
            >
              Shop
            </a>
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setMobileOpen(o => !o)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Golf sub-nav */}
      <div className="bg-[#0D0D0D] border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-sm tracking-tight">
              <span className="text-brand">R</span>apsodo
            </span>
            <span className="text-white font-light text-sm tracking-[0.2em] uppercase">
              Golf
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-7">
            {golfLinks.map(link => (
              <a
                key={link}
                href="#"
                className={`text-[11px] font-semibold tracking-widest uppercase transition-colors ${
                  link === 'Products'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {link}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black border-b border-border px-4 py-4 space-y-3">
          {[...topLinks, ...golfLinks].map(link => (
            <a
              key={link}
              href="#"
              className="block text-sm text-gray-300 hover:text-white py-1"
            >
              {link}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}
