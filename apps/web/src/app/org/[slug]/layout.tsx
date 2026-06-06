"use client";

import { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "", label: "Início" },
  { href: "/schedule", label: "Horário" },
  { href: "/pricing", label: "Preços" },
  { href: "/shop", label: "Loja" },
  { href: "/team", label: "Equipa" },
  { href: "/contact", label: "Contacto" },
];

export default function OrgPublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const pathname = usePathname();
  const basePath = `/@${slug}`;

  return (
    <div className="min-h-screen bg-vytal-bg">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-vytal-border bg-vytal-bg2/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href={basePath} className="text-sm font-bold text-vytal-green">
            vytal.fit/<span className="text-vytal-text">@{slug}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const fullHref = `${basePath}${item.href}`;
              const isActive = item.href === ""
                ? pathname === basePath || pathname === `/org/${slug}`
                : pathname === fullHref || pathname === `/org/${slug}${item.href}`;

              return (
                <Link
                  key={item.href}
                  href={fullHref}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-vytal-green/10 text-vytal-green"
                      : "text-vytal-muted hover:text-vytal-text hover:bg-vytal-bg3"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/login"
            className="rounded-lg bg-vytal-green px-4 py-1.5 text-xs font-semibold text-vytal-bg hover:bg-vytal-green/90"
          >
            Entrar
          </Link>
        </div>

        {/* Mobile nav */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-vytal-border/50 px-4 py-2 md:hidden">
          {NAV_ITEMS.map((item) => {
            const fullHref = `${basePath}${item.href}`;
            const isActive = item.href === ""
              ? pathname === basePath || pathname === `/org/${slug}`
              : pathname === fullHref || pathname === `/org/${slug}${item.href}`;

            return (
              <Link
                key={item.href}
                href={fullHref}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                  isActive
                    ? "bg-vytal-green/10 text-vytal-green"
                    : "text-vytal-muted"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Content */}
      {children}

      {/* Footer */}
      <footer className="border-t border-vytal-border bg-vytal-bg2 py-8">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-vytal-muted">
              Powered by{" "}
              <Link href="/" className="font-semibold text-vytal-green hover:underline">
                Vytal
              </Link>
            </p>
            <p className="text-[10px] text-vytal-muted/60">
              vytal.fit/@{slug}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
