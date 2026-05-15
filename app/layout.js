import { Inter, Cinzel_Decorative, Tiro_Devanagari_Sanskrit, Cormorant_Garamond, Manrope } from "next/font/google";
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
  title: "Ramudu Sita — Mythological Multiplayer Storytelling Game",
  description: "An Awwwards-quality cinematic storytelling multiplayer game platform inspired by the Ramayana.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${cormorant.variable} ${cinzel.variable} ${tiro.variable} antialiased`}
    >
      <body className="min-h-screen bg-sacred-ivory text-text-primary font-body flex flex-col selection:bg-heritage-gold selection:text-sacred-ivory">
        {children}
      </body>
    </html>
  );
}
