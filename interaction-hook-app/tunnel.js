import ngrok from '@ngrok/ngrok'
import "dotenv/config"

(async function () {
  const authtoken = process.env.NGROK_AUTHTOKEN;
  if (!authtoken) {
    throw Error("NGORK_AUTHTOKEN missing in .env file");
  }
  const url = await ngrok.connect({ addr: 3000, authtoken: authtoken });
  console.log(`\nPublic Interaction Hook URL: \n\n${url.url()}\n`);
})();

process.stdin.resume();
