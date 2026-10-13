import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Interaction Hook Demo | MATTR Labs",
  description: "Developed and maintained by the MATTR Labs team.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* The page reads the interaction hook params with useSearchParams(). */}
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
