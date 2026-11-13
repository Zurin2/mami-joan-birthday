import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Balloons from "@/components/Balloons";
import MusicToggle from "@/components/MusicToggle";
import "./globals.css";

// Self-hosted variable fonts (latin subset) — no network dependency at
// build/deploy time, unlike next/font/google which silently falls back to
// Arial when the Google Fonts fetch fails.
const dancing = localFont({
  src: "../fonts/dancing-script.woff2",
  weight: "400 700",
  variable: "--font-dancing",
  display: "swap",
});
const caveat = localFont({
  src: "../fonts/caveat.woff2",
  weight: "400 700",
  variable: "--font-caveat",
  display: "swap",
});
const nunito = localFont({
  src: "../fonts/nunito.woff2",
  weight: "200 1000",
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Happy Birthday, Mami Joan!",
  description: "A little website made with love, just for you.",
};

export const viewport: Viewport = {
  themeColor: "#fff8f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${dancing.variable} ${caveat.variable} ${nunito.variable} min-h-dvh font-body antialiased`}
      >
        <Balloons />
        <MusicToggle />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
