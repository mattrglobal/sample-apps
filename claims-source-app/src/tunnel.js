import 'dotenv/config'
import ngrok from '@ngrok/ngrok'

(async function () {
  const authtoken = process.env.NGROK_AUTHTOKEN;
  if (!authtoken) {
    throw Error("NGORK_AUTHTOKEN missing in .env file");
  }
  const url = await ngrok.connect({ addr: 6453, authtoken: authtoken });
  console.log(`\nPublic Claims Source URL: \n\n${url.url()}/claims\n`);
})();

process.stdin.resume();
