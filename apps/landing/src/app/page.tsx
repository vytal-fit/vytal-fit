import Link from "next/link";
import { ArrowRight, BookOpen, LayoutDashboard, Smartphone } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="page">
      <section className="shell">
        <div className="topline">
          <div className="brand">
            vytal <strong>fit</strong>
          </div>
          <div>landing.vytal.fit</div>
        </div>

        <div className="grid">
          <div className="hero">
            <div className="eyebrow">CrossFit and coaching software</div>
            <h1>One platform for the box, the coach, and the athlete.</h1>
            <p>
              The public site introduces Vytal. The product apps live on
              dedicated domains, and the docs are published separately.
            </p>
            <div className="actions">
              <Link className="button primary" href="https://pro.vytal.fit">
                <LayoutDashboard size={16} />
                Open pro
                <ArrowRight size={16} />
              </Link>
              <Link className="button" href="https://my.vytal.fit">
                <Smartphone size={16} />
                Open my
              </Link>
              <Link className="button" href="https://docs.vytal.fit">
                <BookOpen size={16} />
                Read docs
              </Link>
            </div>
          </div>

          <aside className="panel">
            <h2>What lives where</h2>
            <ul>
              <li>
                <strong>landing.vytal.fit</strong> for the public-facing site.
              </li>
              <li>
                <strong>pro.vytal.fit</strong> for gym operations and staff.
              </li>
              <li>
                <strong>my.vytal.fit</strong> for athletes and members.
              </li>
              <li>
                <strong>docs.vytal.fit</strong> for ReadMe-backed docs.
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
