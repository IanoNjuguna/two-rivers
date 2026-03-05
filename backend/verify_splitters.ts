
import { createClient } from "@libsql/client";

async function main() {
	const client = createClient({
		url: "libsql://doba-prod-ianonjuguna.aws-us-east-2.turso.io",
		authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzE3Njc1MTIsImlkIjoiNDVjOWUwNWUtNDY0Mi00MWQ1LWE3MTktYzlmODUzMDkxN2ExIiwicmlkIjoiZjZhYmYyNDgtOGExMS00N2FhLWJkNjMtNjExNTFlZmFmNTg4In0.a6ceOL-74Pd25QuQPdmHt9JZLNokW76gLhPe1xglZpGfXefXbhvVmvOU_MQ7MdOJRSyeF2Czltwfa8uDcudTCg",
	});

	try {
		console.log("Checking production schema...");
		const tableInfo = await client.execute("PRAGMA table_info(tracks);");
		const columns = tableInfo.rows.map(row => row.name as string);
		console.log("Columns:", columns.join(", "));

		const selectCols = ["token_id", "name", "splitter"].filter(c => columns.includes(c));
		if (columns.includes("chain_id")) selectCols.push("chain_id");

		const result = await client.execute(`SELECT ${selectCols.join(", ")} FROM tracks ORDER BY token_id DESC LIMIT 50;`);
		console.log(selectCols.join(" | "));
		console.log("-".repeat(80));
		for (const row of result.rows) {
			console.log(selectCols.map(col => row[col as keyof typeof row]).join(" | "));
		}
	} catch (e) {
		console.error("Error querying database:", e);
	} finally {
		client.close();
	}
}

main();
