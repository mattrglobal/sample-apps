import 'dotenv/config'
import ngrok from '@ngrok/ngrok'

const PORT = process.env.PORT || 7313;

(async function () {
  const authtoken = process.env.NGROK_AUTHTOKEN;
  if (!authtoken) {
    throw Error("NGROK_AUTHTOKEN missing in .env.local file");
  }
  console.log(`Starting ngrok tunnel connecting to port ${PORT}...`);
  const url = await ngrok.connect({ addr: PORT, authtoken: authtoken });
  console.log(`\nPublic URL: \n\n${url.url()}\n`);
})();

process.stdin.resume();
