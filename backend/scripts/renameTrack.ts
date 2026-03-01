import { createClient } from '@libsql/client'

const url = process.env.TURSO_URL || 'file:doba.db'
const authToken = process.env.TURSO_AUTH_TOKEN

const db = createClient({
	url: url,
	authToken: authToken,
})

async function main() {
	const newName = process.argv[2]
	if (!newName) {
		console.error("Please provide the new name as an argument. Example: bun run renameTrack.ts 'My New Song'");
		process.exit(1);
	}

	await db.execute({
		sql: 'UPDATE tracks SET name = ? WHERE token_id = ?',
		args: [newName, 0]
	});
	console.log(`Successfully renamed track 0 to: "${newName}"`);
}

main().catch(console.error);
