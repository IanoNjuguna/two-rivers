import { logger } from './lib/logger'
import axios from 'axios'

const API_BASE = 'http://localhost:3001'

async function testAPI() {
	console.log('--- Testing Doba API Marketplace Refinements ---')

	try {
		// 1. Test basic fetch
		console.log('\n1. Fetching all tracks...')
		const resAll = await axios.get(`${API_BASE}/tracks`)
		console.log(`Success! Found ${resAll.data.length} tracks.`)

		// 2. Test search
		if (resAll.data.length > 0) {
			const firstTrack = resAll.data[0]
			console.log(`\n2. Testing search for: "${firstTrack.name}"`)
			const resSearch = await axios.get(`${API_BASE}/tracks?search=${encodeURIComponent(firstTrack.name)}`)
			console.log(`Found ${resSearch.data.length} matches.`)
		}

		// 3. Test genre filter
		console.log('\n3. Testing genre filter (Afrobeat)...')
		const resGenre = await axios.get(`${API_BASE}/tracks?genre=Afrobeat`)
		console.log(`Found ${resGenre.data.length} Afrobeat tracks.`)

		// 4. Test pagination
		console.log('\n4. Testing pagination (limit=2)...')
		const resPaginated = await axios.get(`${API_BASE}/tracks?limit=2`)
		console.log(`Fetched ${resPaginated.data.length} tracks.`)

		console.log('\n--- API verification complete ---')
	} catch (error: any) {
		console.error('Verification failed:', error.message)
		if (error.response) {
			console.error('Response data:', error.response.data)
		}
	}
}

testAPI()
