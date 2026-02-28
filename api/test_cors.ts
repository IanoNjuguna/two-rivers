import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('/*', cors({
  origin: (origin) => {
    return origin ? origin : '*'
  },
  allowHeaders: ['*'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
}))

app.post('/test', (c) => c.json({ ok: true }))

export default { port: 3002, fetch: app.fetch }
