import { ImageResponse } from "next/og";

export const alt = "UMEXA, a creative production studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The default share image. Case studies and services use their own artwork instead. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#84b4e6",
        color: "#12233d",
      }}
    >
      <div style={{ display: "flex", fontSize: 44, fontWeight: 700, letterSpacing: -2 }}>
        UME<span style={{ color: "#dd110a" }}>X</span>A
      </div>
      <div
        style={{
          display: "flex",
          maxWidth: 980,
          fontSize: 92,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: -4,
        }}
      >
        We turn bold ideas into powerful visual experiences.
      </div>
    </div>,
    size,
  );
}
