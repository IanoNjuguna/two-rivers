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
		const verifiedClaims = await privy.verifyWebCallback(token);
		// The verifyWebCallback verifies the JWT and returns the claims
		// We can also use verifyAccessToken if it's a standard access token
		return verifiedClaims;
	} catch (error) {
		try {
			// Fallback to verifyAccessToken which is more common for API auth
			const claims = await privy.verifyAccessToken(token);
			return claims;
		} catch (e) {
			logger.error('Privy token verification failed', e);
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
		const user = await privy.getUser(claims.userId);
		// Find the primary wallet or the first connected wallet
		const wallet = user.linkedAccounts.find(account => account.type === 'wallet');
		if (wallet && 'address' in wallet) {
			return wallet.address.toLowerCase();
		}
		return null;
	} catch (error) {
		logger.error('Failed to fetch Privy user', error);
		return null;
	}
}
