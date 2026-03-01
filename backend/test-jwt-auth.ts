import axios from 'axios'
import { privateKeyToAccount } from 'viem/accounts'
import { generatePrivateKey } from 'viem/accounts'

const API_URL = 'http://localhost:3001'

async function runTests() {
	console.log('🧪 Testing JWT Auth & Token Rotation...')

	const privateKey = generatePrivateKey()
	const account = privateKeyToAccount(privateKey)
	const address = account.address
	const message = `Login to Doba: ${Date.now()}`
	const signature = await account.signMessage({ message })

	// 1. Login
	console.log('\n--- Testing Login ---')
	const loginRes = await axios.post(`${API_URL}/auth/login`, {
		address,
		signature,
		message
	}, {
		headers: { 'X-API-Key': 'dev-secret-key' }
	})

	const { accessToken, refreshToken } = loginRes.data
	console.log('✅ Login Success')
	console.log(`Access Token: ${accessToken.substring(0, 20)}...`)

	// 2. Protected Route Access
	console.log('\n--- Testing Protected Route Access ---')
	try {
		const deleteRes = await axios.delete(`${API_URL}/tracks/999`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'X-API-Key': 'dev-secret-key'
			}
		})
		console.log('✅ Auth Middleware Success (Checked valid token)')
	} catch (err: any) {
		if (err.response?.status === 404) {
			console.log('✅ Auth Middleware Success (Authorized but track not found)')
		} else {
			console.log(`❌ Auth Middleware Failed: ${err.response?.status}`)
		}
	}

	// 3. Token Rotation
	console.log('\n--- Testing Token Rotation ---')
	const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {
		refreshToken
	}, {
		headers: { 'X-API-Key': 'dev-secret-key' }
	})
	const { accessToken: newAt, refreshToken: newRt } = refreshRes.data
	console.log('✅ Token Rotated successfully')

	// 4. Token Reuse Detection
	console.log('\n--- Testing Token Reuse Detection ---')
	try {
		await axios.post(`${API_URL}/auth/refresh`, {
			refreshToken
		}, {
			headers: { 'X-API-Key': 'dev-secret-key' }
		})
		console.log('❌ FAIL: Old refresh token was reused successfully')
	} catch (err: any) {
		if (err.response?.status === 401) {
			console.log(`✅ Success: Reuse blocked: ${JSON.stringify(err.response?.data)}`)
		} else {
			console.log(`❌ Auth Middleware Failed: ${err.response?.status}`)
		}
	}

	console.log('\n🏁 JWT Auth Testing Complete.')
}

runTests().catch(err => {
	console.error('Test Execution Failed:', err.message)
	if (err.response) console.error('Response:', err.response.data)
})
