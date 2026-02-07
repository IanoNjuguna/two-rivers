export default function Footer() {
  const footerLinks = [
    { label: 'Legal', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Cookie Manager', href: '#' },
    { label: 'Imprint', href: '#' },
    { label: 'Artist Resources', href: '#' },
    { label: 'Creator Channels', href: '#' },
    { label: 'Transparency Reports', href: '#' },
  ]

  // Desktop sidebar version
  return (
    <>
      {/* Desktop Sidebar Footer */}
      <div className="hidden lg:block border-t border-white/[0.08] mt-auto pt-4">
        <div className="px-4 space-y-3 text-xs">
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
            <p className="text-white/30">© 2024 Music NFT</p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Footer */}
      <footer className="lg:hidden fixed bottom-20 left-0 right-0 border-t border-white/[0.08] bg-midnight/40 z-30">
        <div className="px-4 py-3 space-y-2">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/50">Language:</span>
              <button className="text-xs text-[#FF1F8A] hover:text-[#FF1F8A]/80 transition-colors font-medium">
                English (US)
              </button>
            </div>
            <p className="text-xs text-white/30">© 2024 Music NFT</p>
          </div>
        </div>
      </footer>
    </>
  )
}
