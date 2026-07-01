import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Vytal — Intelligent management for gyms & CrossFit boxes";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#080c0a",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          position: "relative",
        }}
      >
        {/* Green radial glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "radial-gradient(900px 600px at 50% 34%, rgba(34,197,94,0.22), rgba(8,12,10,0) 70%)",
          }}
        />

        {/* Mark */}
        <div style={{ display: "flex", marginBottom: 40 }}>
          <svg width="140" height="140" viewBox="0 0 64 64">
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
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "#dceee0" }}>Vyta</span>
          <span style={{ color: "#22c55e" }}>l</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 34,
            fontWeight: 500,
            color: "#6b8c72",
            letterSpacing: "-0.01em",
          }}
        >
          Intelligent management for gyms &amp; CrossFit boxes
        </div>
      </div>
    ),
    { ...size }
  );
}
