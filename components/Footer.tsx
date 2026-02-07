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

  return (
    <footer className="border-t border-white/[0.08] bg-midnight/40">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Links Row */}
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-white/60 hover:text-white/90 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Language Selector and Copyright */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Language:</span>
            <button className="text-xs text-[#FF1F8A] hover:text-[#FF1F8A]/80 transition-colors font-medium">
              English (US)
            </button>
          </div>
          <p className="text-xs text-white/40">© 2024 Music NFT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
