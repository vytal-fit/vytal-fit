import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TRPCProvider } from "@/components/trpc-provider";
import MemberShell from "@/components/member-shell";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Vytal My",
  description: "Vytal member portal",
};

export default function MyLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <TRPCProvider>
          <I18nProvider>
            <MemberShell>{children}</MemberShell>
          </I18nProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
