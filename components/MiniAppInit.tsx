'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';

export function MiniAppInit() {
	useEffect(() => {
		// Dismiss the splash screen once the app is ready
		sdk.actions.ready();
	}, []);

	return null;
}
