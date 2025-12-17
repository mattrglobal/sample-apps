import 'dotenv/config'
import ngrok from '@ngrok/ngrok'

const PORT = process.env.PORT || 3000;

(async function () {
  const authtoken = process.env.NGROK_AUTHTOKEN;
  if (!authtoken) {
    throw Error("NGROK_AUTHTOKEN missing in .env file");
  }
  console.log(`Starting ngrok tunnel connecting to port ${PORT}...`);
  const url = await ngrok.connect({ addr: PORT, authtoken: authtoken });
  console.log(`\nPublic Webhook URL: \n\n${url.url()}/webhook\n`);
})();

process.stdin.resume();
