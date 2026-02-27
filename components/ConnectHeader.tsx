'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { sdk } from '@farcaster/miniapp-sdk'

// Dynamically import the headers so Next.js doesn't execute their top-level hooks
// until they are conditionally rendered. This prevents Alchemy Account Kit hooks
// from crashing when its Provider is absent in Mini App mode.
const AlchemyConnectHeader = dynamic(() => import('./AlchemyConnectHeader'), { ssr: false })
const MiniAppHeader = dynamic(() => import('./MiniAppHeader'), { ssr: false })

export default function ConnectHeader({ address }: { address?: string }) {
	const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null)

	useEffect(() => {
		sdk.isInMiniApp().then(setIsMiniApp).catch(() => setIsMiniApp(false))
	}, [])

	if (isMiniApp === null) return null // Wait for context

	return isMiniApp ? (
		<MiniAppHeader address={address} />
	) : (
		<AlchemyConnectHeader address={address} />
	)
}
