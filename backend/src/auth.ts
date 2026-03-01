import { verifyMessage } from 'viem'
import { logger } from './lib/logger'

const ACCESS_TOKEN_EXP = 7 * 24 * 60 * 60 // 7 days in seconds

export async function signJWT(payload: any, secret: string) {
	const { sign } = await import('hono/jwt')
	return await sign(payload, secret, 'HS256')
}

export async function verifyJWT(token: string, secret: string) {
	const { verify } = await import('hono/jwt')
	try {
		return await verify(token, secret, 'HS256')
	} catch (e) {
		return null
	}
}

export async function verifyWalletSignature(address: string, signature: `0x${string}`, message: string): Promise<boolean> {
	try {
		const valid = await verifyMessage({
			address: address as `0x${string}`,
			message,
			signature
		})
		return valid
	} catch (error) {
		logger.error('Signature verification failed', error)
		return false
	}
}

export function generateRefreshToken() {
	return crypto.randomUUID()
}

export function getAccessTokenPayload(address: string) {
	const now = Math.floor(Date.now() / 1000)
	return {
		sub: address,
		iat: now,
		exp: now + ACCESS_TOKEN_EXP
	}
}
