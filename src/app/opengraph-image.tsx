import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Dezix AI — Unified AI Model Gateway";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          background: "linear-gradient(135deg, #1C1917 0%, #292524 100%)",
          position: "relative",
        }}
      >
        {/* Decorative gradient circles */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,112,243,0.3) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,180,216,0.2) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Brand name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #0070F3 0%, #00B4D8 100%)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 20,
            display: "flex",
          }}
        >
          Dezix AI
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: "#E7E5E4",
            marginBottom: 16,
            display: "flex",
          }}
        >
          Unified AI Model Gateway
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 18,
            color: "#A8A29E",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.5,
            display: "flex",
          }}
        >
          One API Key · 90+ Models · 13+ Providers
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "#78716C",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22C55E",
                display: "flex",
              }}
            />
            OpenAI Compatible
          </div>
          <div style={{ fontSize: 14, color: "#78716C", display: "flex" }}>
            Pay As You Go
          </div>
          <div style={{ fontSize: 14, color: "#78716C", display: "flex" }}>
            dezix-ai.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
