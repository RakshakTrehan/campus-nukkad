import { useState, useContext } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAdmin, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const navLinkClass = ({ isActive }) =>
    `font-medium text-sm transition-colors ${
      isActive ? 'text-marigold underline' : 'text-ink-dark hover:text-marigold'
    }`

  return (
    <nav className="sticky top-0 z-50 bg-paper border-b-2 border-amber-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="font-kalam text-2xl font-bold text-ink-dark hover:text-marigold transition-colors select-none"
        >
          📌 Campus Nukkad
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/lost-found" className={navLinkClass}>
            Lost &amp; Found
          </NavLink>
          <NavLink to="/mess-pulse" className={navLinkClass}>
            Mess Pulse
          </NavLink>
          <NavLink to="/report" className={navLinkClass}>
            Report
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin Dashboard
            </NavLink>
          )}
        </div>

        {/* Auth — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted font-medium">
                👤 {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm bg-ink-dark text-paper px-3 py-1.5 rounded hover:bg-opacity-80 transition-colors font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-ink-dark hover:text-marigold font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm bg-marigold text-white px-3 py-1.5 rounded hover:bg-yellow-500 transition-colors font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          className="md:hidden p-2 text-ink-dark"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-ink-dark mb-1"></span>
          <span className="block w-5 h-0.5 bg-ink-dark mb-1"></span>
          <span className="block w-5 h-0.5 bg-ink-dark"></span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-paper border-t border-amber-200 px-4 py-3 flex flex-col gap-3">
          <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/lost-found" className={navLinkClass} onClick={() => setMenuOpen(false)}>
            Lost &amp; Found
          </NavLink>
          <NavLink to="/mess-pulse" className={navLinkClass} onClick={() => setMenuOpen(false)}>
            Mess Pulse
          </NavLink>
          <NavLink to="/report" className={navLinkClass} onClick={() => setMenuOpen(false)}>
            Report
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              Admin Dashboard
            </NavLink>
          )}
          <div className="border-t border-amber-200 pt-3">
            {user ? (
              <>
                <p className="text-sm text-muted mb-2">👤 {user.name || user.email}</p>
                <button onClick={handleLogout} className="text-sm bg-ink-dark text-paper px-3 py-1.5 rounded w-full">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm text-ink-dark font-medium">Login</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="text-sm bg-marigold text-white px-3 py-1.5 rounded font-medium">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
