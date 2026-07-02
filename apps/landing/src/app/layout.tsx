import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { BrandStyles } from "@vytal-fit/brand";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-accent",
});

const SITE_URL = "https://vytal.fit";
const SITE_DESC =
  "Vytal is the AI-powered platform to run CrossFit boxes, functional-training gyms and studios · members, classes, payments (MB Way, Multibanco, SEPA), WODs, CRM and a public website, in one place.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vytal · Intelligent management for gyms & CrossFit boxes",
    template: "%s · Vytal",
  },
  description: SITE_DESC,
  applicationName: "Vytal",
  keywords: [
    "gym management software",
    "CrossFit box software",
    "software de ginásio",
    "gestão de box CrossFit",
    "class booking",
    "member management",
    "MB Way",
    "Multibanco",
    "SEPA",
    "WOD tracking",
  ],
  authors: [{ name: "Vytal" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Vytal",
    title: "Vytal · Intelligent management for gyms & CrossFit boxes",
    description: SITE_DESC,
    locale: "pt_PT",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vytal · Intelligent management for gyms & CrossFit boxes",
    description: SITE_DESC,
  },
  robots: { index: true, follow: true },
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} antialiased`}>
        {/* Resolve theme before first paint: stored choice wins, else system. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("vytal-landing-theme");if(t==="light"||(!t&&matchMedia("(prefers-color-scheme: light)").matches))document.documentElement.classList.add("light")}catch(e){}',
          }}
        />
        <BrandStyles />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
