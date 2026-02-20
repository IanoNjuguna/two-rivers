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

// IPFS Upload Assets Proxy (Audio + Image)
app.post('/upload-assets', async (c) => {
  const pinataJwt = process.env.PINATA_JWT
  if (!pinataJwt) return c.json({ error: 'Pinata JWT not configured' }, 500)

  try {
    const formData = await c.req.formData()
    const audio = formData.get('audio') as File
    const image = formData.get('image') as File
    const title = formData.get('title')

    if (!audio || !image) return c.json({ error: 'Missing files' }, 400)

    const assetsFormData = new FormData()
    const folderName = `${title || 'assets'}_folder`
    const audioName = audio.name || 'audio.mp3'
    const imageName = image.name || 'cover.jpg'

    assetsFormData.append('file', audio, `${folderName}/${audioName}`)
    assetsFormData.append('file', image, `${folderName}/${imageName}`)
    assetsFormData.append('pinataMetadata', JSON.stringify({ name: folderName }))

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${pinataJwt}` },
      body: assetsFormData
    })

    if (!res.ok) throw new Error(await res.text())
    const data = await res.json() as { IpfsHash: string }

    return c.json({
      success: true,
      assetsCid: data.IpfsHash,
      audioName,
      imageName
    })
  } catch (error) {
    return c.json({ error: 'Assets upload failed', details: String(error) }, 500)
  }
})

// IPFS Upload Metadata Proxy
app.post('/upload-metadata', async (c) => {
  const pinataJwt = process.env.PINATA_JWT
  if (!pinataJwt) return c.json({ error: 'Pinata JWT not configured' }, 500)

  try {
    const { title, description, artist, genre, assetsCid, audioName, imageName } = await c.req.json()

    const metadata = {
      name: title,
      description,
      image: `ipfs://${assetsCid}/${imageName}`,
      animation_url: `ipfs://${assetsCid}/${audioName}`,
      attributes: [
        { trait_type: 'Artist', value: artist },
        { trait_type: 'Genre', value: genre },
      ]
    }

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pinataJwt}`
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: `${title}_metadata` }
      })
    })

    if (!res.ok) throw new Error(await res.text())
    const data = await res.json() as { IpfsHash: string }

    return c.json({
      success: true,
      metadataUri: `ipfs://${data.IpfsHash}`
    })
  } catch (error) {
    return c.json({ error: 'Metadata upload failed', details: String(error) }, 500)
  }
})

// Original combo endpoint for backward compatibility
app.post('/upload', async (c) => {
  const pinataJwt = process.env.PINATA_JWT
  if (!pinataJwt) return c.json({ error: 'Pinata JWT not configured' }, 500)

  try {
    const formData = await c.req.formData()
    const audio = formData.get('audio') as File
    const image = formData.get('image') as File
    const title = formData.get('title') as string
    const artist = formData.get('artist') as string
    const description = formData.get('description') as string
    const genre = formData.get('genre') as string

    if (!audio || !image) return c.json({ error: 'Missing files' }, 400)

    // Reuse logic
    const folderName = `${title}_assets`
    const audioName = audio.name || 'audio.mp3'
    const imageName = image.name || 'cover.jpg'

    const assetsFormData = new FormData()
    assetsFormData.append('file', audio, `${folderName}/${audioName}`)
    assetsFormData.append('file', image, `${folderName}/${imageName}`)
    assetsFormData.append('pinataMetadata', JSON.stringify({ name: folderName }))

    const assetsRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${pinataJwt}` },
      body: assetsFormData
    })

    if (!assetsRes.ok) throw new Error(await assetsRes.text())
    const { IpfsHash: assetsCid } = await assetsRes.json() as { IpfsHash: string }

    const metadata = {
      name: title,
      description,
      image: `ipfs://${assetsCid}/${imageName}`,
      animation_url: `ipfs://${assetsCid}/${audioName}`,
      attributes: [
        { trait_type: 'Artist', value: artist },
        { trait_type: 'Genre', value: genre },
      ]
    }

    const metadataRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pinataJwt}`
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: `${title}_metadata` }
      })
    })

    if (!metadataRes.ok) throw new Error(await metadataRes.text())
    const { IpfsHash: metadataCid } = await metadataRes.json() as { IpfsHash: string }

    return c.json({
      success: true,
      metadataUri: `ipfs://${metadataCid}`,
      audioUri: `ipfs://${assetsCid}/${audioName}`,
      imageUri: `ipfs://${assetsCid}/${imageName}`,
      assetsFolderUri: `ipfs://${assetsCid}`
    })
  } catch (error) {
    return c.json({ error: 'Upload failed', details: String(error) }, 500)
  }
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
