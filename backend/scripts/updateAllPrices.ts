import { createClient } from '@libsql/client'

const url = process.env.TURSO_URL || 'file:doba.db'
const authToken = process.env.TURSO_AUTH_TOKEN

const db = createClient({
	url: url,
	authToken: authToken,
})

async function main() {
	try {
		const result = await db.execute({
			sql: 'UPDATE tracks SET price = ?',
			args: ['0.50']
		});
		console.log(`Successfully updated ${result.rowsAffected} tracks to price 0.50`);
	} catch (error) {
		console.error('Failed to update track prices:', error);
		process.exit(1);
	}
}

main().catch(console.error);
