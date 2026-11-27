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
  themeColor: "#091522",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://grand-bharat-highway.vercel.app"),
  title: {
    default: "The Grand Bharat Highway | Kashmir to Kanyakumari (NH44)",
    template: "%s | The Grand Bharat Highway",
  },
  description:
    "An interactive, cinematic road expedition across India's premier 3,810 KM national corridor (NH44) from Srinagar in the Himalaya down to Kanyakumari.",
  keywords: [
    "India Road Trip",
    "Grand Bharat Highway",
    "Kashmir to Kanyakumari",
    "NH 44",
    "National Highway 44",
    "Expedition Route 66 India",
    "Interactive Highway Map",
    "Srinagar to Kanyakumari",
  ],
  authors: [{ name: "The Grand Bharat Highway" }],
  openGraph: {
    title: "The Grand Bharat Highway | Kashmir to Kanyakumari (NH44)",
    description:
      "An interactive, cinematic road expedition across India's premier 3,810 KM national corridor (NH44) from Srinagar down to Kanyakumari.",
    url: "https://grand-bharat-highway.vercel.app",
    siteName: "The Grand Bharat Highway",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1200&q=85",
        width: 1200,
        height: 630,
        alt: "The Grand Bharat Highway - Kashmir to Kanyakumari NH44 Corridor Expedition",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Grand Bharat Highway | Kashmir to Kanyakumari (NH44)",
    description:
      "An interactive, cinematic road expedition across India's premier 3,810 KM national corridor (NH44) from Srinagar down to Kanyakumari.",
    images: ["https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1200&q=85"],
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
      <body className="min-h-screen bg-[#091522] font-sans text-[#F2EBDD] antialiased">
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
