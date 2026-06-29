import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TRPCProvider } from "@/components/trpc-provider";
import "./globals.css";

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
    <html lang="en">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
