import Link from "next/link";
import { openApiSpec } from "@vytal-fit/api";

const endpointGroups = [
  {
    title: "Auth",
    description: "Session bootstrap, sign-in, sign-up, and org membership lookup.",
    items: ["/api/auth/sign-in/email", "/api/auth/sign-up/email", "/api/auth/get-session"],
  },
  {
    title: "Session and spaces",
    description: "Active-space switching and space discovery for pro and mobile clients.",
    items: ["/api/session", "/api/spaces", "/api/spaces/{spaceId}"],
  },
  {
    title: "Athlete flows",
    description: "Bookings, records, and results for the member portal and mobile app.",
    items: ["/api/bookings", "/api/bookings/{bookingId}", "/api/records", "/api/results"],
  },
  {
    title: "Platform",
    description: "Deployment health and runtime status.",
    items: ["/api/health"],
  },
] as const;

const curlExamples = [
  {
    title: "Health check",
    command: "curl https://api.vytal.fit/api/health",
  },
  {
    title: "Sign in",
    command:
      "curl -X POST https://api.vytal.fit/api/auth/sign-in/email \\\n  -H 'content-type: application/json' \\\n  -d '{\"email\":\"jose@vytal.fit\",\"password\":\"VytalDemo2026!\"}'",
  },
  {
    title: "List spaces",
    command: "curl -H 'authorization: Bearer <token>' https://api.vytal.fit/api/spaces",
  },
] as const;

export default function DeveloperDocsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              API.VYTAL.FIT
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">Developer API</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              OpenAPI contract, auth details, and request examples for the public
              API origin. This surface is for integrations, mobile clients, and
              partner tooling.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/openapi"
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              OpenAPI JSON
            </Link>
            <Link
              href="/api/health"
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              Health
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[1.6fr_1fr] lg:px-8">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Contract</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Production origin: <code className="font-mono text-foreground">https://api.vytal.fit</code>
              . Web app origin: <code className="font-mono text-foreground">https://pro.vytal.fit</code>.
              Clients must send credentials and target the API origin explicitly.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {endpointGroups.map((group) => (
              <article key={group.title} className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {group.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{group.description}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {group.items.map((item) => (
                    <li key={item} className="font-mono text-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">OpenAPI</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The machine-readable spec is served from <code className="font-mono text-foreground">/openapi</code>.
              It documents the REST wrappers and the auth session surface used by
              the web and mobile clients.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-4 text-xs leading-5 text-foreground">
              {JSON.stringify(openApiSpec, null, 2)}
            </pre>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Examples</h2>
            <div className="mt-4 space-y-4">
              {curlExamples.map((example) => (
                <div key={example.title}>
                  <p className="text-sm font-medium">{example.title}</p>
                  <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-4 text-xs leading-5 text-foreground">
                    {example.command}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Notes</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>Better Auth sessions use secure cookies and bearer support.</li>
              <li>Org-scoped mutations require an active space on the session.</li>
              <li>The API is intended to stay separate from the pro web origin.</li>
              <li>Mobile should use <code className="font-mono text-foreground">EXPO_PUBLIC_API_URL</code>.</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
