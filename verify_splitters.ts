
import { createClient } from "@libsql/client";

async function main() {
	const client = createClient({
		url: "file:doba.db",
	});

	try {
		const result = await client.execute("SELECT token_id, name, splitter FROM tracks ORDER BY token_id DESC LIMIT 50;");
		console.log("Token ID | Name | Splitter");
		console.log("---------------------------------------");
		for (const row of result.rows) {
			console.log(`${row.token_id} | ${row.name} | ${row.splitter}`);
		}

	} catch (e) {
		console.error("Error querying database:", e);
	} finally {
		client.close();
	}
}

main();
