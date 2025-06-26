"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { decodeJwt } from "jose";
import { z } from "zod";

const PRONOUN_OPTIONS = [
	"He/Him/His",
	"She/Her/Hers",
	"They/Them/Theirs",
	"Custom",
];

const passedClaims = z
	.object({
		name: z.string().optional(),
	})
	.optional();

export default function Home() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const sessionToken = useSearchParams().get("session_token");

	// Retrieve claims from the JWT without verifying the signature
	const decodedToken = useMemo(() => {
		if (!sessionToken) return null;

		try {
			return decodeJwt(sessionToken);
		} catch (err) {
			return null;
		}
	}, [sessionToken]);

	// Claims that are forwarded to the interaction hook
	const claims = useMemo(
		() => decodedToken && passedClaims.parse(decodedToken.claims),
		[decodedToken],
	);

	const [name, setName] = useState(claims?.name || "");
	const [pronouns, setPronouns] = useState("");
	const [customPronouns, setCustomPronouns] = useState("");

	const handleSubmit = useCallback(async () => {
		setIsLoading(true);
		if (!sessionToken || !name || !pronouns) {
			setIsLoading(false);
			return;
		}

		const response = await fetch("/api/interaction-hook", {
			method: "POST",
			body: JSON.stringify({
				token: sessionToken,
				data: {
					name,
					pronouns: pronouns === "Custom" ? customPronouns : pronouns,
				},
			}),
		});

		const { redirect } = await response.json();

		router.push(redirect);
		setIsLoading(false);
	}, [sessionToken, name, pronouns, customPronouns, router]);

	if (!sessionToken) {
		return (
			<main className="w-full h-full text-black bg-gray-100 flex-col flex gap-y-2 justify-center items-center">
				<h1 className="text-xl font-semibold">Session Token not found</h1>
				<p>
					A valid{" "}
					<code className="p-1 bg-gray-300 rounded-md">session_token</code>{" "}
					query param is required for this demo to function
				</p>
				<p>
					See{" "}
					<a
						className="underline text-blue-500"
						href="https://learn.mattr.global/tutorials/offer/openid-credential-provisioning/configure-interaction-hook/use"
					>
						using an interaction hook
					</a>
				</p>
			</main>
		);
	}

	return (
		<main className="w-full h-full text-black bg-gray-100 flex-col flex gap-y-2 justify-center items-center">
			<div className="flex flex-col gap-y-6 w-full max-w-[400px] p-6">
				<h1 className="font-bold text-3xl mb-2">
					Customise your employee profile
				</h1>
				<div className="space-y-2">
					<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Preferred name
					</label>
					<input
						value={name}
						onChange={(e) => setName(e.target.value)}
						className=" bg-white flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					/>
				</div>
				<div className="space-y-2">
					<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Pronouns
					</label>
					<select
						className="bg-white flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
						value={pronouns}
						required
						onChange={(e) => setPronouns(e.target.value)}
					>
						<option value="" disabled>
							Select your pronouns
						</option>
						{PRONOUN_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</div>
				{pronouns === "Custom" && (
					<div className="space-y-2">
						<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Custom pronouns
						</label>
						<input
							value={customPronouns}
							onChange={(e) => setCustomPronouns(e.target.value)}
							className=" bg-white flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>
				)}
				<button
					type="button"
					disabled={isLoading}
					className=" flex-1 px-6 font-semibold py-2 rounded-md bg-[#4943FF] text-white"
					onClick={handleSubmit}
				>
					{isLoading ? "Loading..." : "Submit"}
				</button>
			</div>
		</main>
	);
}
