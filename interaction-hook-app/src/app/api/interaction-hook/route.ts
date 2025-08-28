/**
 * MATTR VII INTERACTION HOOK TUTORIAL - BACKEND API HANDLER
 *
 * This API route handles the server-side processing for the interaction hook.
 * It performs the following critical security functions:
 * 1. Verifies the JWT from MATTR VII using a shared secret
 * 2. Processes the user-submitted data
 * 3. Creates a signed JWT response to send back to MATTR VII
 * 4. Returns a redirect URL for the frontend
 *
 * Security Note: JWT verification MUST happen server-side where the secret
 * is securely stored. Never expose the secret to the frontend.
 */

import { z } from "zod";
import { SignJWT, jwtVerify, type JWTVerifyResult } from "jose";

// Backend API Route - Step 5.1: Define validation schema for incoming request
// This ensures we receive the expected data structure from the frontend
const requestSchema = z.object({
	data: z.object({
		name: z.string().min(1, { message: "Name is required" }),
		pronouns: z.string().min(1, { message: "Pronouns are required" }),
	}),
	token: z.string().min(1, { message: "Session token is required" }),
});

// Backend API Route - Step 5.2: Define validation schema for JWT payload
// This validates the structure of the JWT from MATTR VII
const jwtSchema = z.object({
	state: z.string().min(1, { message: "State parameter is required" }),
	redirectUrl: z.string().url({ message: "Invalid redirect URL" }),
	// Note: The JWT may contain other fields, but these are the required ones
});

// Backend JWT Processing - Step 6.1: Main API handler function
export async function POST(request: Request) {
	console.log("Interaction hook API called"); // Debug: Remove in production

	try {
		// Backend JWT Processing - Step 6.2: Parse and validate request body
		const body = await request.json();
		console.log("Received request body:", {
			hasToken: !!body.token,
			hasData: !!body.data,
		}); // Debug: Remove in production

		const { token, data } = requestSchema.parse(body);

		// Backend JWT Processing - Step 6.3: Load environment variables
		// These should be configured in your .env file
		const secret = process.env.INTERACTION_HOOK_SECRET;
		const issuerUrl = process.env.ISSUER_TENANT_URL;
		const appUrl = process.env.APP_URL;

		// Backend JWT Processing - Step 6.4: Validate environment configuration
		if (!secret || !issuerUrl || !appUrl) {
			console.error("Missing environment variables"); // Debug logging
			return Response.json(
				{ error: "Server configuration error" },
				{ status: 500 },
			);
		}

		// Backend JWT Processing - Step 6.5: Convert secret to buffer for JWT operations
		// MATTR VII provides the secret as base64-encoded when you create the interaction hook
		const secretBuffer = Buffer.from(secret, "base64");
		console.log("Secret loaded and decoded"); // Debug: Remove in production

		// Backend JWT Processing - Step 6.6: Verify the JWT from MATTR VII
		// This validates:
		// - The signature using the shared secret
		// - The issuer matches your MATTR VII tenant
		// - The audience matches your app URL
		let verifiedJwt: JWTVerifyResult;
		try {
			verifiedJwt = await jwtVerify(token, secretBuffer, {
				issuer: issuerUrl,
				audience: appUrl,
			});
			console.log("JWT verification successful"); // Debug: Remove in production
		} catch (verifyError: unknown) {
			console.error("JWT verification failed:", verifyError); // Debug logging
			return Response.json({ error: "Invalid session token" }, { status: 401 });
		}

		// Backend JWT Processing - Step 6.7: Extract and validate JWT payload
		const parsedJwt = jwtSchema.parse(verifiedJwt.payload);
		console.log("JWT payload validated:", {
			hasState: !!parsedJwt.state,
			hasRedirectUrl: !!parsedJwt.redirectUrl,
		}); // Debug: Remove in production

		// Backend JWT Processing - Step 6.8: Create the response JWT for MATTR VII
		// This JWT contains:
		// - The user-submitted data as claims
		// - The state parameter to maintain session continuity
		// - Standard JWT fields (iss, aud, iat, exp)
		const responseJwt = await new SignJWT({
			// Standard JWT claims
			iss: appUrl, // Issuer: Your app
			aud: issuerUrl, // Audience: MATTR VII tenant
			state: parsedJwt.state, // Session state from original request

			// Custom claims to be added to the credential
			claims: {
				name: data.name,
				pronouns: data.pronouns,
			},

			// Claims to persist in MATTR VII (empty in this example)
			// You could store data here for future interactions
			claimsToPersist: [],
		})
			.setProtectedHeader({ alg: "HS256", typ: "JWT" })
			.setIssuedAt()
			.setExpirationTime("1m") // JWT expires in 1 minute
			.sign(secretBuffer);

		console.log("Response JWT created successfully"); // Debug: Remove in production

		// Backend JWT Processing - Step 6.9: Build redirect URL with signed JWT
		// The frontend will redirect to this URL to complete the flow
		const redirectUrl = `${parsedJwt.redirectUrl}?session_token=${responseJwt}`;
		console.log("Redirect URL built:", `${redirectUrl.substring(0, 50)}...`); // Debug: Remove in production

		// Backend JWT Processing - Step 6.10: Return success response
		return Response.json({
			redirect: redirectUrl,
			// Include debug info in development only
			...(process.env.NODE_ENV === "development" && {
				debug: {
					claimsProcessed: Object.keys(data),
					jwtCreated: true,
				},
			}),
		});
	} catch (error) {
		// Backend JWT Processing - Step 6.11: Handle unexpected errors
		console.error("Unexpected error in interaction hook:", error);

		// Check if it's a validation error from Zod
		if (error instanceof z.ZodError) {
			return Response.json(
				{
					error: "Invalid request data",
					details: error.errors.map((e) => e.message).join(", "),
				},
				{ status: 400 },
			);
		}

		// Generic error response
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}
