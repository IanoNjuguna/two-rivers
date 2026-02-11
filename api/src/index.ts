import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getTrack, addTrack, getAllTracks, type Track } from './database'

const app = new Hono()

// Enable CORS for NFT marketplaces
app.use('/*', cors())

// Metadata endpoint (OpenSea standard)
app.get('/metadata/:tokenId', (c) => {
  const tokenId = parseInt(c.req.param('tokenId'))
  
  if (isNaN(tokenId)) {
    return c.json({ error: 'Invalid token ID' }, 400)
  }
  
  const track = getTrack(tokenId)
  
  if (!track) {
    return c.json({ error: 'Token not found' }, 404)
  }
  
  // Format as OpenSea metadata standard
  return c.json({
    name: track.name,
    description: track.description || '',
    image: track.image_url || '',
    animation_url: track.audio_url || '',
    external_url: track.external_url || `https://dobamusic.com/tracks/${tokenId}`,
    attributes: [
      { trait_type: 'Artist', value: track.artist },
      { trait_type: 'Genre', value: track.genre || 'Unknown' },
      { trait_type: 'Duration', value: track.duration || 'Unknown' },
      { trait_type: 'Release Date', value: track.release_date || 'Unknown' }
    ]
  })
})

// Admin: Add new track
app.post('/admin/tracks', async (c) => {
  const apiKey = c.req.header('X-API-Key')
  
  // Simple API key protection
  const adminKey = process.env.ADMIN_API_KEY || 'dev-secret-key'
  if (apiKey !== adminKey) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const track = await c.req.json() as Track
  
  // Validate required fields
  if (!track.token_id || !track.name || !track.artist) {
    return c.json({ error: 'Missing required fields: token_id, name, artist' }, 400)
  }
  
  try {
    addTrack(track)
    return c.json({ 
      success: true, 
      token_id: track.token_id,
      message: 'Track added successfully',
      metadata_url: `http://localhost:3000/metadata/${track.token_id}`
    })
  } catch (error) {
    console.error('Error adding track:', error)
    return c.json({ error: 'Failed to add track' }, 500)
  }
})

// List all tracks
app.get('/tracks', (c) => {
  const tracks = getAllTracks()
  return c.json(tracks)
})

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Doba Music NFT Metadata API',
    version: '1.0.0',
    endpoints: {
      metadata: '/metadata/:tokenId',
      tracks: '/tracks',
      health: '/health',
      admin: '/admin/tracks (POST with X-API-Key header)'
    }
  })
})

const port = parseInt(process.env.PORT || '3000')

console.log(`🚀 Doba Music API running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
