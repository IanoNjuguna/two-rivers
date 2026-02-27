import { logger } from './lib/logger'
import { createClient } from '@libsql/client'

const url = process.env.TURSO_URL || 'file:doba.db'
const authToken = process.env.TURSO_AUTH_TOKEN

// Initialize LibSQL client (local or remote)
const db = createClient({
  url: url,
  authToken: authToken,
})

// Initialize tables
async function init() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tracks (
      token_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      artist TEXT NOT NULL,
      genre TEXT,
      duration TEXT,
      release_date TEXT,
      image_url TEXT,
      audio_url TEXT,
      external_url TEXT,
      price TEXT,
      max_supply TEXT,
      splitter TEXT,
      tx_hash TEXT,
      uploader_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      address TEXT PRIMARY KEY,
      username TEXT,
      bio TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'user',
      farcaster_fid INTEGER UNIQUE,
      farcaster_custody_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS collaborators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id INTEGER NOT NULL,
      wallet_address TEXT NOT NULL,
      split_percentage REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(track_id) REFERENCES tracks(token_id),
      UNIQUE(track_id, wallet_address)
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token TEXT PRIMARY KEY,
      user_address TEXT NOT NULL,
      family TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      revoked INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_address) REFERENCES users(address)
    )
  `)

  // Simple migrations
  const trackColumns = ['price', 'max_supply', 'splitter', 'tx_hash', 'uploader_address']
  for (const col of trackColumns) {
    try {
      await db.execute(`ALTER TABLE tracks ADD COLUMN ${col} TEXT`)
    } catch (e) {
      // Column probably already exists
    }
  }

  const userColumns = ['role', 'farcaster_fid', 'farcaster_custody_address']
  for (const col of userColumns) {
    try {
      if (col === 'role') {
        await db.execute(`ALTER TABLE users ADD COLUMN ${col} TEXT DEFAULT 'user'`)
      } else if (col === 'farcaster_fid') {
        await db.execute(`ALTER TABLE users ADD COLUMN ${col} INTEGER UNIQUE`)
      } else {
        await db.execute(`ALTER TABLE users ADD COLUMN ${col} TEXT`)
      }
    } catch (e) {
      // Column probably already exists
    }
  }
  logger.info(`Database initialized (${url.startsWith('file:') ? 'Local' : 'Turso'})`)
}

init().catch(err => logger.error('Database initialization failed', err))

export interface Track {
  token_id: number
  name: string
  description?: string
  artist: string
  genre?: string
  duration?: string
  release_date?: string
  image_url?: string
  audio_url?: string
  external_url?: string
  price?: string
  max_supply?: string
  splitter?: string
  tx_hash?: string
  uploader_address?: string
}

export interface User {
  address: string
  username?: string
  bio?: string
  avatar_url?: string
  role?: 'admin' | 'user'
  farcaster_fid?: number
  farcaster_custody_address?: string
}

export interface Collaborator {
  id?: number
  track_id: number
  wallet_address: string
  split_percentage: number
}

export interface RefreshToken {
  token: string
  user_address: string
  family: string
  expires_at: number
  revoked: boolean
}

export async function getTrack(tokenId: number): Promise<Track | null> {
  const rs = await db.execute({
    sql: 'SELECT * FROM tracks WHERE token_id = ?',
    args: [tokenId]
  })
  return rs.rows[0] as unknown as Track | null
}

export async function addTrack(track: Track): Promise<void> {
  await db.execute({
    sql: `
      INSERT INTO tracks (token_id, name, description, artist, genre, duration, release_date, image_url, audio_url, external_url, price, max_supply, splitter, tx_hash, uploader_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(token_id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        artist = excluded.artist,
        genre = excluded.genre,
        duration = excluded.duration,
        release_date = excluded.release_date,
        image_url = excluded.image_url,
        audio_url = excluded.audio_url,
        external_url = excluded.external_url,
        price = excluded.price,
        max_supply = excluded.max_supply,
        splitter = excluded.splitter,
        tx_hash = excluded.tx_hash,
        uploader_address = excluded.uploader_address
    `,
    args: [
      track.token_id,
      track.name,
      track.description ?? null,
      track.artist,
      track.genre ?? null,
      track.duration ?? null,
      track.release_date ?? null,
      track.image_url ?? null,
      track.audio_url ?? null,
      track.external_url ?? null,
      track.price ?? null,
      track.max_supply ?? null,
      track.splitter ?? null,
      track.tx_hash ?? null,
      track.uploader_address ?? null
    ]
  })
}

export async function getAllTracks(artist?: string): Promise<Track[]> {
  let sql = 'SELECT * FROM tracks ORDER BY token_id DESC'
  let args: any[] = []

  if (artist) {
    sql = 'SELECT * FROM tracks WHERE artist = ? OR artist COLLATE NOCASE = ? ORDER BY token_id DESC'
    args = [artist, artist]
  }

  const rs = await db.execute({ sql, args })
  return rs.rows as unknown as Track[]
}

export async function deleteTrack(tokenId: number): Promise<void> {
  await db.execute({
    sql: 'DELETE FROM tracks WHERE token_id = ?',
    args: [tokenId]
  })
}

export async function deleteAllTracks(): Promise<void> {
  await db.execute('DELETE FROM tracks')
}

// User Methods
export async function getUser(address: string): Promise<User | null> {
  const rs = await db.execute({
    sql: 'SELECT * FROM users WHERE address = ?',
    args: [address]
  })
  return rs.rows[0] as unknown as User | null
}

export async function addUser(user: User): Promise<void> {
  await db.execute({
    sql: `
      INSERT INTO users (address, username, bio, avatar_url, role, farcaster_fid, farcaster_custody_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(address) DO UPDATE SET
        username = excluded.username,
        bio = excluded.bio,
        avatar_url = excluded.avatar_url,
        role = COALESCE(excluded.role, users.role),
        farcaster_fid = excluded.farcaster_fid,
        farcaster_custody_address = excluded.farcaster_custody_address
    `,
    args: [
      user.address,
      user.username ?? null,
      user.bio ?? null,
      user.avatar_url ?? null,
      user.role ?? 'user',
      user.farcaster_fid ?? null,
      user.farcaster_custody_address ?? null
    ]
  })
}

export async function getUserByFid(fid: number): Promise<User | null> {
  const rs = await db.execute({
    sql: 'SELECT * FROM users WHERE farcaster_fid = ?',
    args: [fid]
  })
  return rs.rows[0] as unknown as User | null
}

export async function linkFidToUser(address: string, fid: number, custodyAddress: string): Promise<void> {
  await db.execute({
    sql: 'UPDATE users SET farcaster_fid = ?, farcaster_custody_address = ? WHERE address = ?',
    args: [fid, custodyAddress, address]
  })
}

export async function isAdmin(address: string): Promise<boolean> {
  if (!address) return false
  const user = await getUser(address)
  return user?.role === 'admin'
}

// Collaborator Methods
export async function getTrackCollaborators(trackId: number): Promise<Collaborator[]> {
  const rs = await db.execute({
    sql: 'SELECT * FROM collaborators WHERE track_id = ?',
    args: [trackId]
  })
  return rs.rows as unknown as Collaborator[]
}

export async function addCollaborator(collab: Collaborator): Promise<void> {
  await db.execute({
    sql: `
      INSERT INTO collaborators (track_id, wallet_address, split_percentage)
      VALUES (?, ?, ?)
      ON CONFLICT(track_id, wallet_address) DO UPDATE SET
        split_percentage = excluded.split_percentage
    `,
    args: [
      collab.track_id,
      collab.wallet_address,
      collab.split_percentage
    ]
  })
}

export async function deleteTrackCollaborators(trackId: number): Promise<void> {
  await db.execute({
    sql: 'DELETE FROM collaborators WHERE track_id = ?',
    args: [trackId]
  })
}

// Refresh Token Methods
export async function addRefreshToken(rt: RefreshToken): Promise<void> {
  await db.execute({
    sql: 'INSERT INTO refresh_tokens (token, user_address, family, expires_at) VALUES (?, ?, ?, ?)',
    args: [rt.token, rt.user_address, rt.family, rt.expires_at]
  })
}

export async function getRefreshToken(token: string): Promise<RefreshToken | null> {
  const rs = await db.execute({
    sql: 'SELECT * FROM refresh_tokens WHERE token = ?',
    args: [token]
  })
  if (!rs.rows[0]) return null
  const row = rs.rows[0] as any
  return {
    token: row.token,
    user_address: row.user_address,
    family: row.family,
    expires_at: row.expires_at,
    revoked: Boolean(row.revoked)
  }
}

export async function revokeRefreshTokenFamily(family: string): Promise<void> {
  await db.execute({
    sql: 'UPDATE refresh_tokens SET revoked = 1 WHERE family = ?',
    args: [family]
  })
}

export default db
