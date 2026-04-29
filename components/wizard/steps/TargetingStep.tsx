"use client";

import { useEffect } from "react";
import { useWizardStore } from "@/stores/wizard-store";
import { TARGETING_QUESTIONS, DEFAULT_TARGETING } from "@/schemas/targeting";
import { FootNav } from "@/components/wizard/FootNav";
import { Check } from "@/components/primitives/icons";
import { classNames } from "@/lib/utils";
import type { Targeting } from "@/types";

export function TargetingStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { targeting, setTargeting } = useWizardStore();

  useEffect(() => {
    if (!targeting) setTargeting(DEFAULT_TARGETING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t: Targeting = targeting ?? DEFAULT_TARGETING;

  const setField = (key: keyof Targeting, val: string) => {
    const def = TARGETING_QUESTIONS.find((q) => q.key === key)!;
    let next: Targeting;
    if (def.multi) {
      const cur = (t[key] as string[]) ?? [];
      const nv = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val];
      next = { ...t, [key]: nv };
    } else {
      next = { ...t, [key]: val };
    }
    setTargeting(next);
  };

  return (
    <div className="stage page-enter">
      <div className="eyebrow">Step 04 · Audience & Tone</div>
      <h1 className="page-title">
        누구에게, <em>어떤 톤으로</em> 보여줄까요?
      </h1>
      <p className="lede">
        선택형으로 묻습니다. 답은 광고 카피, 컷 구성, 색감, 정보량까지 모두 영향을 줍니다.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {TARGETING_QUESTIONS.map((q, i) => {
          const v = t[q.key];
          const warn = "warn" in q && q.warn;
          return (
            <div key={q.key} className="card" style={{ padding: 22 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 14,
                }}
              >
                <div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10.5,
                      color: "var(--ink-4)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    Q{String(i + 1).padStart(2, "0")} {q.multi ? "· 복수 선택" : "· 단일 선택"}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 21,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {q.label}
                  </div>
                </div>
                {warn && <span className="chip warn">주의 항목</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {q.opts.map((o) => {
                  const on = q.multi ? (v as string[]).includes(o) : v === o;
                  return (
                    <button
                      key={o}
                      type="button"
                      className={classNames(
                        "tag",
                        warn ? "warn-tag" : "accent",
                        on && "is-on",
                      )}
                      onClick={() => setField(q.key, o)}
                    >
                      {on && q.multi && <Check size={10} />}
                      <span style={{ marginLeft: on && q.multi ? 6 : 0 }}>{o}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <FootNav onPrev={onPrev} onNext={onNext} nextLabel="출력 형식" />
    </div>
  );
}
