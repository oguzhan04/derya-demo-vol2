import { Moon, Sun, User } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar({ onThemeChange }) {
  // Initialize state based on localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') return true
    if (savedTheme === 'light') return false
    // Fall back to system preference
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  // Apply theme immediately on mount and when it changes
  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    console.log('🔄 Theme effect running, isDark:', isDark)
    
    if (isDark) {
      root.classList.add('dark')
      body.style.backgroundColor = '#0B1120'
      body.style.color = '#ffffff'
      localStorage.setItem('theme', 'dark')
      console.log('✅ Applied dark theme - class added to <html>')
      console.log('📋 HTML classes:', root.className)
      console.log('🎨 Body background:', body.style.backgroundColor)
    } else {
      root.classList.remove('dark')
      body.style.backgroundColor = '#F7F8FB'
      body.style.color = ''
      localStorage.setItem('theme', 'light')
      console.log('✅ Applied light theme - class removed from <html>')
      console.log('📋 HTML classes:', root.className)
      console.log('🎨 Body background:', body.style.backgroundColor)
    }
    
    if (onThemeChange) {
      onThemeChange(isDark)
    }
  }, [isDark, onThemeChange])

  // Listen for system theme changes (only if no user preference)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        console.log('🌐 System theme changed to:', e.matches ? 'dark' : 'light')
        setIsDark(e.matches)
      }
    }
    
    // Use addListener for older browsers, addEventListener for newer
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  const toggleTheme = () => {
    console.log('🖱️ Toggle button clicked!')
    console.log('📊 Current isDark state:', isDark)
    
    // Immediately apply the theme change to DOM
    const root = document.documentElement
    const body = document.body
    const newState = !isDark
    
    if (newState) {
      root.classList.add('dark')
      body.style.backgroundColor = '#0B1120'
      body.style.color = '#ffffff'
      localStorage.setItem('theme', 'dark')
      console.log('✅ Immediately applied dark theme')
      console.log('🎨 Body background set to:', body.style.backgroundColor)
    } else {
      root.classList.remove('dark')
      body.style.backgroundColor = '#F7F8FB'
      body.style.color = ''
      localStorage.setItem('theme', 'light')
      console.log('✅ Immediately applied light theme')
      console.log('🎨 Body background set to:', body.style.backgroundColor)
    }
    
    // Update state - this will trigger the useEffect to ensure consistency
    setIsDark(newState)
  }

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-sm bg-white/90 dark:bg-[#0B1120]/90 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Product Name */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DA</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Derya AI</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-11 -mt-1">Autonomous freight ops</span>
          </div>

          {/* Right Side: Theme Toggle + User Avatar */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-300 cursor-pointer relative z-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              id="dark-mode-toggle"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* User Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

