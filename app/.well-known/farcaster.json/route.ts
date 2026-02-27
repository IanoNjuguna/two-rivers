export async function GET() {
	const URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://doba.world';
	return Response.json({
		accountAssociation: {
			header: process.env.FC_DOMAIN_HEADER || '',
			payload: process.env.FC_DOMAIN_PAYLOAD || '',
			signature: process.env.FC_DOMAIN_SIGNATURE || '',
		},
		miniapp: {
			version: '1',
			name: 'doba',
			homeUrl: URL,
			iconUrl: `${URL}/logo.png`,
			splashImageUrl: `${URL}/doba_preview.png`,
			splashBackgroundColor: '#0D0D12',
			webhookUrl: `${URL}/api/webhook`,
			subtitle: 'Stream & earn on-chain',
			description: 'Doba is an audio streaming service. Automated revenue sharing and full control over your sound.',
			screenshotUrls: [],
			primaryCategory: 'music',
			tags: ['music', 'streaming', 'web3', 'base'],
			heroImageUrl: `${URL}/doba_preview.png`,
			tagline: 'Your sound, your rules',
			ogTitle: 'doba — on-chain audio streaming',
			ogDescription: 'Stream music, share revenue, own your sound.',
			ogImageUrl: `${URL}/doba_preview.png`,
			noindex: false,
		},
	});
}
