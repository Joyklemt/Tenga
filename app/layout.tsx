import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChatProvider } from "@/lib/ChatContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expert Team Workspace",
  description: "Bolla idéer med ditt AI-expertteam",
  // Web manifest for "Add to Home Screen" on mobile (Android/iOS)
  manifest: "/site.webmanifest",
  // apple-icon.png in app/ folder = iOS uses this when saving to home screen
  icons: {
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ChatProvider>
          {children}
        </ChatProvider>
      </body>
    </html>
  );
}
