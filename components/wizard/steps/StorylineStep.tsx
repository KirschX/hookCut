"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { FootNav } from "@/components/wizard/FootNav";
import { Check } from "@/components/primitives/icons";
import { classNames } from "@/lib/utils";

export function StorylineStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { analysis, storylines, toggleStoryline, setStorylines } = useWizardStore();
  if (!analysis) return null; // guarded
  const selected = storylines;

  return (
    <div className="stage page-enter">
      <div className="eyebrow">Step 03 · Angle</div>
      <h1 className="page-title">
        어떤 <em>스토리라인</em>을 광고로 만들까요?
      </h1>
      <p className="lede">
        AI가 콘텐츠에서 광고화 가능한 방향을 뽑아냈습니다. 하나만 골라도 좋고, 두 개를 골라 비교해도 좋습니다.
        결과 단계에서 각각 다른 광고안이 만들어집니다.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {analysis.candidates.map((c) => {
          const on = selected.includes(c.id);
          return (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              className={classNames("card", "hover", on && "accent-selected")}
              onClick={() => toggleStoryline(c.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleStoryline(c.id);
                }
              }}
              style={{ padding: 22, cursor: "pointer", position: "relative" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--accent)",
                      letterSpacing: "0.16em",
                      marginBottom: 6,
                    }}
                  >
                    OPTION {c.id}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 24,
                      lineHeight: 1.15,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {c.title}
                  </div>
                </div>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    border: "1.5px solid " + (on ? "var(--accent)" : "var(--hairline-strong)"),
                    background: on ? "var(--accent)" : "transparent",
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                    transition: "all 150ms ease",
                    flexShrink: 0,
                  }}
                >
                  {on && <Check size={11} />}
                </div>
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  color: "var(--ink-2)",
                  lineHeight: 1.55,
                  marginBottom: 18,
                }}
              >
                {c.summary}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                <Row label="Target" value={c.target} />
                <Row label="Pros" value={c.pros.join(" · ")} accent />
                <Row label="Risk" value={c.risks.join(" · ")} warn />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-24" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span className="chip dot">{selected.length} 선택됨</span>
        <button
          type="button"
          className="btn ghost"
          onClick={() => setStorylines(analysis.candidates.map((c) => c.id))}
        >
          AI 추천 전체 사용
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => setStorylines([])}
        >
          초기화
        </button>
      </div>

      <FootNav
        onPrev={onPrev}
        onNext={onNext}
        nextLabel="타겟 설정"
        canNext={selected.length > 0}
      />
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr",
        gap: 12,
        alignItems: "baseline",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: warn ? "var(--warn)" : accent ? "var(--good)" : "var(--ink-4)",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{value}</div>
    </div>
  );
}
