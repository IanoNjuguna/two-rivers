'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { useState, useRef, useEffect } from 'react'
import { IconChevronDown } from '@tabler/icons-react'

export default function LanguageSwitcher() {
	const t = useTranslations('languages')
	const locale = useLocale()
	const router = useRouter()
	const pathname = usePathname()
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	function handleLocaleChange(newLocale: Locale) {
		router.replace(pathname, { locale: newLocale })
		setIsOpen(false)
	}

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-1 text-[#FF1F8A] hover:text-[#FF1F8A]/80 transition-colors font-medium text-xs"
			>
				{t(locale as Locale)}
				<IconChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
			</button>

			{isOpen && (
				<div className="absolute bottom-full left-0 mb-1 min-w-[140px] bg-[#1a1a22] border border-white/[0.12] rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in">
					{routing.locales.map((loc) => (
						<button
							key={loc}
							onClick={() => handleLocaleChange(loc)}
							className={`w-full text-left px-3 py-2 text-xs transition-colors ${loc === locale
									? 'text-[#FF1F8A] bg-white/[0.05]'
									: 'text-white/70 hover:text-white hover:bg-white/[0.05]'
								}`}
						>
							{t(loc)}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
