import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          The docs page you requested does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Back to docs
        </Link>
      </div>
    </main>
  );
}
