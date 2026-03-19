import { PrivyClient } from '@privy-io/server-auth';
import { logger } from './lib/logger';

const PRIVY_APP_ID = process.env.PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
	logger.error('PRIVY_APP_ID or PRIVY_APP_SECRET is missing from environment variables');
}

const privy = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

export async function verifyPrivyToken(token: string) {
	try {
		// Try verifyAccessToken first - standard for frontend access tokens
		const claims = await privy.verifyAccessToken(token);
		return claims;
	} catch (error: any) {
		try {
			// Fallback to verifyWebCallback (used for webhooks/signatures)
			const verifiedClaims = await privy.verifyWebCallback(token);
			return verifiedClaims;
		} catch (e) {
			logger.error('[Privy] Token verification failed', {
				error: error.message,
				fallbackError: (e as any).message
			});
			return null;
		}
	}
}

/**
 * Extracts the primary wallet address from a Privy user or claims object.
 */
export async function getAddressFromPrivyToken(token: string): Promise<string | null> {
	const claims = await verifyPrivyToken(token);
	if (!claims) return null;

	try {
		// Use 'sub' or 'userId' from claims to fetch user details
		const userId = claims.userId || (claims as any).sub;
		if (!userId) {
			logger.warn('[Privy] No userId or sub in claims', claims);
			return null;
		}

		const user = await privy.getUser(userId);
		// Find the primary wallet or the first connected wallet
		const wallet = user.linkedAccounts.find(account => account.type === 'wallet');
		if (wallet && 'address' in wallet) {
			return wallet.address.toLowerCase();
		}

		logger.warn('[Privy] No wallet found for user', { userId });
		return null;
	} catch (error: any) {
		logger.error('[Privy] Failed to fetch user details', { error: error.message });
		return null;
	}
}
