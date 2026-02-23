import type { Metadata, Viewport } from "next";
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

// Viewport settings for mobile optimization
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents accidental zoom on input focus
  viewportFit: "cover", // For notched phones (iPhone X+)
};

export const metadata: Metadata = {
  title: "Expert Team Workspace",
  description: "Bolla idéer med ditt AI-expertteam",
  // Web manifest for "Add to Home Screen" on mobile (Android/iOS)
  manifest: "/site.webmanifest",
  // apple-icon.png in app/ folder = iOS uses this when saving to home screen
  icons: {
    apple: "/apple-icon.png",
  },
  // Additional mobile-friendly meta tags
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Expert Team",
  },
  formatDetection: {
    telephone: false, // Prevents auto-linking phone numbers
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
