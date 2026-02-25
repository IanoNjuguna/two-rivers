'use client';

export default function DebugPage() {
	const envVars = {
		NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
		NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
		NEXT_PUBLIC_ACTIVE_CHAIN: process.env.NEXT_PUBLIC_ACTIVE_CHAIN,
	};

	return (
		<div className="p-8">
			<h1 className="text-2xl mb-4">Debug Env Vars</h1>
			<pre className="bg-gray-100 p-4 rounded">
				{JSON.stringify(envVars, null, 2)}
			</pre>
		</div>
	);
}
