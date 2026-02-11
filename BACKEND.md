# Doba Music NFT Metadata API

## Overview

This API serves NFT metadata to marketplaces (OpenSea, Blur, etc.) and provides admin endpoints for managing track information.

**Base URL**: `https://api.dobamusic.com`

## How NFT Metadata Works

1. **Contract has base URI:** `https://api.dobamusic.com/metadata/`
2. **Appends token ID:** Token #1 → `/metadata/1`, Token #2 → `/metadata/2`
3. **Returns JSON** with NFT details following OpenSea metadata standard

## Example Response

```json
{
  "name": "Sunrise Melody",
  "description": "A smooth jazz track capturing the warmth of dawn",
  "image": "https://cdn.dobamusic.com/artwork/sunrise-melody.jpg",
  "animation_url": "https://cdn.dobamusic.com/audio/sunrise-melody.mp3",
  "external_url": "https://dobamusic.com/tracks/1",
  "attributes": [
    {
      "trait_type": "Artist",
      "value": "DJ Sunrise"
    },
    {
      "trait_type": "Genre",
      "value": "Jazz"
    },
    {
      "trait_type": "Duration",
      "value": "3:45"
    },
    {
      "trait_type": "Release Date",
      "value": "2026-02-11"
    }
  ]
}
```

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono (lightweight, fast web framework)
- **Database**: SQLite (simple, file-based, perfect for metadata)
- **Deployment**: Cloudflare Workers (free tier, global CDN)

## API Endpoints

### Public Endpoints

#### Get NFT Metadata

```
GET /metadata/:tokenId
```

Returns OpenSea-compatible metadata for a specific token.

**Example:**

```bash
curl https://api.dobamusic.com/metadata/1
```

#### List All Tracks

```
GET /tracks
```

Returns array of all track metadata.

#### Health Check

```
GET /health
```

Returns API status.

### Admin Endpoints

#### Add New Track

```
POST /admin/tracks
```

**Headers:**

```
X-API-Key: your-secret-key
Content-Type: application/json
```

**Body:**

```json
{
  "token_id": 3,
  "name": "Midnight Vibes",
  "description": "Chillhop beats for late night coding",
  "artist": "LoFi Producer",
  "genre": "Lo-Fi Hip Hop",
  "duration": "2:30",
  "release_date": "2026-02-11",
  "image_url": "https://cdn.dobamusic.com/artwork/midnight-vibes.jpg",
  "audio_url": "https://cdn.dobamusic.com/audio/midnight-vibes.mp3"
}
```

## Quick Start

### Development

```bash
cd api
bun install
bun run dev
# Server runs on http://localhost:3000
```

### Test Locally

```bash
curl http://localhost:3000/metadata/1
curl http://localhost:3000/tracks
curl http://localhost:3000/health
```

### Add Test Data

```bash
curl -X POST http://localhost:3000/admin/tracks \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-key" \
  -d '{
    "token_id": 1,
    "name": "Sunrise Melody",
    "description": "A smooth jazz track",
    "artist": "DJ Sunrise",
    "genre": "Jazz",
    "duration": "3:45",
    "release_date": "2026-02-11",
    "image_url": "https://via.placeholder.com/600x600.png?text=Sunrise+Melody",
    "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  }'
```

## Deployment Options

### Option 1: Cloudflare Workers (Recommended)

**Pros**:

- Free tier (100k requests/day)
- Global CDN
- Serverless (no maintenance)
- Fast

**Setup:**

```bash
cd api
bun add -g wrangler
wrangler login
wrangler deploy
```

**Cost**: Free up to 100k requests/day

### Option 2: Railway.app

**Pros**:

- Easy deployment
- Includes database
- Good for SQLite
- Auto SSL

**Steps:**

1. Push code to GitHub
2. Go to railway.app
3. Click "New Project" → "Deploy from GitHub"
4. Select your repo
5. Railway auto-detects Bun and deploys

**Cost**: $5/month

### Option 3: Self-hosted VPS (DigitalOcean/AWS)

**Pros**: Full control

**Setup:**

```bash
# On your VPS
git clone your-repo
cd api
bun install
bun run start

# Use PM2 to keep it running
bun add -g pm2
pm2 start "bun run start" --name doba-api
pm2 save
pm2 startup
```

**Cost**: $5-10/month

## Hosting Music Files

### Option 1: IPFS (Decentralized, Permanent)

**Pros**:

- Decentralized
- Permanent storage
- No bandwidth costs
- True Web3

**Setup:**

```bash
# Install IPFS
bun add ipfs-http-client

# Upload files
npx ipfs add song.mp3
# Returns: QmHash...

# Use in metadata:
# https://ipfs.io/ipfs/QmHash...
# or https://gateway.pinata.cloud/ipfs/QmHash...
```

**Services**: Pinata, NFT.Storage (free), Web3.Storage

### Option 2: Cloudflare R2 (Cheap, Fast)

**Pros**:

- Similar to AWS S3
- No egress fees (free bandwidth!)
- Fast CDN
- Very cheap

**Pricing**:

- $0.015/GB/month storage
- $0 egress (FREE bandwidth)
- $4.50/million write requests

**Setup**: <https://developers.cloudflare.com/r2/>

### Option 3: AWS S3 + CloudFront

**Pros**:

- Industry standard
- Reliable
- Global CDN

**Pricing**:

- ~$0.023/GB/month storage
- Bandwidth costs apply
- Good for established projects

## Database Schema

### Tracks Table

```sql
CREATE TABLE tracks (
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
```

## Environment Variables

```bash
# .env
ADMIN_API_KEY=your-secret-key-here
PORT=3000
NODE_ENV=production
```

## Production Checklist

- [ ] Set strong `ADMIN_API_KEY` in environment
- [ ] Upload music files to IPFS or CDN
- [ ] Configure custom domain (api.dobamusic.com)
- [ ] Add rate limiting (Cloudflare handles this)
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Add caching headers
- [ ] SSL/HTTPS (automatic on Cloudflare/Railway)
- [ ] Database backups (SQLite file)
- [ ] CORS configured for your frontend domain
- [ ] Test all endpoints in production

## Integration with Smart Contract

After deploying API, update smart contract base URI:

```bash
# Set base URI on deployed contracts
bun hardhat run scripts/setBaseURI.ts --network base-sepolia
bun hardhat run scripts/setBaseURI.ts --network arbitrum-sepolia
```

Update the script to use your production API URL:

```typescript
const baseURI = 'https://api.dobamusic.com/metadata/'
```

## Monitoring & Maintenance

### Check API Health

```bash
curl https://api.dobamusic.com/health
```

### View Logs

**Cloudflare Workers:**

```bash
wrangler tail
```

**Railway:**

- View in Railway dashboard

**PM2:**

```bash
pm2 logs doba-api
```

### Backup Database

```bash
# SQLite database is a single file
cp doba.db doba.db.backup

# Or schedule backups
0 0 * * * cp /path/to/doba.db /path/to/backups/doba-$(date +\%Y\%m\%d).db
```

## Common Issues & Solutions

### Issue: "metadata unavailable" on OpenSea

**Solutions:**

1. Check base URI is set correctly on contract
2. Verify API returns valid JSON
3. Ensure CORS headers are set
4. Check token exists in database
5. OpenSea may cache - use refresh metadata button

### Issue: Audio not playing

**Solutions:**

1. Check `animation_url` is accessible
2. Verify CORS on audio files
3. Use HTTPS (not HTTP)
4. Check audio file format (MP3, WAV supported)

### Issue: Slow response times

**Solutions:**

1. Use Cloudflare Workers for global CDN
2. Add caching headers
3. Optimize database queries
4. Use R2/IPFS for files (not API server)

## Example Workflow

### Artist Mints NFT

1. **Artist uploads music:**

   ```bash
   # Upload to IPFS
   ipfs add song.mp3
   # Returns: QmXyz123...
   ```

2. **Artist uploads artwork:**

   ```bash
   ipfs add artwork.jpg
   # Returns: QmAbc456...
   ```

3. **Add metadata to API:**

   ```bash
   curl -X POST https://api.dobamusic.com/admin/tracks \
     -H "X-API-Key: $ADMIN_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "token_id": 5,
       "name": "New Song",
       "artist": "Artist Name",
       "image_url": "https://ipfs.io/ipfs/QmAbc456...",
       "audio_url": "https://ipfs.io/ipfs/QmXyz123..."
     }'
   ```

4. **Mint NFT on blockchain:**

   ```bash
   # Mints token ID 5
   # Contract automatically points to https://api.dobamusic.com/metadata/5
   ```

5. **Appears on OpenSea:**
   - OpenSea fetches metadata from API
   - Displays artwork, plays audio
   - Shows artist, genre, etc. from attributes

## Resources

- [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards)
- [Hono Documentation](https://hono.dev/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Bun Runtime](https://bun.sh/)

## Support

For issues or questions about the API, check:

- API health endpoint: `https://api.dobamusic.com/health`
- Deployment logs
- Database integrity: `SELECT COUNT(*) FROM tracks`
