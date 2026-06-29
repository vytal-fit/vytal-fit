import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { TRPCProvider } from "@/components/trpc-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeInitializer } from "@/providers/theme-initializer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <TRPCProvider>
          <I18nProvider>
            <AuthProvider>
              <ThemeInitializer />
              {children}
            </AuthProvider>
          </I18nProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
