import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function SimpleHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D12]/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="doba"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-white">doba</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
