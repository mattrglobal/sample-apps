# MATTR VII Interaction Hook Tutorial - Step by Step

This tutorial walks you through building an interaction hook for MATTR VII, with code snippets for each step that you can copy directly into your project.

## Prerequisites

- Node.js 20+ and npm
- MATTR VII tenant account
- ngrok installed for local development ([download here](https://ngrok.com/download))

## Section 1: Environment Configuration

Following the structure from [MATTR VII's web verification tutorial](https://learn.mattr.global/guides/remote/web/mdocs-tutorial), let's set up the development environment.

> **📦 Sample App Note**: If you're using the complete sample app from the repository, it includes a convenient `tunnel.js` helper script that automates the ngrok setup. You can use `npm run tunnel` instead of manually running ngrok. However, this tutorial shows the manual approach for those building from scratch.

### Step 1.1: Prerequisites

Before starting, ensure you have:
- Node.js 20+ and npm installed
- A MATTR VII tenant account
- ngrok installed for local development tunneling ([download here](https://ngrok.com/download))

### Step 1.2: Create the Next.js Project

```bash
# Create a new Next.js application with TypeScript and Tailwind CSS
npx create-next-app@latest interaction-hook-app --typescript --tailwind --app
cd interaction-hook-app
```

### Step 1.3: Install Additional Dependencies

```bash
# Install required packages for JWT handling
npm install jose zod
```

### Step 1.4: Configure MATTR VII Interaction Hook

1. Log into your MATTR VII tenant
2. Navigate to **Interactions** → **Interaction Hooks**
3. Create a new interaction hook:
   - **Name**: "Employee Profile Hook"
   - **URL**: Will be set after starting ngrok tunnel
   - **Method**: POST
4. **Important**: MATTR VII will generate and display a secret. Copy this secret - you'll need it for the next step.

### Step 1.5: Create Environment Configuration

Create `.env.local` file (following MATTR VII naming convention):

```env
# MATTR VII Interaction Hook Configuration

# Secret provided by MATTR VII when creating the interaction hook (base64 encoded)
INTERACTION_HOOK_SECRET="PASTE_SECRET_FROM_MATTR_VII_HERE"

# Your MATTR VII tenant URL
ISSUER_TENANT_URL="https://YOUR_TENANT.vii.REGION.mattr.global"

# Your application URL (will be set after starting ngrok)
APP_URL="https://YOUR_NGROK_URL.ngrok.io"
```

### Step 1.6: Configure Environment Variables

```bash
# Edit .env.local with your values:
# 1. Paste the secret from MATTR VII
# 2. Add your tenant URL  
# 3. APP_URL will be set after starting the tunnel
```

### Step 1.7: Set Up ngrok Tunnel

For local development, you'll need to expose your local server to the internet using ngrok.

#### Option 1: Manual ngrok Setup (Recommended for tutorials)

```bash
# Install ngrok globally (if not already installed)
# macOS: brew install ngrok
# Or download from: https://ngrok.com/download

# Terminal 1: Start ngrok tunnel
ngrok http 3000

# You'll see output like:
# Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

#### Option 2: Using the Sample App Helper (if using the complete sample app)

> **Note**: The complete sample app includes a `tunnel.js` helper script that automates the ngrok setup. If you're using the sample app, you can run `npm run tunnel` instead of manually starting ngrok.

### Step 1.8: Complete the Configuration

1. Copy the ngrok URL from the output (e.g., `https://abc123.ngrok-free.app`)
2. Update `APP_URL` in `.env.local` with this URL
3. Go back to MATTR VII and update your interaction hook URL to:
   `https://abc123.ngrok-free.app/api/interaction-hook`
4. Save the interaction hook configuration in MATTR VII

## Section 2: Frontend Component Setup

### Step 2.1: Create Basic Page Structure

Create `src/app/page.tsx`:

```typescript
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { decodeJwt } from "jose";
import { z } from "zod";

export default function Home() {
  // Frontend Setup - Step 2.3: Initialize Next.js routing and URL parameters
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Frontend Setup - Step 2.4: Extract session token from URL query parameter
  const sessionToken = searchParams.get("session_token");

  return (
    <main className="w-full h-full text-black bg-gray-100 flex-col flex gap-y-2 justify-center items-center p-8">
      <div>Interaction Hook Component</div>
    </main>
  );
}
```

### Step 2.2: Define Constants and Schema

Add at the top of `page.tsx`:

```typescript
// Frontend Setup - Step 2.1: Define pronoun options for the form
const PRONOUN_OPTIONS = [
  "He/Him/His",
  "She/Her/Hers",
  "They/Them/Theirs",
  "Custom",
];

// Frontend Setup - Step 2.2: Define schema for claims passed from MATTR VII
const passedClaims = z
  .object({
    name: z.string().optional(), // Pre-filled name if available
  })
  .optional();
```

### Step 2.5: Handle Missing Session Token

Replace the return statement in `page.tsx`:

```typescript
// Frontend Component Setup - Step 2.5: Handle missing session token
if (!sessionToken) {
  return (
    <main className="w-full h-full text-black bg-gray-100 flex-col flex gap-y-4 justify-center items-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          ⚠️ Session Token Missing
        </h1>
        <p className="mb-4">
          This page requires a valid session token from MATTR VII. The token
          should be provided as a URL parameter.
        </p>
        <div className="bg-gray-200 p-3 rounded-lg mb-4">
          <code className="text-sm">?session_token=eyJhbGc...</code>
        </div>
        <p className="text-sm text-gray-600">
          To test this interaction hook, you need to:
        </p>
        <ol className="text-sm text-left mt-2 space-y-1">
          <li>1. Configure the interaction hook in MATTR VII</li>
          <li>2. Initiate a credential issuance flow</li>
          <li>3. MATTR VII will redirect here with the token</li>
        </ol>
      </div>
    </main>
  );
}
```

## 🧪 TEST POINT 1: Basic Setup Test

At this point, you can test your basic setup:

```bash
# Start the development server
npm run dev

# Visit in browser
open http://localhost:3000

# You should see the "Session Token Missing" error page
# Try with a test token
open http://localhost:3000?session_token=test

# You should see "Interaction Hook Component"
```

## Section 3: Form UI Implementation

### Step 3.1: Add State Management

Add to the component (after the routing setup):

```typescript
// Form UI Implementation - Step 3.1: Set up form state management
const [name, setName] = useState("");
const [pronouns, setPronouns] = useState("");
const [customPronouns, setCustomPronouns] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Step 3.2-3.3: Decode JWT and Extract Claims

Add after state management:

```typescript
// Form UI Implementation - Step 3.2: Decode JWT to extract pre-filled claims
const decodedToken = useMemo(() => {
  if (!sessionToken) return null;

  try {
    console.log("Decoding session token..."); // Debug: Remove in production
    return decodeJwt(sessionToken);
  } catch (err) {
    console.error("Failed to decode token:", err); // Debug: Remove in production
    return null;
  }
}, [sessionToken]);

// Form UI Implementation - Step 3.3: Extract and validate claims from decoded token
const claims = useMemo(() => {
  if (!decodedToken) return null;
  
  try {
    const parsed = passedClaims.parse(decodedToken.claims);
    console.log("Extracted claims:", parsed); // Debug: Remove in production
    return parsed;
  } catch (err) {
    console.error("Failed to parse claims:", err); // Debug: Remove in production
    return null;
  }
}, [decodedToken]);
```

### Step 3.4: Pre-fill Form Data

Add after claims extraction:

```typescript
// Form UI Implementation - Step 3.4: Pre-fill form with claims from MATTR VII
useState(() => {
  if (claims?.name) {
    setName(claims.name);
  }
});
```

### Step 3.5-3.9: Create the Form UI

Replace the main return statement (when sessionToken exists):

```typescript
// Form UI Implementation - Step 3.5: Render the main form interface
return (
  <main className="w-full h-full text-black bg-gray-100 flex-col flex gap-y-2 justify-center items-center p-8">
    <div className="flex flex-col gap-y-6 w-full max-w-[400px] bg-white rounded-lg shadow-lg p-8">
      {/* Form Header */}
      <div>
        <h1 className="font-bold text-2xl mb-2">
          Employee Profile Customization
        </h1>
        <p className="text-sm text-gray-600">
          Please provide your information to complete credential issuance
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Form UI Implementation - Step 3.6: Preferred name input field */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Preferred Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your preferred name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          This will appear on your credential
        </p>
      </div>

      {/* Form UI Implementation - Step 3.7: Pronouns selection field */}
      <div className="space-y-2">
        <label
          htmlFor="pronouns"
          className="text-sm font-medium text-gray-700"
        >
          Pronouns *
        </label>
        <select
          id="pronouns"
          value={pronouns}
          onChange={(e) => setPronouns(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          <option value="">Select your pronouns</option>
          {PRONOUN_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Form UI Implementation - Step 3.8: Custom pronouns input (conditional) */}
      {pronouns === "Custom" && (
        <div className="space-y-2">
          <label
            htmlFor="customPronouns"
            className="text-sm font-medium text-gray-700"
          >
            Custom Pronouns *
          </label>
          <input
            id="customPronouns"
            type="text"
            value={customPronouns}
            onChange={(e) => setCustomPronouns(e.target.value)}
            placeholder="e.g., Ze/Zir/Zirs"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Form UI Implementation - Step 3.9: Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {isLoading ? "Processing..." : "Complete Profile"}
      </button>
    </div>
  </main>
);
```

## 🧪 TEST POINT 2: Frontend UI Test

You can now test the complete UI without the backend:

```bash
# Start the app
npm run dev

# Visit with a test token
open http://localhost:3000?session_token=test

# You should see:
# - The form with all fields
# - Name and pronouns inputs working
# - Custom pronouns field appearing when "Custom" is selected
# - Submit button (clicking will fail - backend not implemented yet)
```

## Section 4: Form Submission Handler

### Step 4.1-4.7: Create Submit Handler

Add before the return statements:

```typescript
// Form Submission Handler - Step 4.1: Handle form submission
const handleSubmit = useCallback(async () => {
  console.log("Starting form submission..."); // Debug: Remove in production
  
  // Form Submission Handler - Step 4.2: Clear any previous errors
  setError(null);
  setIsLoading(true);

  // Form Submission Handler - Step 4.3: Validate session token exists
  if (!sessionToken) {
    setError(
      "Session token is missing. Please restart the credential issuance flow.",
    );
    setIsLoading(false);
    return;
  }

  // Form Submission Handler - Step 4.4: Validate required fields
  if (!name.trim()) {
    setError("Please enter your preferred name");
    setIsLoading(false);
    return;
  }
  if (!pronouns) {
    setError("Please select your pronouns");
    setIsLoading(false);
    return;
  }
  if (pronouns === "Custom" && !customPronouns.trim()) {
    setError("Please enter your custom pronouns");
    setIsLoading(false);
    return;
  }

  try {
    // Form Submission Handler - Step 4.5: Send data to backend API
    console.log("Sending data to backend..."); // Debug: Remove in production
    const response = await fetch("/api/interaction-hook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: sessionToken,
        data: {
          name: name.trim(),
          pronouns: pronouns === "Custom" ? customPronouns.trim() : pronouns,
        },
      }),
    });

    // Form Submission Handler - Step 4.6: Handle API response
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();
    console.log("Received redirect URL:", result.redirect); // Debug: Remove in production

    // Form Submission Handler - Step 4.7: Redirect back to MATTR VII
    router.push(result.redirect);
  } catch (err) {
    console.error("Submission failed:", err); // Debug: Remove in production
    setError("Failed to submit form. Please try again.");
    setIsLoading(false);
  }
}, [sessionToken, name, pronouns, customPronouns, router]);
```

## Section 5: Backend API Route - Initial Setup

### Step 5.1-5.2: Create API Route with Schemas

Create `src/app/api/interaction-hook/route.ts`:

```typescript
import { z } from "zod";
import { SignJWT, jwtVerify, type JWTVerifyResult } from "jose";

// Backend API Route - Step 5.1: Define validation schema for incoming request
const requestSchema = z.object({
  data: z.object({
    name: z.string().min(1, { message: "Name is required" }),
    pronouns: z.string().min(1, { message: "Pronouns are required" }),
  }),
  token: z.string().min(1, { message: "Session token is required" }),
});

// Backend API Route - Step 5.2: Define validation schema for JWT payload
const jwtSchema = z.object({
  state: z.string().min(1, { message: "State parameter is required" }),
  redirectUrl: z.string().url({ message: "Invalid redirect URL" }),
});

// Backend JWT Processing - Step 6.1: Main API handler function
export async function POST(request: Request) {
  console.log("Interaction hook API called"); // Debug: Remove in production

  try {
    // Implementation will go here
    return Response.json({ message: "Not implemented" }, { status: 501 });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

## Section 6: Backend JWT Processing - Full Implementation

### Step 6.2-6.11: Complete Backend Implementation

Replace the POST function in `route.ts`:

```typescript
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
    const secretBuffer = Buffer.from(secret, "base64");
    console.log("Secret loaded and decoded"); // Debug: Remove in production

    // Backend JWT Processing - Step 6.6: Verify the JWT from MATTR VII
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
      claimsToPersist: [],
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("1m") // JWT expires in 1 minute
      .sign(secretBuffer);

    console.log("Response JWT created successfully"); // Debug: Remove in production

    // Backend JWT Processing - Step 6.9: Build redirect URL with signed JWT
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
```

## 🧪 TEST POINT 3: Backend Mock Test

Test the backend without MATTR VII:

### Create a Test JWT

1. Go to [jwt.io](https://jwt.io)
2. Set algorithm to HS256
3. Add this payload:
```json
{
  "state": "test-state-123",
  "redirectUrl": "https://example.com/callback",
  "iss": "https://your-tenant.vii.au01.mattr.global",
  "aud": "https://your-app-url.ngrok.io",
  "iat": 1234567890,
  "exp": 9999999999
}
```
4. Sign with your base64 secret (check "secret base64 encoded")

### Test with curl

```bash
curl -X POST http://localhost:3000/api/interaction-hook \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TEST_JWT",
    "data": {
      "name": "Test User",
      "pronouns": "They/Them"
    }
  }'

# You should receive a response like:
# {"redirect": "https://example.com/callback?session_token=..."}
```

## Section 7: End-to-End Testing

### Step 7.1: Verify MATTR VII Configuration

At this point, you should have already:
1. Created an interaction hook in MATTR VII (from Step 1.4)
2. Configured it with your ngrok URL
3. Saved the secret in your `.env.local` file

If not, go back to Section 1 and complete the setup.

### Step 7.2: Start Local Services

```bash
# Terminal 1: Ensure ngrok tunnel is running
ngrok http 3000
# (or npm run tunnel if using the sample app helper)

# Terminal 2: Start the app
npm run dev

# Verify:
# - APP_URL in .env.local matches your ngrok URL
# - MATTR VII interaction hook URL is set to: {ngrok_url}/api/interaction-hook
```

### Step 7.3: Test Complete Flow

1. Initiate credential issuance in MATTR VII
2. You'll be redirected to your interaction hook
3. Fill out the form
4. Submit to complete the flow
5. Verify the credential contains your custom claims

## 🧪 TEST POINT 4: Full Integration Test

Complete end-to-end test checklist:

- [ ] ngrok tunnel is running
- [ ] APP_URL in .env.local matches ngrok URL
- [ ] Interaction hook configured in MATTR VII with correct URL
- [ ] Secret from MATTR VII is correctly saved in .env.local
- [ ] Credential issuance flow redirects to your app
- [ ] Form displays and pre-fills data (if available)
- [ ] Form submission succeeds
- [ ] Redirect back to MATTR VII works
- [ ] Issued credential contains custom claims (name and pronouns)

## Complete Code Files

The complete, working code for all files is available in the tutorial repository. Each file contains numbered step comments matching this tutorial for easy reference.

---

**Congratulations!** You've successfully built a MATTR VII interaction hook that can collect custom information during credential issuance.