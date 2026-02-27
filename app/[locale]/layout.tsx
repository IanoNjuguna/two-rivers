import React from "react"
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

import '../globals.css'
import { Providers } from "@/components/Providers"
import { headers } from "next/headers"
import { cookieToInitialState } from "@account-kit/core"
import { getConfig } from "@/lib/config"
import { MiniAppInit } from "@/components/MiniAppInit"

const notoSans = localFont({
	src: [
		{ path: '../../public/fonts/NotoSans-Regular.ttf', weight: '400', style: 'normal' },
		{ path: '../../public/fonts/NotoSans-Medium.ttf', weight: '500', style: 'normal' },
		{ path: '../../public/fonts/NotoSans-SemiBold.ttf', weight: '600', style: 'normal' },
		{ path: '../../public/fonts/NotoSans-Bold.ttf', weight: '700', style: 'normal' },
	],
	variable: '--font-noto-sans',
	display: 'swap',
})

const ibmPlexMono = localFont({
	src: [
		{ path: '../../public/fonts/IBMPlexMono-Regular.ttf', weight: '400', style: 'normal' },
		{ path: '../../public/fonts/IBMPlexMono-Medium.ttf', weight: '500', style: 'normal' },
		{ path: '../../public/fonts/IBMPlexMono-SemiBold.ttf', weight: '600', style: 'normal' },
	],
	variable: '--font-ibm-plex-mono',
	display: 'swap',
})

const spaceMono = localFont({
	src: [
		{ path: '../../public/fonts/SpaceMono-Regular.ttf', weight: '400', style: 'normal' },
		{ path: '../../public/fonts/SpaceMono-Bold.ttf', weight: '700', style: 'normal' },
	],
	variable: '--font-space-mono',
	display: 'swap',
})

const notoSansKr = localFont({
	src: [
		{ path: '../../public/fonts/NotoSansKR-Regular.ttf', weight: '400', style: 'normal' },
		{ path: '../../public/fonts/NotoSansKR-Medium.ttf', weight: '500', style: 'normal' },
		{ path: '../../public/fonts/NotoSansKR-Bold.ttf', weight: '700', style: 'normal' },
	],
	variable: '--font-noto-sans-kr',
	display: 'swap',
	preload: false,
})

export const metadata: Metadata = {
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
	title: 'doba',
	description: 'Doba is an audio streaming service. We simplify the distribution of audio media by automating revenue sharing and giving you full control over your sound.',
	generator: 'v0.app',
	openGraph: {
		images: [
			{
				url: '/doba_preview.png',
				width: 1200,
				height: 630,
				alt: 'doba Preview',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		images: ['/doba_preview.png'],
	},
	other: {
		'fc:miniapp': JSON.stringify({
			version: 'next',
			imageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://doba.world'}/doba_preview.png`,
			button: {
				title: 'Open doba',
				action: {
					type: 'launch_miniapp',
					name: 'doba',
					url: process.env.NEXT_PUBLIC_SITE_URL || 'https://doba.world',
					splashImageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://doba.world'}/doba_preview.png`,
					splashBackgroundColor: '#0D0D12',
				},
			},
		}),
	},
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: '#0D0D12',
}

type Props = {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
	const { locale } = await params
	const cookie = (await headers()).get("cookie")
	const initialState = cookieToInitialState(getConfig(), cookie || undefined)

	if (!routing.locales.includes(locale as any)) {
		notFound()
	}

	const messages = await getMessages()

	// RTL languages
	const rtlLocales = ['ar', 'he']
	const dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr'

	return (
		<html lang={locale} dir={dir} className={`dark ${notoSans.variable} ${spaceMono.variable} ${ibmPlexMono.variable} ${notoSansKr.variable}`} suppressHydrationWarning>
			<head>
				<link rel="icon" href="/logo.ico" type="image/x-icon" />
			</head>
			<body className="font-sans antialiased" suppressHydrationWarning>
				<NextIntlClientProvider messages={messages}>
					<Providers initialState={initialState}>
						<MiniAppInit />
						{children}
					</Providers>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
