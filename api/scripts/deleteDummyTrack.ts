import { createClient } from '@libsql/client'

const url = process.env.TURSO_URL || 'file:doba.db'
const authToken = process.env.TURSO_AUTH_TOKEN

const db = createClient({
	url: url,
	authToken: authToken,
})

async function main() {
	await db.execute({
		sql: 'DELETE FROM tracks WHERE token_id = ?',
		args: [99999]
	});
	console.log("Deleted track 99999 successfully.");
}

main().catch(console.error);
