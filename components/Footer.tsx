'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'
import { Link } from '@/i18n/navigation'

export default function Footer() {
  const t = useTranslations('footer')
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
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
    { label: t('about'), href: '/about' },
    { label: t('howItWorks'), href: '/how-it-works' },
    { label: t('forArtists'), href: '/for-artists' },
    { label: t('faq'), href: '/faq' },
    { label: t('docs'), href: '/docs' },
    { label: t('terms'), href: '/terms' },
    { label: t('privacy'), href: '/privacy' },
    { label: t('support'), href: '/support' }
  ]

  return (
    <>
      {/* Desktop Sidebar Footer */}
      <div className="hidden lg:block pt-4">
        <div className="space-y-3 text-xs">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/50 hover:text-white/80 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-2 border-t border-white/[0.08]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/50">{t('language')}:</span>
              <LanguageSwitcher />
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
              <Link
                key={link.href}
                href={link.href}
                className="text-white/50 hover:text-white/80 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-2 border-t border-white/[0.08]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/50">{t('language')}:</span>
              <LanguageSwitcher />
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
