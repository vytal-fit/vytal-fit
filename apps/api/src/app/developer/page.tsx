import Link from "next/link";
import { openApiSpec } from "@vytal-fit/api";

const endpointGroups = [
  {
    title: "Auth",
    description: "Session bootstrap, sign-in, sign-up, and org membership lookup.",
    items: ["/auth/sign-in/email", "/auth/sign-up/email", "/auth/session"],
  },
  {
    title: "Session and spaces",
    description: "Active-space switching and space discovery for pro and mobile clients.",
    items: ["/session", "/spaces", "/spaces/{spaceId}"],
  },
  {
    title: "Athlete flows",
    description: "Bookings, records, and results for the member portal and mobile app.",
    items: ["/bookings", "/bookings/{bookingId}", "/records", "/results"],
  },
  {
    title: "Platform",
    description: "Deployment health and runtime status.",
    items: ["/health"],
  },
] as const;

const curlExamples = [
  {
    title: "Health check",
    command: "curl https://api.vytal.fit/health",
  },
  {
    title: "Sign in",
    command:
      "curl -X POST https://api.vytal.fit/auth/sign-in/email \\\n  -H 'content-type: application/json' \\\n  -d '{\"email\":\"jose@vytal.fit\",\"password\":\"VytalDemo2026!\"}'",
  },
  {
    title: "List spaces",
    command: "curl -H 'authorization: Bearer <token>' https://api.vytal.fit/spaces",
  },
] as const;

export default function DeveloperDocsPage() {
  return (
    <main className="page">
      <section className="shell">
        <div className="topline">
          <div className="brand">
            vytal <strong>api</strong>
          </div>
          <Link href="https://docs.vytal.fit">Human docs</Link>
        </div>
        <div className="grid">
          <div className="stack">
            <div className="card">
              <p style={{ textTransform: "uppercase", letterSpacing: "0.22em", fontSize: 12, color: "rgba(239,246,242,.56)", margin: 0 }}>
                API.VYTAL.FIT
              </p>
              <h1 style={{ margin: "12px 0 14px", fontSize: "clamp(40px, 7vw, 76px)", lineHeight: 0.96, letterSpacing: "-0.05em" }}>
                Developer API
              </h1>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "rgba(239,246,242,.74)" }}>
                OpenAPI contract, auth details, and request examples for the public API origin.
                The canonical docs live on ReadMe at <code>docs.vytal.fit</code>.
              </p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              {endpointGroups.map((group) => (
                <article key={group.title} className="card">
                  <h2 style={{ marginTop: 0 }}>{group.title}</h2>
                  <p style={{ color: "rgba(239,246,242,.74)" }}>{group.description}</p>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item} style={{ fontFamily: "monospace" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="card">
              <h2 style={{ marginTop: 0 }}>OpenAPI</h2>
              <p style={{ color: "rgba(239,246,242,.74)" }}>
                The machine-readable spec is served from <code>/openapi</code>.
              </p>
              <pre className="code">{JSON.stringify(openApiSpec, null, 2)}</pre>
            </div>
          </div>

          <aside className="stack">
            <div className="card">
              <h2 style={{ marginTop: 0 }}>Examples</h2>
              {curlExamples.map((example) => (
                <div key={example.title} style={{ marginBottom: 16 }}>
                  <p style={{ margin: "0 0 8px", fontWeight: 600 }}>{example.title}</p>
                  <pre className="code">{example.command}</pre>
                </div>
              ))}
            </div>

            <div className="card">
              <h2 style={{ marginTop: 0 }}>Notes</h2>
              <ul>
                <li>Better Auth sessions use secure cookies and bearer support.</li>
                <li>Org-scoped mutations require an active space on the session.</li>
                <li>Mobile clients should point to the API origin directly.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
