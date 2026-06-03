import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeInitializer } from "@/providers/theme-initializer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Vytal",
  description: "Intelligent management platform for CrossFit boxes and functional training gyms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className="dark" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}>
        <I18nProvider>
          <AuthProvider>
            <ThemeInitializer />
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
