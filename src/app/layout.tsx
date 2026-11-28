import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const displaySerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const travelSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FBF7EE",
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
    "An interactive, joyful road-trip expedition across India's iconic 3,810 KM national corridor (NH44) from Srinagar in the Himalaya down to Kanyakumari.",
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
      "An interactive, joyful road-trip expedition across India's iconic 3,810 KM national corridor (NH44) from Srinagar in the Himalaya down to Kanyakumari.",
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
      "An interactive, joyful road-trip expedition across India's iconic 3,810 KM national corridor (NH44) from Srinagar in the Himalaya down to Kanyakumari.",
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
    <html
      lang="en"
      className={`${displaySerif.variable} ${travelSans.variable} ${instrumentMono.variable}`}
    >
      <body className="min-h-screen bg-[#FBF7EE] font-sans text-[#102A33] antialiased">
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
