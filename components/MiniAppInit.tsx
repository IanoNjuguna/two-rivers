'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect, useState } from 'react';

export function MiniAppInit() {
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				const context = await sdk.context;
				if (context) {
					await sdk.actions.ready();
				}
			} catch (e) {
				console.error('Failed to call sdk.actions.ready', e);
			}
		};

		if (!isLoaded) {
			setIsLoaded(true);
			setTimeout(() => {
				load();
			}, 100);
		}
	}, [isLoaded]);

	return null;
}
