import ngrok from "@ngrok/ngrok";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load from .env.local first, then .env as fallback
dotenv.config({ path: join(__dirname, ".env.local") });
dotenv.config({ path: join(__dirname, ".env") });

(async () => {
	const authtoken = process.env.NGROK_AUTHTOKEN;
	if (!authtoken) {
		throw Error("NGROK_AUTHTOKEN missing in .env.local file");
	}
	const url = await ngrok.connect({ addr: 3000, authtoken: authtoken });
	console.log(`\nPublic Interaction Hook URL: \n\n${url.url()}\n`);
	console.log(`Update your .env.local file with: APP_URL="${url.url()}"`);
	console.log(
		`Update MATTR VII interaction hook URL to: ${url.url()}/api/interaction-hook\n`,
	);
})();

process.stdin.resume();
