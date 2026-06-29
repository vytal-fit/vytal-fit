import Link from "next/link";
import { BookOpen, FileJson, ShieldCheck, ArrowRight } from "lucide-react";

export default function ApiHomePage() {
  return (
    <main className="page">
      <section className="shell">
        <div className="topline">
          <div className="brand">
            vytal <strong>api</strong>
          </div>
          <div>api.vytal.fit</div>
        </div>

        <div className="grid">
          <div className="hero stack">
            <div>
              <h1>API, auth, and developer docs.</h1>
              <p>
                This origin owns the public contract. The human docs live on
                ReadMe at docs.vytal.fit. The machine contract is here.
              </p>
            </div>

            <div className="actions">
              <Link className="button primary" href="/developer">
                <BookOpen size={16} />
                Developer docs
                <ArrowRight size={16} />
              </Link>
              <Link className="button" href="/openapi">
                <FileJson size={16} />
                OpenAPI
              </Link>
              <Link className="button" href="/health">
                <ShieldCheck size={16} />
                Health
              </Link>
            </div>

            <div className="card">
              <h2>Public contract</h2>
              <ul>
                <li>Auth and session management</li>
                <li>Organization and active-space selection</li>
                <li>Bookings, records, and results</li>
                <li>OpenAPI 3.1 output for integrations</li>
              </ul>
            </div>
          </div>

          <aside className="panel stack">
            <div>
              <h2>Useful endpoints</h2>
              <div className="code">/auth/session
/session
/spaces
/bookings
/records
/results
/health
/openapi</div>
            </div>
            <div>
              <h2>ReadMe</h2>
              <p>
                The markdown source for human docs lives in
                <code> apps/api/readme</code> and syncs automatically.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
