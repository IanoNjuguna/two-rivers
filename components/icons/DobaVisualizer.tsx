import React from 'react'

export function DobaVisualizer({ size = 24, className = "" }: { size?: number, className?: string }) {
	// Original viewBox is 74 60. We'll use responsiveness but keep the aspect ratio.
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 74 60"
			width={size}
			height={(size * 60) / 74}
			className={className}
		>
			<g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M12 21 a1 1 0 0 1 0 20 h0 a1 1 0 0 1 0 -20 v38 a1 1 0 0 1 0 -20 h0 a1 1 0 0 1 0 20 v-18 a1 1 0 0 1 0 -20 h0 a1 1 0 0 1 0 20" />
				<path d="M25 21 a1 1 0 0 1 0 20 v20 a1 1 0 0 1 0 -20 h0 a1 1 0 0 1 0 20 v-40" />
				<path d="M38 21 v-20 a1 1 0 0 1 0 20 h0 a1 1 0 0 1 0 -20 v40 a1 1 0 0 1 0 -20 h0 a1 1 0 0 1 0 20 v-20" />
				<path d="M51 21 v20 a1 1 0 0 1 0 -20 h0 a1 1 0 0 1 0 20 v-40 a1 1 0 0 1 0 20 h0 a1 1 0 0 1 0 -20" />
				<path d="M64 21 v-20 a1 1 0 0 1 0 20 h0 a1 1 0 0 1 0 -20 v20 a1 1 0 0 1 0 20 h0 a1 1 0 0 1 0 -20" />
			</g>
		</svg>
	)
}
