"use client";

/**
 * MATTR VII INTERACTION HOOK TUTORIAL - FRONTEND COMPONENT
 *
 * This component demonstrates how to build an interaction hook for MATTR VII.
 * An interaction hook allows you to inject custom UI and logic into the
 * credential issuance flow, enabling you to:
 * - Collect additional information from users
 * - Validate or transform data before credential issuance
 * - Create a customized issuance experience
 *
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { decodeJwt } from "jose";
import { z } from "zod";

// Frontend Setup - Step 2.1: Define pronoun options for the form
const PRONOUN_OPTIONS = [
	"He/Him/His",
	"She/Her/Hers",
	"They/Them/Theirs",
	"Custom",
];

// Frontend Setup - Step 2.2: Define schema for claims passed from MATTR VII
// These are claims that MATTR VII forwards to your interaction hook
const passedClaims = z
	.object({
		name: z.string().optional(), // Pre-filled name if available
	})
	.optional();

export default function Home() {
	// Frontend Setup - Step 2.3: Initialize Next.js routing and URL parameters
	const router = useRouter();
	const searchParams = useSearchParams();

	// Frontend Setup - Step 2.4: Extract session token from URL query parameter
	// Example URL: https://your-app.com?session_token=eyJhbGc...
	const sessionToken = searchParams.get("session_token");

	// Form UI Implementation - Step 3.1: Set up form state management
	// Using simple useState for tutorial clarity (no complex state management)
	const [name, setName] = useState("");
	const [pronouns, setPronouns] = useState("");
	const [customPronouns, setCustomPronouns] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Form UI Implementation - Step 3.2: Decode JWT to extract pre-filled claims
	// Note: We decode without verification here because:
	// 1. The frontend doesn't have access to the secret
	// 2. Verification happens server-side in the API route
	// 3. We only use this for displaying initial values
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

	// Form UI Implementation - Step 3.4: Pre-fill form with claims from MATTR VII
	// This runs once when claims are loaded
	useState(() => {
		if (claims?.name) {
			setName(claims.name);
		}
	});

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
			// The redirect URL contains the signed JWT response
			router.push(result.redirect);
		} catch (err) {
			console.error("Submission failed:", err); // Debug: Remove in production
			setError("Failed to submit form. Please try again.");
			setIsLoading(false);
		}
	}, [sessionToken, name, pronouns, customPronouns, router]);

	// Frontend Component Setup - Step 2.5: Handle missing session token
	// This renders when the user accesses the page without proper authentication
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
					<a
						className="inline-block mt-4 text-blue-600 underline text-sm"
						href="https://learn.mattr.global/tutorials/offer/openid-credential-provisioning/configure-interaction-hook/use"
						target="_blank"
						rel="noopener noreferrer"
					>
						View Tutorial Documentation →
					</a>
				</div>
			</main>
		);
	}

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

				{/* Debug Information - Remove in production */}
				{process.env.NODE_ENV === "development" && (
					<div className="mt-4 p-3 bg-gray-100 rounded text-xs">
						<p className="font-semibold mb-1">Debug Info:</p>
						<p>Token present: {sessionToken ? "Yes" : "No"}</p>
						<p>Claims extracted: {claims ? "Yes" : "No"}</p>
						{claims?.name && <p>Pre-filled name: {claims.name}</p>}
					</div>
				)}
			</div>
		</main>
	);
}
