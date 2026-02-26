import type { Metadata } from "next";
import "@coinbase/onchainkit/styles.css";
import "./globals.css";
import Providers from "./providers";
import { ToastProvider } from "./components/ui/ToastProvider";

export const metadata: Metadata = {
  title: "Quick Poll — Instant Social Voting on Base",
  description: "Create instant polls, vote freely, and see real-time results. A social polling mini app for the Base ecosystem.",
  openGraph: {
    title: "Quick Poll",
    description: "Create instant polls, vote freely, and see real-time results.",
    images: ["/og-image.png"],
  },
  other: {
    "base:app_id": "6984a8344609f1d788ad2bd6"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0A0A0A" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Providers>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
