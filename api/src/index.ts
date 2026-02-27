import { logger } from './lib/logger'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getTrack, addTrack, getAllTracks, deleteTrack, deleteAllTracks, getUser, addUser, getTrackCollaborators, addCollaborator, isAdmin, type Track, type RefreshToken, addRefreshToken, getRefreshToken, revokeRefreshTokenFamily, getUserByFid, linkFidToUser } from './database'
import { verifyWalletSignature, signJWT, verifyJWT, generateRefreshToken, getAccessTokenPayload } from './auth'
import { createAppClient, viemConnector } from '@farcaster/auth-client'
import axios from 'axios'
import FormData from 'form-data'
import { Buffer } from 'buffer'
import { jwt } from 'hono/jwt'

const app = new Hono()

// Enable CORS
app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
}))

const SERVER_VERSION = '1.2.1-secure'

// Global Error Handler
app.onError((err, c) => {
  logger.error(`[API ERROR] ${c.req.method} ${c.req.url}`, err)

  // Return generic message for internal errors
  return c.json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred. Please try again later.'
  }, 500)
})

// 404 Handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: `Route ${c.req.path} does not exist` }, 404)
})

const JWT_SECRET = process.env.JWT_SECRET || 'doba-default-secret-change-me'

// Authentication Middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header' }, 401)
  }

  const token = authHeader.split(' ')[1]
  const payload = await verifyJWT(token, JWT_SECRET)
  if (!payload) {
    return c.json({ error: 'Unauthorized', message: 'Invalid or expired access token' }, 401)
  }

  c.set('jwtPayload', payload)
  await next()
}

// Simple API Key Middleware for mutating routes (POST, DELETE, PUT)
app.use('*', async (c, next) => {
  if (['POST', 'DELETE', 'PUT', 'PATCH'].includes(c.req.method)) {
    // Exclude auth routes from API Key requirement if we want, or keep it as an extra layer
    if (c.req.path.startsWith('/auth/')) return await next()

    const apiKey = c.req.header('X-API-Key')
    const validKey = process.env.API_SECRET_KEY

    // If a key is configured on the server, enforce it
    if (validKey && apiKey !== validKey) {
      logger.warn(`Unauthorized ${c.req.method} attempt.`)
      return c.json({ error: 'Unauthorized. Invalid or missing X-API-Key.' }, 401)
    }
  }
  await next()
})

const getPinataJwt = () => {
  const jwt = process.env.PINATA_JWT?.trim()
  if (!jwt) logger.warn('PINATA_JWT is MISSING from process.env')
  return jwt
}

// IPFS Upload Assets Proxy (PIN INDIVIDUALLY)
app.post('/upload-assets', async (c) => {
  const pinataJwt = getPinataJwt()
  if (!pinataJwt) return c.json({ error: 'Pinata JWT not configured' }, 500)

  try {
    const formData = await c.req.formData()
    const audio = formData.get('audio') as any
    const image = formData.get('image') as any
    const title = formData.get('title') as string || 'assets'

    if (!audio || !image) return c.json({ error: 'Missing files' }, 400)

    logger.info(`[IPFS] Dual-Pin Start: ${title}`)

    // 1. PIN AUDIO
    const audioFormData = new FormData()
    const audioBuffer = Buffer.from(await audio.arrayBuffer())
    const audioEntryName = `audio_${Date.now()}.mp3`
    audioFormData.append('file', audioBuffer, { filename: audioEntryName, contentType: audio.type || 'audio/mpeg' })
    audioFormData.append('pinataMetadata', JSON.stringify({ name: `${title}_audio` }))

    logger.debug(`[IPFS] Pinning audio...`)
    const audioRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", audioFormData, {
      maxBodyLength: Infinity,
      headers: { Authorization: `Bearer ${pinataJwt}`, ...audioFormData.getHeaders() }
    })
    const audioHash = audioRes.data.IpfsHash
    logger.info(`[IPFS] Audio Success: ${audioHash}`)

    // 2. PIN IMAGE
    const imageFormData = new FormData()
    const imageBuffer = Buffer.from(await image.arrayBuffer())
    const imageEntryName = `cover_${Date.now()}.jpg`
    imageFormData.append('file', imageBuffer, { filename: imageEntryName, contentType: image.type || 'image/jpeg' })
    imageFormData.append('pinataMetadata', JSON.stringify({ name: `${title}_image` }))

    logger.debug(`[IPFS] Pinning image...`)
    const imageRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", imageFormData, {
      maxBodyLength: Infinity,
      headers: { Authorization: `Bearer ${pinataJwt}`, ...imageFormData.getHeaders() }
    })
    const imageHash = imageRes.data.IpfsHash
    logger.info(`[IPFS] Image Success: ${imageHash}`)

    return c.json({
      success: true,
      audioHash,
      imageHash,
      audioName: audioEntryName,
      imageName: imageEntryName
    })
  } catch (error: any) {
    logger.error(`[IPFS] Assets upload failed`, error.response?.data || error.message)
    return c.json({ error: 'Assets upload failed' }, 500)
  }
})



// Auth Routes
app.post('/auth/login', async (c) => {
  const { address, signature, message } = await c.req.json()

  const isValid = await verifyWalletSignature(address, signature, message)
  if (!isValid) {
    return c.json({ error: 'Authentication failed', message: 'Invalid signature' }, 401)
  }

  // Ensure user exists
  const existingUser = await getUser(address)
  if (!existingUser) {
    await addUser({ address, role: 'user' })
  }

  const accessToken = await signJWT(getAccessTokenPayload(address), JWT_SECRET)
  const refreshTokenString = generateRefreshToken()
  const family = refreshTokenString // Initial token in family

  const rt: RefreshToken = {
    token: refreshTokenString,
    user_address: address,
    family,
    expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
    revoked: false
  }
  await addRefreshToken(rt)

  return c.json({ address, accessToken, refreshToken: refreshTokenString })
})

app.post('/auth/refresh', async (c) => {
  const { refreshToken } = await c.req.json()
  if (!refreshToken) return c.json({ error: 'Refresh token required' }, 400)

  const rtRecord = await getRefreshToken(refreshToken)
  if (!rtRecord) return c.json({ error: 'Invalid refresh token' }, 401)

  if (rtRecord.revoked) {
    // Reuse detected! Revoke EVERYTHING in this family
    logger.warn(`Refresh token reuse detected for family ${rtRecord.family}. Revoking entire family.`)
    await revokeRefreshTokenFamily(rtRecord.family)
    return c.json({ error: 'Security alert', message: 'Refresh token has been reused. All sessions revoked.' }, 401)
  }

  if (rtRecord.expires_at < Math.floor(Date.now() / 1000)) {
    return c.json({ error: 'Refresh token expired' }, 401)
  }

  // Rotate: revoke old, issue new pair
  await revokeRefreshTokenFamily(rtRecord.family) // In this simple impl, we revoke old family and start new or just chain them
  // Better: Mark only this one as used? No, the plan said rotation.
  // Actually, revocation should happen here.

  const address = rtRecord.user_address
  const accessToken = await signJWT(getAccessTokenPayload(address), JWT_SECRET)
  const newRefreshTokenString = generateRefreshToken()

  const newRt: RefreshToken = {
    token: newRefreshTokenString,
    user_address: address,
    family: rtRecord.family,
    expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
    revoked: false
  }
  await addRefreshToken(newRt)

  return c.json({ accessToken, refreshToken: newRefreshTokenString })
})

const pendingSiwfTokens = new Map<string, { fid: number, custodyAddress: string, expiresAt: number }>()

app.post('/auth/siwf', async (c) => {
  const { message, signature, nonce, skipLink } = await c.req.json()

  try {
    const farcasterClient = createAppClient({
      ethereum: viemConnector(),
    })

    const verifyResponse = await farcasterClient.verifySignInMessage({
      message,
      signature,
      domain: 'doba.world',
      nonce,
    })

    if (!verifyResponse.success) {
      return c.json({ error: 'Authentication failed', message: 'Invalid SIWF signature' }, 401)
    }

    const fid = verifyResponse.fid
    const custodyAddress = verifyResponse.data?.address

    // Fetch verified addresses from Hubble via Neynar (if key exists)
    let verifiedAddresses: string[] = []
    if (process.env.NEYNAR_API_KEY) {
      try {
        const res = await axios.get(`https://hub-api.neynar.com/v1/verificationsByFid?fid=${fid}`, {
          headers: { 'api_key': process.env.NEYNAR_API_KEY }
        })
        verifiedAddresses = res.data.messages.map((m: any) =>
          m.data.verificationAddEthAddressBody.address.toLowerCase()
        )
      } catch (err) {
        logger.warn(`Failed to fetch Farcaster verified addresses for FID ${fid}`)
      }
    }

    let userRecord = await getUserByFid(fid)

    if (!userRecord && verifiedAddresses.length > 0) {
      for (const addr of verifiedAddresses) {
        const u = await getUser(addr)
        if (u) {
          await linkFidToUser(addr, fid, custodyAddress)
          userRecord = u
          break
        }
      }
    }

    if (userRecord) {
      const address = userRecord.address
      const accessToken = await signJWT(getAccessTokenPayload(address), JWT_SECRET)
      const refreshTokenString = generateRefreshToken()
      await addRefreshToken({
        token: refreshTokenString,
        user_address: address,
        family: refreshTokenString,
        expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        revoked: false
      })
      return c.json({ linked: true, address, accessToken, refreshToken: refreshTokenString })
    }

    // No existing user found. 
    if (skipLink) {
      // Create new fresh user
      await addUser({ address: custodyAddress, role: 'user', farcaster_fid: fid, farcaster_custody_address: custodyAddress })
      const accessToken = await signJWT(getAccessTokenPayload(custodyAddress), JWT_SECRET)
      const refreshTokenString = generateRefreshToken()
      await addRefreshToken({
        token: refreshTokenString,
        user_address: custodyAddress,
        family: refreshTokenString,
        expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        revoked: false
      })
      return c.json({ linked: true, address: custodyAddress, accessToken, refreshToken: refreshTokenString })
    }

    // Hold proof in memory for linking
    const pendingToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
    pendingSiwfTokens.set(pendingToken, { fid, custodyAddress, expiresAt: Date.now() + 5 * 60 * 1000 })
    return c.json({ linked: false, pendingSiwfToken: pendingToken })

  } catch (error: any) {
    logger.error(`SIWF error:`, error)
    return c.json({ error: 'SIWF processing failed' }, 500)
  }
})

app.post('/auth/link-fid', async (c) => {
  const { pendingSiwfToken, emailToken } = await c.req.json()
  // 1. Verify SIWF token
  const pendingData = pendingSiwfTokens.get(pendingSiwfToken)
  if (!pendingData || pendingData.expiresAt < Date.now()) {
    return c.json({ error: 'Invalid or expired SIWF session' }, 401)
  }

  // 2. Here we would verify the email magic link token (`emailToken`).
  // Since Alchemy Account Kit verifies email links entirely on the client side,
  // the client would pass their Alchemy session signature/token or wallet address directly.
  // For this implementation, we expect `address` and `signature` of an Alchemy authenticated session.
  const { address, signature, message } = await c.req.json()
  const isValid = await verifyWalletSignature(address, signature, message)

  if (!isValid) return c.json({ error: 'Invalid linking signature' }, 401)

  // Link!
  let userRecord = await getUser(address)
  if (!userRecord) {
    await addUser({ address, role: 'user' })
    userRecord = await getUser(address)
  }

  await linkFidToUser(address, pendingData.fid, pendingData.custodyAddress)
  pendingSiwfTokens.delete(pendingSiwfToken)

  const accessToken = await signJWT(getAccessTokenPayload(address), JWT_SECRET)
  const refreshTokenString = generateRefreshToken()
  await addRefreshToken({
    token: refreshTokenString,
    user_address: address,
    family: refreshTokenString,
    expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
    revoked: false
  })

  return c.json({ linked: true, address, accessToken, refreshToken: refreshTokenString })
})

// IPFS Upload Metadata Proxy (Accept dual hashes)
app.post('/upload-metadata', async (c) => {
  const pinataJwt = getPinataJwt()
  if (!pinataJwt) return c.json({ error: 'Pinata JWT not configured' }, 500)

  try {
    const { title, description, artist, genre, audioHash, imageHash, audioName, imageName } = await c.req.json()

    // Handle legacy if coming from old frontend, but plan for dual hashes
    const finalAudioUri = audioHash.startsWith('Qm') || audioHash.startsWith('ba')
      ? `ipfs://${audioHash}`
      : `ipfs://${audioHash}/${audioName}`

    const finalImageUri = imageHash.startsWith('Qm') || imageHash.startsWith('ba')
      ? `ipfs://${imageHash}`
      : `ipfs://${imageHash}/${imageName}`

    const metadata = {
      name: title,
      description,
      image: finalImageUri,
      animation_url: finalAudioUri,
      attributes: [
        { trait_type: 'Artist', value: artist },
        { trait_type: 'Genre', value: genre },
      ]
    }

    logger.debug(`[IPFS] Pinning Metadata...`)
    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      pinataContent: metadata,
      pinataMetadata: { name: `${title}_metadata` }
    }, {
      headers: { Authorization: `Bearer ${pinataJwt}`, "Content-Type": "application/json" }
    })

    return c.json({ success: true, metadataUri: `ipfs://${res.data.IpfsHash}` })
  } catch (error: any) {
    logger.error(`[IPFS] Metadata upload failed`, error.response?.data || error.message)
    return c.json({ error: 'Metadata upload failed' }, 500)
  }
})

// Remaining endpoints (tracks, health, root)
app.get('/tracks', async (c) => {
  const artist = c.req.query('artist')
  const chainId = c.req.query('chain_id')
  const tracks = await getAllTracks(artist, chainId)
  return c.json(tracks)
})

app.get('/health', async (c) => {
  let pinata = 'unknown'
  try { await axios.get('https://api.pinata.cloud/health', { timeout: 2000 }); pinata = 'ok' } catch { pinata = 'error' }
  return c.json({ status: 'ok', version: SERVER_VERSION, pinata })
})

app.post('/tracks', authMiddleware, async (c) => {
  const track = await c.req.json();
  const payload = c.get('jwtPayload')
  const requesterAddress = payload.sub

  logger.debug('Authenticated Track Upload Attempt', { address: requesterAddress, track: track.name })

  try {
    await addTrack({ ...track, uploader_address: requesterAddress })
    return c.json({ success: true })
  } catch (error: any) {
    logger.error('db addTrack failed', error)
    return c.json({ error: 'Failed to add track' }, 500)
  }
})

app.delete('/tracks/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400)

  const payload = c.get('jwtPayload')
  const requesterAddress = payload.sub

  const track = await getTrack(id)
  if (!track) return c.json({ error: 'Track not found' }, 404)

  if (track.uploader_address && track.uploader_address.toLowerCase() !== requesterAddress.toLowerCase()) {
    logger.warn(`Unauthorized DELETE attempt for track ${id} by ${requesterAddress}`)
    return c.json({ error: 'Forbidden. You do not own this track.' }, 403)
  }

  await deleteTrack(id)
  return c.json({ success: true })
})

app.delete('/tracks', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload')
  const requesterAddress = payload.sub

  const isUserAdmin = await isAdmin(requesterAddress)
  if (!isUserAdmin) {
    logger.warn(`Unauthorized mass DELETE attempt by ${requesterAddress}`)
    return c.json({ error: 'Forbidden. Admin privileges required.' }, 403)
  }

  await deleteAllTracks()
  return c.json({ success: true })
})

// Check for weak configuration in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.API_SECRET_KEY) {
    logger.error('CRITICAL: API_SECRET_KEY is NOT set in production environment!')
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'doba-default-secret-change-me') {
    logger.warn('WARNING: Using default or missing JWT_SECRET in production!')
  }
}

const port = parseInt(process.env.PORT || '3001')

// Users Endpoints
app.get('/users/:address', async (c) => {
  const address = c.req.param('address')
  const user = await getUser(address)
  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json(user)
})

app.post('/users', authMiddleware, async (c) => {
  const user = await c.req.json()
  const payload = c.get('jwtPayload')
  const requesterAddress = payload.sub

  // Users can only update their own profile
  if (user.address.toLowerCase() !== requesterAddress.toLowerCase()) {
    logger.warn(`Unauthorized profile update attempt for ${user.address} by ${requesterAddress}`)
    return c.json({ error: 'Forbidden. You can only update your own profile.' }, 403)
  }

  await addUser(user)
  return c.json({ success: true })
})

// Collaborators Endpoints
app.get('/tracks/:id/collaborators', async (c) => {
  const trackId = parseInt(c.req.param('id'))
  if (isNaN(trackId)) return c.json({ error: 'Invalid ID' }, 400)
  const collaborators = await getTrackCollaborators(trackId)
  return c.json(collaborators)
})

app.post('/collaborators', authMiddleware, async (c) => {
  const collab = await c.req.json()
  // Authorization: Only the uploader or an admin can add collaborators
  const track = await getTrack(collab.track_id)
  if (!track) return c.json({ error: 'Track not found' }, 404)

  const payload = c.get('jwtPayload')
  const requesterAddress = payload.sub
  const isUserAdmin = await isAdmin(requesterAddress)

  if (!isUserAdmin && track.uploader_address?.toLowerCase() !== requesterAddress.toLowerCase()) {
    logger.warn(`Unauthorized collaborator addition attempt for track ${collab.track_id} by ${requesterAddress}`)
    return c.json({ error: 'Forbidden. Only the track owner or admin can add collaborators.' }, 403)
  }

  await addCollaborator(collab)
  return c.json({ success: true })
})

export default { port, fetch: app.fetch }
