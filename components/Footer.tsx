'use client'

import { useTranslations } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'
import { Link } from '@/i18n/navigation'

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const IconTwitter = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 5.88zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

export default function Footer() {
  const t = useTranslations('footer')

  const columns = [
    {
      heading: 'Company',
      links: [
        { label: t('about'), href: '/about' },
        { label: t('howItWorks'), href: '/how-it-works' },
        { label: t('docs'), href: '/docs' },
      ],
    },
    {
      heading: 'Community',
      links: [
        { label: t('forArtists'), href: '/for-artists' },
        { label: t('support'), href: '/support' },
        { label: t('faq'), href: '/faq' },
      ],
    },
    {
      heading: 'Legal',
      links: [
        { label: t('terms'), href: '/terms' },
        { label: t('privacy'), href: '/privacy' },
      ],
    },
  ]

  const socials = [
    { icon: <IconInstagram />, href: 'https://instagram.com', label: 'Instagram' },
    { icon: <IconTwitter />, href: 'https://x.com', label: 'X / Twitter' },
    { icon: <IconFacebook />, href: 'https://facebook.com', label: 'Facebook' },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto text-white/70 text-sm px-6">
      {/* Top section: columns + socials */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-10 pb-10">
        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 flex-1">
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social icons */}
        <div className="flex sm:flex-col gap-3 sm:items-end">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center text-white transition-colors"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.08]" />

      {/* Bottom bar */}
      <div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-white/40 text-xs">
          © {new Date().getFullYear()} doba
        </p>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span>{t('language')}:</span>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}
