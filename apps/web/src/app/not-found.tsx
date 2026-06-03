import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-vytal-bg px-4">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-vytal-green/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="text-[120px] font-bold leading-none tracking-tighter text-vytal-green/20 sm:text-[180px]">
          404
        </p>
        <h1 className="-mt-4 text-2xl font-bold text-vytal-text sm:text-3xl">
          Pagina nao encontrada
        </h1>
        <p className="mt-3 max-w-md text-sm text-vytal-muted">
          A pagina que procura nao existe ou foi movida. Verifique o endereco ou volte ao dashboard.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 flex items-center gap-2 rounded-lg bg-vytal-green px-6 py-3 text-sm font-semibold text-vytal-bg transition-colors hover:bg-vytal-green/90"
        >
          Voltar ao Dashboard
        </Link>
        <p className="mt-12 text-[10px] font-medium uppercase tracking-widest text-vytal-muted/40">
          Vytal
        </p>
      </div>
    </div>
  );
}
