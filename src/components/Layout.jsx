import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { WEDDING } from '../lib/config'
import LoginModal from './LoginModal'
import coconutClosed from '../assets/coconut.webp'
import coconutOpen from '../assets/coconut-open.webp'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/timeline', label: 'Timeline' },
  { to: '/catering', label: 'Catering' },
  { to: '/suggestions', label: 'Ideas' },
  { to: '/tasks', label: 'To-dos' },
  { to: '/gallery', label: 'Gallery' },
]

export default function Layout() {
  const { isEditor, displayName, signOut } = useAuth()
  const { pathname } = useLocation()
  const [showLogin, setShowLogin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isHome = pathname === '/'

  return (
    <div className={`flex flex-col ${isHome ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      <header
        className={
          isHome
            ? 'absolute top-0 inset-x-0 z-40 bg-gradient-to-b from-black/40 to-transparent'
            : 'sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-line'
        }
      >
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMenuOpen(false)}>
            <span className={`inline-flex h-9 items-center rounded-full px-3.5 font-display text-base font-semibold tracking-wide ${
              isHome
                ? 'bg-white/15 text-white border border-white/40 backdrop-blur'
                : 'bg-accent-soft text-accent border border-accent/15'
            }`}>{WEDDING.monogram}</span>
            {!isHome && (
              <span className="hidden sm:block font-display text-xl font-semibold text-ink truncate max-w-[18rem]">
                {WEDDING.couple}
              </span>
            )}
          </NavLink>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Coconut menu toggle — breaks open to reveal the menu 🥥 */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className={`relative grid h-14 w-14 place-items-center rounded-full ring-1 transition-colors ${
                isHome
                  ? 'bg-white/12 ring-[#E7C24A]/70 backdrop-blur hover:bg-white/20'
                  : 'bg-accent-soft/60 ring-accent/25 hover:bg-accent-soft'
              }`}>
              <img
                key={menuOpen ? 'open' : 'closed'}
                src={menuOpen ? coconutOpen : coconutClosed}
                alt=""
                className={`h-11 w-11 object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] origin-bottom ${
                  menuOpen ? 'animate-crack' : 'animate-coconut-wiggle'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Dropdown menu (revealed when the coconut cracks open) */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <nav
            className="absolute top-16 right-3 w-[min(92vw,17rem)] rounded-2xl border border-line bg-paper shadow-pop p-2 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 font-medium transition-colors ${
                    isActive ? 'bg-accent-soft text-accent' : 'text-ink hover:bg-line/50'
                  }`
                }>
                {n.label}
              </NavLink>
            ))}

            {/* Auth lives in the menu now */}
            <div className="mt-1 pt-2 border-t border-line">
              {isEditor ? (
                <button
                  onClick={() => { signOut(); setMenuOpen(false) }}
                  className="w-full text-left rounded-xl px-4 py-3 font-medium text-ink hover:bg-line/50 transition-colors">
                  Sign out
                  <span className="block text-xs font-normal text-muted">Signed in as {displayName}</span>
                </button>
              ) : (
                <button
                  onClick={() => { setShowLogin(true); setMenuOpen(false) }}
                  className="w-full text-left rounded-xl px-4 py-3 font-semibold text-accent hover:bg-accent-soft transition-colors">
                  Sign in
                  <span className="block text-xs font-normal text-muted">to add & edit content</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}

      <main className={isHome ? 'flex-1 relative' : 'flex-1 max-w-5xl w-full mx-auto px-5 py-8'}>
        <Outlet context={{ requireLogin: () => setShowLogin(true) }} />
      </main>

      {!isHome && (
        <footer className="border-t border-line">
          <div className="max-w-5xl mx-auto px-5 py-6 text-center text-sm text-muted">
            {WEDDING.couple} · {WEDDING.hashtag}
          </div>
        </footer>
      )}

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}
