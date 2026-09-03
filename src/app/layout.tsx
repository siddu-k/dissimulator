import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DisasterLens — AI Disaster Risk Intelligence & Simulation Platform",
  description: "Next-generation hydro-meteorological disaster intelligence, real-world flood risk prediction, and what-if simulation engine powered by Google Gemini and Open-Meteo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-screen w-screen bg-slate-950 text-slate-100 antialiased font-sans overflow-hidden">
        {children}
      </body>
    </html>
  );
}
