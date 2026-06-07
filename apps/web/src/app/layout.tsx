import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "GeoPulse AI - Monitoramento de SEO, GEO & AEO",
  description: "Plataforma inteligente para monitoramento contínuo de visibilidade em buscadores de IA (AI Search Visibility), otimização para mecanismos generativos (GEO) e otimização de respostas diretas (AEO).",
  keywords: ["SEO", "GEO", "AEO", "AI Search", "Perplexity", "Gemini", "Google AI Overviews", "Visibility Score"],
  authors: [{ name: "GeoPulse AI Team" }],
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${inter.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50 font-sans selection:bg-violet-500/30 selection:text-violet-200">
        {children}
      </body>
    </html>
  );
}
