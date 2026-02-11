import Database from 'bun:sqlite'

// Initialize SQLite database
const db = new Database('doba.db')

// Create tables
db.run(`
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

console.log('✅ Database initialized')

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
}

export function getTrack(tokenId: number): Track | null {
  return db.query('SELECT * FROM tracks WHERE token_id = ?').get(tokenId) as Track | null
}

export function addTrack(track: Track): void {
  const stmt = db.prepare(`
    INSERT INTO tracks (token_id, name, description, artist, genre, duration, release_date, image_url, audio_url, external_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(token_id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      artist = excluded.artist,
      genre = excluded.genre,
      duration = excluded.duration,
      release_date = excluded.release_date,
      image_url = excluded.image_url,
      audio_url = excluded.audio_url,
      external_url = excluded.external_url
  `)
  
  stmt.run(
    track.token_id,
    track.name,
    track.description || null,
    track.artist,
    track.genre || null,
    track.duration || null,
    track.release_date || null,
    track.image_url || null,
    track.audio_url || null,
    track.external_url || null
  )
}

export function getAllTracks(): Track[] {
  return db.query('SELECT * FROM tracks ORDER BY token_id').all() as Track[]
}

export function deleteTrack(tokenId: number): void {
  db.run('DELETE FROM tracks WHERE token_id = ?', tokenId)
}

export default db
