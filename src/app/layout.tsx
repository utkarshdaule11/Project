import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#E6F4FA",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://grand-bharat-highway.vercel.app"),
  title: {
    default: "The Grand Bharat Highway | Kashmir to Kanyakumari Expedition",
    template: "%s | The Grand Bharat Highway",
  },
  description:
    "An interactive scroll-driven road trip across 6 historic Indian states along NH 44 from Srinagar down to Kanyakumari.",
  keywords: [
    "India Road Trip",
    "Route 66 India",
    "Kashmir to Kanyakumari",
    "NH 44",
    "Interactive Highway Map",
    "Subcontinental Expedition",
  ],
  authors: [{ name: "The Grand Bharat Highway" }],
  openGraph: {
    title: "The Grand Bharat Highway | Kashmir to Kanyakumari Expedition",
    description:
      "An interactive scroll-driven road trip across 6 historic Indian states along NH 44 from Srinagar down to Kanyakumari.",
    url: "https://grand-bharat-highway.vercel.app",
    siteName: "The Grand Bharat Highway",
    images: [
      {
        url: "/images/hero-compass-fallback.svg",
        width: 1200,
        height: 630,
        alt: "The Grand Bharat Highway - Kashmir to Kanyakumari Route Map and Compass",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Grand Bharat Highway | Kashmir to Kanyakumari Expedition",
    description:
      "An interactive scroll-driven road trip across 6 historic Indian states along NH 44 from Srinagar down to Kanyakumari.",
    images: ["/images/hero-compass-fallback.svg"],
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-background font-sans text-text antialiased">
        {children}
      </body>
    </html>
  );
}
