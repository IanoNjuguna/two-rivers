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
    <>
      {/* Desktop Sidebar Footer */}
      <div className="hidden lg:block border-t border-white/[0.08] pt-4">
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/50">Language:</span>
            <button className="text-[#FF1F8A] hover:text-[#FF1F8A]/80 transition-colors font-medium">
              English (US)
            </button>
          </div>
          <p className="text-white/30">© 2024 Music NFT</p>
        </div>
      </div>

      {/* Mobile Footer */}
      <footer className="lg:hidden border-t border-white/[0.08] px-4 py-6">
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/50">Language:</span>
            <button className="text-[#FF1F8A] hover:text-[#FF1F8A]/80 transition-colors font-medium">
              English (US)
            </button>
          </div>
          <p className="text-white/30">© 2024 Music NFT</p>
        </div>
      </footer>
    </>
  )
}
