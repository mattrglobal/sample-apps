import { Redirect } from "expo-router";

export default function AcceptIndexPage() {
	// No offer provided, redirect to home
	console.log("Accept page accessed without offer, redirecting to home");
	return <Redirect href="/" />;
}
