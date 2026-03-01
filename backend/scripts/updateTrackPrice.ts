import { createClient } from '@libsql/client'

const url = process.env.TURSO_URL || 'file:doba.db'
const authToken = process.env.TURSO_AUTH_TOKEN

const db = createClient({
	url: url,
	authToken: authToken,
})

async function main() {
	await db.execute({
		sql: 'UPDATE tracks SET price = ? WHERE token_id = ?',
		args: ['0.99', 0]
	});
	console.log(`Successfully updated the price of track 0 to 0.99`);
}

main().catch(console.error);
