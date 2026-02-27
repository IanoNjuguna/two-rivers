'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect, useState } from 'react';

export function MiniAppInit() {
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				await sdk.actions.ready();
			} catch (e) {
				console.error('Failed to call sdk.actions.ready', e);
			}
		};

		if (!isLoaded) {
			setIsLoaded(true);
			// Add a slight delay to ensure the bridge is ready
			setTimeout(() => {
				load();
			}, 100);
		}
	}, [isLoaded]);

	return null;
}
