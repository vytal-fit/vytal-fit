import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Vytal · Intelligent management for gyms & CrossFit boxes";

// Social banner: the landing hero atmosphere (smoky training floor, green
// grade) with the brand wordmark and headline. Served for OG + Twitter cards.
export default async function Image() {
  const bg = await fetch(new URL("./og-bg.jpg", import.meta.url)).then((r) =>
    r.arrayBuffer()
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          backgroundColor: "#080c0a",
          padding: "56px 72px",
        }}
      >
        {/* Photo backdrop (satori accepts ArrayBuffer sources) */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img
          src={bg as unknown as string}
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
        {/* Grade: darken + green wash */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "linear-gradient(to bottom, rgba(4,8,6,0.72), rgba(4,8,6,0.38) 40%, rgba(4,8,6,0.82))",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "radial-gradient(900px 500px at 20% 110%, rgba(34,197,94,0.30), rgba(8,12,10,0) 60%)",
          }}
        />

        {/* Top row: mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="52" height="52" viewBox="0 0 64 64">
            <rect x="2" y="2" width="60" height="60" rx="16" fill="#22c55e" />
            <path
              d="M11 35 L23 35 L27 25 L32 45 L37 16 L41 35 L53 35"
              fill="none"
              stroke="#08120c"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "#ffffff" }}>Vytal</span>
            <span style={{ color: "rgba(255,255,255,0.55)" }}>.fit</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            Managing your fitness space
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              color: "#4ade80",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            has never been easier
          </div>
        </div>

        {/* Bottom row: tagline chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {["Members", "Classes", "Payments", "CRM", "Website", "Mobile App"].map(
            (chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: "1px solid rgba(34,197,94,0.45)",
                  backgroundColor: "rgba(8,12,10,0.55)",
                  color: "#dceee0",
                  fontSize: 22,
                  fontWeight: 500,
                }}
              >
                {chip}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
