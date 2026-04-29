"use client";

import { useEffect } from "react";
import { useWizardStore } from "@/stores/wizard-store";
import { useAnalyzeStream } from "@/hooks/use-analyze-stream";
import { FootNav } from "@/components/wizard/FootNav";
import { Check } from "@/components/primitives/icons";
import type { Analysis } from "@/types";

export function AnalysisStep({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  const {
    excerpt,
    wikiUrl,
    memo,
    contentMedium,
    analysis,
    analysisStatus,
    setAnalysisStatus,
  } = useWizardStore();

  const { submit, object, isLoading, error } = useAnalyzeStream();

  useEffect(() => {
    if (analysis) return;
    if (analysisStatus === "loading") return;
    if (excerpt.length < 50) return;
    setAnalysisStatus("loading");
    submit({ excerpt, wikiUrl, memo, contentMedium });
  }, [
    analysis,
    analysisStatus,
    excerpt,
    wikiUrl,
    memo,
    contentMedium,
    setAnalysisStatus,
    submit,
  ]);

  const retry = () => {
    setAnalysisStatus("idle");
  };

  const a: Analysis | null = analysis;
  // Show loading view if no final analysis yet.
  if (!a) {
    return (
      <div className="stage page-enter">
        <div className="eyebrow">Step 02 · Analyze</div>
        <h1 className="page-title">
          콘텐츠를 <em>읽고 있습니다…</em>
        </h1>
        <p className="lede">
          광고 제작에 필요한 정보를 추출하는 중입니다. 보통 5~15초가 걸립니다.
        </p>
        <div className="card mt-16">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                key: "structure",
                label: "본문 구조 분석",
                done: !!object?.genre,
              },
              {
                key: "characters",
                label: "주요 인물 및 관계 추출",
                done: !!(object?.characters && object.characters.length > 0),
              },
              {
                key: "hooks",
                label: "핵심 갈등과 후킹 포인트 추출",
                done: !!(object?.hooks && object.hooks.length > 0),
              },
              {
                key: "spoilers",
                label: "스포일러 위험 영역 표시",
                done: object?.spoilers !== undefined,
              },
              {
                key: "candidates",
                label: "광고화 가능한 스토리라인 탐색",
                done: !!(object?.candidates && object.candidates.length > 0),
              },
            ].map((s) => (
              <AnalysisLine
                key={s.key}
                label={s.label}
                done={s.done}
                loading={isLoading}
              />
            ))}
          </div>
        </div>

        {error && (
          <div
            className="card mt-16"
            style={{ borderColor: "var(--warn)", padding: 18 }}
          >
            <div
              className="mono"
              style={{
                fontSize: 11,
                color: "var(--warn)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              분석 실패
            </div>
            <div
              style={{
                fontSize: 13.5,
                color: "var(--ink-2)",
                marginBottom: 12,
              }}
            >
              {error.message}
            </div>
            <button type="button" className="btn" onClick={retry}>
              다시 시도
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="stage page-enter">
      <div className="eyebrow">Step 02 · Analyze · 완료</div>
      <h1 className="page-title">
        분석이 <em>끝났습니다.</em>
      </h1>
      <p className="lede">
        아래 정보를 광고 제작의 출발점으로 사용합니다. 다음 단계에서 어떤
        방향으로 광고화할지 고르게 됩니다.
      </p>

      <div className="card mb-24" style={{ padding: 22 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 28,
          }}
        >
          <Meta label="장르" value={a.genre} />
          <Meta label="감정 톤" value={a.tone.join(" · ")} />
          <Meta label="추출된 후킹" value={`${a.hooks.length}개`} />
        </div>
        <hr className="divider" style={{ margin: "20px 0" }} />
        <div>
          <span className="field-label">핵심 갈등</span>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 19,
              lineHeight: 1.45,
              color: "var(--ink)",
              letterSpacing: "-0.005em",
            }}
          >
            “{a.coreConflict}”
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <h2 className="section-title">
            주요 인물{" "}
            <span className="count">{a.characters.length} CHARACTERS</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {a.characters.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 14,
                  alignItems: "baseline",
                  paddingBottom: 12,
                  borderBottom:
                    i < a.characters.length - 1
                      ? "1px dashed var(--hairline)"
                      : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 17,
                    color: "var(--ink)",
                  }}
                >
                  {c.name}
                </div>
                <div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10.5,
                      color: "var(--ink-3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 2,
                    }}
                  >
                    {c.role}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
                    {c.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">
            광고화 후킹 포인트 <span className="count">HOOK CANDIDATES</span>
          </h2>
          <ol
            style={{
              margin: 0,
              paddingLeft: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {a.hooks.map((h, i) => (
              <li
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr",
                  gap: 8,
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--accent)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 16,
                    color: "var(--ink)",
                    lineHeight: 1.35,
                  }}
                >
                  {h}
                </span>
              </li>
            ))}
          </ol>

          {a.spoilers.length > 0 && (
            <>
              <hr className="divider" style={{ margin: "20px 0 16px" }} />
              <h2 className="section-title" style={{ marginBottom: 10 }}>
                스포일러 주의 <span className="count">DO NOT REVEAL</span>
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {a.spoilers.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                      fontSize: 13,
                      color: "var(--ink-2)",
                    }}
                  >
                    <span
                      style={{
                        marginTop: 6,
                        width: 6,
                        height: 6,
                        background: "var(--warn)",
                        borderRadius: 999,
                        flexShrink: 0,
                      }}
                    ></span>
                    {s}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <FootNav onPrev={onPrev} onNext={onNext} nextLabel="광고 방향 선택" />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="mono"
        style={{
          fontSize: 10.5,
          color: "var(--ink-3)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 17,
          color: "var(--ink)",
          letterSpacing: "-0.005em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function AnalysisLine({
  label,
  done,
  loading,
}: {
  label: string;
  done: boolean;
  loading: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "20px 1fr auto",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          border:
            "1.5px solid " + (done ? "var(--good)" : "var(--hairline-strong)"),
          background: done ? "var(--good)" : "transparent",
          color: "white",
          display: "grid",
          placeItems: "center",
          transition: "all 250ms ease",
        }}
      >
        {done && <Check size={9} />}
      </div>
      <span
        style={{ fontSize: 14, color: done ? "var(--ink)" : "var(--ink-3)" }}
      >
        {label}
      </span>
      <span
        className="mono"
        style={{
          fontSize: 10,
          color: done ? "var(--good)" : "var(--ink-4)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {done ? (
          "OK"
        ) : loading ? (
          <span className="dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
        ) : (
          "..."
        )}
      </span>
    </div>
  );
}
