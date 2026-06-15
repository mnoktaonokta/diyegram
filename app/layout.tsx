import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthSessionProvider } from "@/components/providers/session-provider";
import { DevServiceWorkerCleanup } from "@/components/pwa/dev-service-worker-cleanup";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "Diyegram";
const APP_DEFAULT_TITLE = "Diyegram";
const APP_TITLE_TEMPLATE = "%s | Diyegram";
const APP_DESCRIPTION =
  "Diyetisyen ve danışanlar için beslenme takip uygulaması";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#14b8a6" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <DevServiceWorkerCleanup />
        <ThemeProvider>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
