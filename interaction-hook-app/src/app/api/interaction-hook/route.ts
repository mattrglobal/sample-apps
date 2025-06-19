import { z } from "zod";
import { SignJWT, jwtVerify } from "jose";

// This schema is used to validate the request body.
const requestSchema = z.object({
  data: z.object({
    name: z.string().min(0, { message: "Preferred name must be a string" }),
    pronouns: z.string().min(0, { message: "Pronouns must be a string" }),
  }),
  token: z.string().min(0, { message: "Token must be a string" }),
});

const jwtSchema = z.object({
  state: z.string().min(0, { message: "State must be a valid string" }),
  redirectUrl: z.string().url({ message: "redirectUrl must be a valid url" }),
});

export async function POST(request: Request) {
  const res = await request.json();
  const { token, data } = requestSchema.parse(res);

  const secret = Buffer.from(process.env.INTERACTION_HOOK_SECRET || "", "base64");
  const issuerUrl = process.env.ISSUER_TENANT_URL;
  const appUrl = process.env.APP_URL;

  const verifiedJwt = await jwtVerify(token, secret, { issuer: issuerUrl, audience: appUrl });

  const parsedJwt = jwtSchema.parse(verifiedJwt.payload);

  const signedResponse = await new SignJWT({
    iss: appUrl,
    aud: issuerUrl,
    state: parsedJwt.state,
    claims: {
      name: data.name,
      pronouns: data.pronouns,
    },
    claimsToPersist: [],
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1m")
    .sign(secret);

  const redirect = `${parsedJwt.redirectUrl}?session_token=${signedResponse}`;

  return Response.json({ redirect });
}
