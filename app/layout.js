import { Inter, Cinzel_Decorative, Tiro_Devanagari_Sanskrit, Cormorant_Garamond, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const cinzel = Cinzel_Decorative({
  variable: "--font-cinzel",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

const tiro = Tiro_Devanagari_Sanskrit({
  variable: "--font-tiro",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://ramudu-sita.onrender.com"),
  title: "Ramudu Sita — Mythological Multiplayer Storytelling Game",
  description: "An Awwwards-quality cinematic storytelling multiplayer game platform inspired by the Ramayana.",
  openGraph: {
    title: "Ramudu Sita — Sacred Heritage Storytelling",
    description: "In the sacred halls, identities are veiled. Find Ramudu, seek Sita in this cinematic multiplayer experience.",
    url: "https://ramudu-sita.onrender.com",
    siteName: "Ramudu Sita",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ramudu Sita Social Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ramudu Sita — Sacred Heritage Storytelling",
    description: "In the sacred halls, identities are veiled. Find Ramudu, seek Sita in this cinematic multiplayer experience.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "e34a4fb60b15a46b",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${cormorant.variable} ${cinzel.variable} ${tiro.variable} antialiased`}
    >
      <body className="min-h-screen bg-sacred-ivory text-text-primary font-body flex flex-col selection:bg-heritage-gold selection:text-sacred-ivory">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
