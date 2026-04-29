import { classNames } from "@/lib/utils";

type Tone = "dark" | "warm" | "";
type Variant = "stable" | "experimental";

export function SampleAd({
  headline,
  sub,
  cta,
  tone,
  captions,
  variant,
}: {
  headline: string;
  sub?: string;
  cta: string;
  tone: Tone;
  captions: string[];
  variant: Variant;
}) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span className={classNames("chip", "dot", variant === "experimental" && "accent")}>
          {variant === "stable" ? "안정적 광고안" : "실험적 광고안"}
        </span>
        <span className="mono subtle" style={{ fontSize: 10, letterSpacing: "0.1em" }}>
          2-CUT · 4:5
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {captions.map((c, i) => (
          <div
            key={i}
            className={classNames("ad-image", tone)}
            style={{ aspectRatio: "4/5" }}
          >
            <div className="label">
              <b>CUT {i + 1}</b>
              {c}
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-16"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 22,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}
      >
        “{headline}”
      </div>
      {sub && (
        <div className="mt-8 muted" style={{ fontSize: 13.5 }}>
          {sub}
        </div>
      )}
      <div
        className="mt-16"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          className="mono subtle"
          style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          CTA
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{cta} →</span>
      </div>
    </div>
  );
}
