export async function GET() {
	const URL = 'https://doba.world';
	return Response.json({
		accountAssociation: {
			header: 'eyJmaWQiOjExNjQzNjgsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhlNzQyQzAxZTdEOTUyMUE0NDJkODJmODk5NUI3MkEyODE5MGFEMzJFIn0',
			payload: 'eyJkb21haW4iOiJkb2JhLndvcmxkIn0',
			signature: 'voST/MQHkJ2wSOUgWiyjKWuXH5wMuvbSKlp3jRAzm3koo9/yJ96pB61AXwVrVf2Q6Aj0S+ONhZx8MYdDoI61zRw=',
		},
		frame: {
			version: '1',
			name: 'doba',
			homeUrl: URL,
			iconUrl: `${URL}/logo.png`,
			splashImageUrl: `${URL}/doba-preview.png`,
			splashBackgroundColor: '#0D0D12',
			webhookUrl: `${URL}/api/webhook`,
		},
	}, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET',
		}
	});
}
