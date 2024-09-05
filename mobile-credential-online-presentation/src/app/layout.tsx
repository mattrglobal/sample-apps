import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MATTRLogo, GitHubLogo } from "@/components/header-logo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mobile Credential Online Presentation",
  description: "Sample app created by MATTR Labs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
        <header className="flex justify-between p-4 lg:p-6 bg-white border-b-2 backdrop-blur-lg">
          <MATTRLogo />
          <GitHubLogo />
        </header>
        <main className="min-h-screen">
          <div
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.7), #fff), url("/pattern-mesh-tile.svg")`,
              backgroundSize: "auto, 3rem",
              backgroundPosition: "0 0, 0 0",
              backgroundRepeat: "no-repeat, repeat",
            }}
            className={"block min-h-full w-full absolute top-0 left-0 bg-opacity-20 -z-10"}
          />
          {children}
        </main>
      </body>
    </html>
  );
}
