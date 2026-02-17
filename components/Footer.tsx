'use client'

import { useState, useEffect } from 'react'

export default function Footer() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    // Set initial time on mount
    setCurrentTime(new Date())

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const footerLinks = [
    { label: 'About', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'For Artists', href: '/for-artists' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Docs', href: '/docs' },
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Support', href: '/support' }
  ]

  return (
    <>
      {/* Desktop Sidebar Footer */}
      <div className="hidden lg:block pt-4">
        <div className="space-y-3 text-xs">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/50 hover:text-white/80 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-2 border-t border-white/[0.08]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/50">Language:</span>
              <button className="text-[#FF1F8A] hover:text-[#FF1F8A]/80 transition-colors font-medium">
                English (US)
              </button>
            </div>
            {currentTime && (
              <p className="text-white/40 text-[10px] mb-1 font-mono">
                {formatDateTime(currentTime)}
              </p>
            )}
            <p className="text-white/30">© {new Date().getFullYear()} doba</p>
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <footer className="lg:hidden border-t border-white/[0.08] px-4 py-6">
        <div className="space-y-3 text-xs">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/50 hover:text-white/80 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-2 border-t border-white/[0.08]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/50">Language:</span>
              <button className="text-[#FF1F8A] hover:text-[#FF1F8A]/80 transition-colors font-medium">
                English (US)
              </button>
            </div>
            {currentTime && (
              <p className="text-white/40 text-[10px] mb-1 font-mono">
                {formatDateTime(currentTime)}
              </p>
            )}
            <p className="text-white/30">© {new Date().getFullYear()} doba</p>
          </div>
        </div>
      </footer>
    </>
  )
}
