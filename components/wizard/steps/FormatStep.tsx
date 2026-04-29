"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { FORMATS, RATIOS, VARIANT_OPTIONS } from "@/schemas/format";
import { FootNav } from "@/components/wizard/FootNav";
import { classNames } from "@/lib/utils";
import type { FormatId } from "@/types";

export function FormatStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { format, ratio, variantMix, setFormat } = useWizardStore();

  return (
    <div className="stage page-enter">
      <div className="eyebrow">Step 05 · Format</div>
      <h1 className="page-title">
        어떤 <em>형식으로</em> 만들까요?
      </h1>
      <p className="lede">
        기본값은 ‘2컷 광고 2쌍’입니다. 안정적인 광고안과 실험적인 광고안을 함께 만들어 비교할 수 있습니다.
      </p>

      <h2 className="section-title">
        광고 형식 <span className="count">{FORMATS.length} OPTIONS</span>
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 28,
        }}
      >
        {FORMATS.map((f) => {
          const on = format === f.id;
          return (
            <div
              key={f.id}
              role="button"
              tabIndex={0}
              className={classNames("card", "hover", on && "accent-selected")}
              onClick={() => setFormat({ format: f.id })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFormat({ format: f.id });
                }
              }}
              style={{ padding: 18, cursor: "pointer", position: "relative" }}
            >
              {f.recommended && (
                <span
                  className="chip accent dot"
                  style={{ position: "absolute", top: 14, right: 14 }}
                >
                  추천
                </span>
              )}
              <FormatGlyph id={f.id} />
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  marginTop: 12,
                  letterSpacing: "-0.005em",
                }}
              >
                {f.label}
              </div>
              <div
                className="mono subtle"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  marginTop: 4,
                  textTransform: "uppercase",
                }}
              >
                {f.sub}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--ink-2)",
                  marginTop: 10,
                  lineHeight: 1.5,
                }}
              >
                {f.desc}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <h2 className="section-title">이미지 비율</h2>
          <div style={{ display: "flex", gap: 10 }}>
            {RATIOS.map((r) => {
              const on = ratio === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  className={classNames("tag", "accent", on && "is-on")}
                  onClick={() => setFormat({ ratio: r.id })}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 14px",
                    height: 78,
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: r.w,
                      height: r.h,
                      border: "1.5px solid currentColor",
                      borderRadius: 3,
                    }}
                  ></div>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h2 className="section-title">생성 전략</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {VARIANT_OPTIONS.map((o) => {
              const on = variantMix === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  className={classNames("card", "hover", on && "selected")}
                  onClick={() => setFormat({ variantMix: o.id })}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    border: "1px solid " + (on ? "var(--ink)" : "var(--hairline)"),
                    background: "var(--paper)",
                    display: "grid",
                    gridTemplateColumns: "16px 1fr",
                    gap: 12,
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 999,
                      border: "1.5px solid " + (on ? "var(--ink)" : "var(--hairline-strong)"),
                      background: on ? "var(--ink)" : "transparent",
                    }}
                  ></div>
                  <div>
                    <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{o.label}</div>
                    <div
                      className="mono subtle"
                      style={{
                        fontSize: 10.5,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginTop: 2,
                      }}
                    >
                      {o.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <FootNav onPrev={onPrev} onNext={onNext} nextLabel="전략 확인" />
    </div>
  );
}

function FormatGlyph({ id }: { id: FormatId }) {
  const c = "var(--ink-3)";
  const sw = 1.5;
  if (id === "2-2") {
    return (
      <svg width="68" height="36" viewBox="0 0 68 36" fill="none">
        <rect x="1" y="1" width="14" height="34" stroke={c} strokeWidth={sw} />
        <rect x="17" y="1" width="14" height="34" stroke={c} strokeWidth={sw} />
        <rect x="37" y="1" width="14" height="34" stroke={c} strokeWidth={sw} />
        <rect x="53" y="1" width="14" height="34" stroke={c} strokeWidth={sw} />
      </svg>
    );
  }
  if (id === "1-1")
    return (
      <svg width="68" height="36" viewBox="0 0 68 36">
        <rect x="1" y="1" width="66" height="34" stroke={c} strokeWidth={sw} fill="none" />
      </svg>
    );
  if (id === "1-3")
    return (
      <svg width="68" height="36" viewBox="0 0 68 36">
        <rect x="1" y="1" width="20" height="34" stroke={c} strokeWidth={sw} fill="none" />
        <rect x="24" y="1" width="20" height="34" stroke={c} strokeWidth={sw} fill="none" />
        <rect x="47" y="1" width="20" height="34" stroke={c} strokeWidth={sw} fill="none" />
      </svg>
    );
  if (id === "2-1")
    return (
      <svg width="68" height="36" viewBox="0 0 68 36">
        <rect x="1" y="1" width="32" height="34" stroke={c} strokeWidth={sw} fill="none" />
        <rect x="35" y="1" width="32" height="34" stroke={c} strokeWidth={sw} fill="none" />
      </svg>
    );
  if (id === "4-1")
    return (
      <svg width="68" height="36" viewBox="0 0 68 36">
        <rect x="1" y="1" width="32" height="16" stroke={c} strokeWidth={sw} fill="none" />
        <rect x="35" y="1" width="32" height="16" stroke={c} strokeWidth={sw} fill="none" />
        <rect x="1" y="19" width="32" height="16" stroke={c} strokeWidth={sw} fill="none" />
        <rect x="35" y="19" width="32" height="16" stroke={c} strokeWidth={sw} fill="none" />
      </svg>
    );
  return (
    <svg width="68" height="36" viewBox="0 0 68 36">
      <rect x="1" y="1" width="20" height="34" stroke={c} strokeWidth={sw} fill="none" />
      <rect x="24" y="1" width="20" height="34" stroke={c} strokeWidth={sw} fill="none" />
      <rect x="47" y="1" width="20" height="34" stroke={c} strokeWidth={sw} fill="none" />
    </svg>
  );
}
