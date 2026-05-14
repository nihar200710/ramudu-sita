import { Inter, Cinzel_Decorative, Tiro_Devanagari_Sanskrit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
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
      className={`${inter.variable} ${cinzel.variable} ${tiro.variable} antialiased`}
    >
      <body className="min-h-screen bg-myth-navy text-ancient-parchment font-body flex flex-col selection:bg-accent-gold selection:text-myth-navy">
        {children}
      </body>
    </html>
  );
}
