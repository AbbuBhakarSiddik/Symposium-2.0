import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SYMPOSIUM_NAME, COLLEGE_NAME } from "@/lib/eventsConfig";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: `${SYMPOSIUM_NAME} — ${COLLEGE_NAME}`,
  description: `Register for ${SYMPOSIUM_NAME}, the national-level technical symposium hosted by ${COLLEGE_NAME}.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0E14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-ink text-paper font-body antialiased selection:bg-signal selection:text-ink">
        {children}
      </body>
    </html>
  );
}
