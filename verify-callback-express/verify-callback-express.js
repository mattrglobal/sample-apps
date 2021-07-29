'use strict';

require('dotenv').config();
const express = require('express');
const got = require('got');
const ngrok = require('ngrok');
const QRCode = require('qrcode');
const bodyParser = require('body-parser');
const nanoid = require('nanoid').nanoid;
const moment = require('moment');
const NodeCache = require('node-cache');

const app = express();
app.use(bodyParser.json());
app.set('view engine', 'ejs');

let authToken;

const ttl = 16 * 60; // cache for 16 minutes
const cache = new NodeCache({ stdTTL: ttl, useClones: false });

const getToken = async () => {
  console.log('Getting API Auth token.');
  const { env } = process;
  const tokenUrl = env.AUTH_URL + '/oauth/token';
  const clientId = env.AUTH_CLIENT_ID;
  const clientSecret = env.AUTH_CLIENT_SECRET;
  const audience = env.AUTH_AUDIENCE;

  let response;

  try {
    response = await got
      .post(tokenUrl, {
        json: {
          client_id: clientId,
          client_secret: clientSecret,
          audience: audience,
          grant_type: 'client_credentials',
        },
        responseType: 'json',
      })
      .json();
  } catch (e) {
    console.error(e);
    return null;
  }

  console.log('API Auth token recieved.');

  return response.access_token;
};

const provisionPresentationRequest = async (tenant, verifierDid, templateId, url, id, expiresTime) => {
  const presReq = `https://${tenant}/core/v1/presentations/requests`;
  console.log('Creating Presentation Request at ', presReq);

  const presReqResponse = await got.post(presReq, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    json: {
      challenge: id,
      did: verifierDid,
      templateId: templateId,
      expiresTime,
      callbackUrl: `${url}/callback`,
    },
    responseType: 'json',
  });
  console.log('Create Presentation Request statusCode: ', presReqResponse.statusCode);
  const requestPayload = presReqResponse.body.request;
  console.log(requestPayload, '\n');
  return requestPayload;
};

const signPayload = async (tenant, verifierDid, payload) => {
  // Get DIDUrl from Verifier DID Doc
  const dids = `https://${tenant}/core/v1/dids/` + verifierDid;
  console.log('Looking up DID Doc from Verifier DID :', dids);

  const didsResponse = await got.get(dids, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    responseType: 'json',
  });
  console.log('Public key from DID Doc found, DIDUrl is: ', didsResponse.body.didDocument.authentication[0], '\n');
  const didUrl = didsResponse.body.didDocument.authentication[0];

  // Sign payload
  const signMes = `https://${tenant}/core/v1/messaging/sign`;
  console.log('Signing the Presentation Request payload at: ', signMes);

  const response = await got.post(signMes, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    json: {
      didUrl: didUrl,
      payload,
    },
    responseType: 'json',
  });
  const jws = response.body;
  console.log('The signed Presentation Request message is: ', jws, '\n');
  return jws;
};

const startNgrok = async () => {
  console.log('Starting Ngrok');
  const ngrokUrl = await ngrok.connect(2000);
  const ngrokResponse = await got.get(`${ngrokUrl}/test`);
  if (ngrokResponse.statusCode < 300) {
    console.log('Ngrok started');
  }
  return ngrokUrl;
};

app.get('/verify', (req, res) => {
  const { id } = req.query;

  if (!id) {
    res.sendStatus(422);
    return;
  }

  const state = cache.get(id);

  res.render('qr', { qrImageData: state.qrImageData, id });
});

app.get('/status', (req, res) => {
  const { id } = req.query;

  if (!id) {
    res.sendStatus(422);
    return;
  }

  const state = cache.get(id);
  const result = state.result;

  res.send({ complete: !!result, verified: (result || {}).verified });
});

app.get('/qr', (req, res) => {
  const { id } = req.query;

  if (!id) {
    res.sendStatus(422);
    return;
  }

  const state = cache.get(id);

  console.log(`Sent jws url to wallet: ${state.jwsUrl}`);
  res.redirect(state.jwsUrl);
});

app.get('/test', (req, res) => {
  res.sendStatus(200);
});

app.post('/callback', async (req, res) => {
  const body = req.body;
  const { challengeId: id } = body;
  const state = cache.get(id);
  state.result = body;
  res.sendStatus(200);
});

app.listen(2000, err => {
  if (err) {
    throw err;
  }
});

const exit = async () => {
  await ngrok.disconnect();
  process.exit();
};

['SIGTERM', 'SIGINT'].forEach(sig => process.on(sig, async () => await exit()));

const verify = async (id, tenant, verifierDid, templateId, url) => {
  authToken = await getToken();

  if (!authToken) {
    throw new Error('Access token is missing - check the env settings');
  }

  // Expires in 15 minutes
  const expiresTime = moment().add(15, 'm').valueOf();

  const requestPayload = await provisionPresentationRequest(tenant, verifierDid, templateId, url, id, expiresTime);

  const state = cache.get(id);

  const jws = await signPayload(tenant, verifierDid, requestPayload);
  state.jwsUrl = `https://${tenant}/?request=${jws}`;

  const didcommUrl = `didcomm://${url}/qr?id=${id}`;
  state.qrImageData = await QRCode.toDataURL(didcommUrl, { width: 400 });
};

const timeout = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const getResult = async id => {
  const state = cache.get(id);
  if (!state || state.result === null) {
    await timeout(5000);
    return await getResult(id);
  }
  return state.result;
};

const { TENANT, VERIFIER_DID, TEMPLATE_ID } = process.env;

(async (tenant, verifierDid, templateId) => {

  const ngrokUrl = await startNgrok();

  // Unique id for this presentation request to track its state
  const id = nanoid();
  cache.set(id, {
    jwsUrl: null,
    qrImageData: null,
    result: null,
  });

  await verify(id, tenant, verifierDid, templateId, ngrokUrl);
  console.log(`Open ${ngrokUrl}/verify?id=${id} to see QR code`);
  const result = await getResult(id);
  console.log('\n Data from the Presentation is shown below \n', result);
  console.log('Exiting app in 5 seconds...');
  await timeout(5000);
  await exit();
})(TENANT, VERIFIER_DID, TEMPLATE_ID);
