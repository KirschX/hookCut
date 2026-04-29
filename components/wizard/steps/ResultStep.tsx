"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWizardStore } from "@/stores/wizard-store";
import { ArrowLeft, ArrowRight } from "@/components/primitives/icons";
import { classNames } from "@/lib/utils";
import { AdPlate } from "@/components/ads/AdPlate";
import { AdSlideshow } from "@/components/ads/AdSlideshow";
import { CutZoomModal } from "@/components/ads/CutZoomModal";
import { useRegenerateAd } from "@/hooks/use-regenerate-ad";
import { track } from "@vercel/analytics";

export function ResultStep({ onPrev }: { onPrev: () => void }) {
  const router = useRouter();
  const {
    ads,
    ratio,
    targeting,
    analysis,
    storylines,
    format,
    variantMix,
    contentMedium,
    reset,
  } = useWizardStore();
  const [focus, setFocus] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomInitial, setZoomInitial] = useState(0);
  const regenerate = useRegenerateAd();

  if (ads.length === 0) return null; // guarded
  const safeIdx = Math.min(focus, ads.length - 1);
  const ad = ads[safeIdx];

  const onCopy = async () => {
    const text = `${ad.headline}${ad.sub ? "\n" + ad.sub : ""}\n\nCTA: ${ad.cta}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("카피를 클립보드에 복사했습니다.");
    } catch {
      toast.error("클립보드 복사에 실패했습니다.");
    }
  };

  const onDownload = () => {
    const payload = {
      headline: ad.headline,
      sub: ad.sub ?? "",
      cta: ad.cta,
      cuts: ad.cuts,
      intent: ad.intent,
      ratio,
      tone: ad.tone,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hookcut-${ad.shortName.replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      "광고안 데이터를 JSON으로 저장했습니다. (이미지 PNG는 v1.1에서 제공)",
    );
  };

  const onRegenerate = () => {
    if (!analysis || !targeting) return;
    if (regenerate.isPending) return;
    regenerate.mutate({
      context: {
        analysis,
        storylines,
        targeting,
        format,
        ratio,
        variantMix,
        contentMedium,
      },
      replaceIndex: safeIdx,
      hint: "기존 카피와 다른 각도로 다시.",
    });
  };

  const onSwitchStrategy = () => {
    router.push("/wizard?step=format");
  };

  const onRestart = () => {
    reset();
    try {
      sessionStorage.removeItem("hookcut:wizard:v2");
    } catch {
      /* ignore */
    }
    router.push("/");
  };

  return (
    <div className="stage page-enter" style={{ maxWidth: 1180 }}>
      <div className="eyebrow">Step 07 · Output</div>
      <h1 className="page-title">
        <em>{ads.length}개</em>의 광고 소재가 준비되었습니다.
      </h1>
      <p className="lede">
        각 광고안에는 이미지 컷, 카피, CTA, 그리고 ‘왜 이 방향으로 만들었는지’가
        함께 들어 있습니다. 마음에 들지 않으면 같은 전략으로 재생성하거나 다른
        전략으로 다시 시도할 수 있습니다.
      </p>

      <div
        style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}
      >
        {ads.map((x, i) => (
          <button
            key={i}
            type="button"
            className={classNames("tag", focus === i && "is-on")}
            onClick={() => setFocus(i)}
            style={{ padding: "8px 14px" }}
          >
            <span
              className="mono"
              style={{ fontSize: 10, marginRight: 6, opacity: 0.7 }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {x.shortName}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr" }}>
          {/* LEFT — visual */}
          <div
            style={{
              padding: 28,
              background: "var(--paper-2)",
              borderRight: "1px solid var(--hairline)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span
                className={classNames(
                  "chip",
                  "dot",
                  ad.type === "experimental" && "accent",
                )}
              >
                {ad.type === "stable" ? "안정적 광고안" : "실험적 광고안"}
              </span>
              <span
                className="mono subtle"
                style={{ fontSize: 10.5, letterSpacing: "0.1em" }}
              >
                {ad.cuts.length}-CUT · {ratio}
              </span>
            </div>

            <AdSlideshow
              cuts={ad.cuts}
              ratio={ratio}
              tone={ad.tone}
              adIndex={safeIdx}
              onCutClick={(cutIndex) => {
                setZoomInitial(cutIndex);
                setZoomOpen(true);
                track("cut_zoom_open", {
                  adIndex: safeIdx,
                  cutIndex,
                  ratio,
                });
              }}
            />

            <div
              style={{ borderTop: "1px solid var(--hairline)", paddingTop: 18 }}
            >
              <div
                className="mono subtle"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                HEADLINE
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(22px, 4vw, 28px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.015em",
                  marginBottom: 10,
                  color: "var(--ink)",
                  textWrap: "balance",
                }}
              >
                “{ad.headline}”
              </div>
              {ad.sub && (
                <div
                  style={{
                    fontSize: 14,
                    color: "var(--ink-2)",
                    marginBottom: 18,
                  }}
                >
                  {ad.sub}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 14,
                  borderTop: "1px dashed var(--hairline)",
                }}
              >
                <span
                  className="mono subtle"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  CTA
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "white",
                    background: "var(--ink)",
                    padding: "8px 14px",
                    borderRadius: 6,
                  }}
                >
                  {ad.cta} <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — intent + actions */}
          <div
            style={{ padding: 28, display: "flex", flexDirection: "column" }}
          >
            <div
              className="mono subtle"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              광고 의도
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 19,
                lineHeight: 1.35,
                letterSpacing: "-0.005em",
                marginBottom: 22,
                color: "var(--ink)",
              }}
            >
              {ad.intent}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 14,
                marginBottom: 24,
              }}
            >
              <KV k="기반 스토리라인" v={ad.storyId} />
              <KV k="목적" v={targeting?.goal ?? "—"} />
              <KV
                k="타겟"
                v={
                  [targeting?.age, targeting?.readerType]
                    .filter(Boolean)
                    .join(" · ") || "—"
                }
              />
              <KV k="톤" v={(targeting?.tone ?? []).join(" · ") || "—"} />
              <KV
                k="피한 방향"
                v={(targeting?.avoid ?? []).join(" · ") || "없음"}
                muted
              />
            </div>

            <div
              style={{
                marginTop: "auto",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <button type="button" className="btn" onClick={onCopy}>
                카피 복사
              </button>
              <button type="button" className="btn" onClick={onDownload}>
                이미지 다운로드
              </button>
              <button type="button" className="btn" onClick={onRegenerate}>
                같은 전략 재생성
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={onSwitchStrategy}
              >
                다른 전략으로
              </button>
            </div>
          </div>
        </div>
      </div>

      {ads.length > 1 && (
        <>
          <h2 className="section-title mt-32">
            다른 광고안 <span className="count">{ads.length - 1} OTHERS</span>
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
            }}
          >
            {ads.map((x, i) =>
              i === safeIdx ? null : (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  className="card hover"
                  style={{ padding: 14, cursor: "pointer" }}
                  onClick={() => setFocus(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setFocus(i);
                    }
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        x.cuts.length === 1 ? "1fr" : "1fr 1fr",
                      gap: 4,
                      marginBottom: 10,
                    }}
                  >
                    {x.cuts.map((c, j) => (
                      <AdPlate
                        key={j}
                        adIndex={i}
                        cutIndex={j}
                        prompt={c.prompt}
                        composition={c.composition}
                        bubbleKind={c.bubbleKind}
                        bubblePosition={c.bubblePosition}
                        bubbleText={c.bubbleText}
                        caption={c.caption}
                        ratio={ratio}
                        tone={x.tone}
                        imageUrl={c.imageUrl}
                      />
                    ))}
                  </div>
                  <span
                    className={classNames(
                      "chip",
                      "dot",
                      x.type === "experimental" && "accent",
                    )}
                    style={{ fontSize: 9.5 }}
                  >
                    {x.type === "stable" ? "안정적" : "실험적"}
                  </span>
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 14,
                      lineHeight: 1.25,
                      marginTop: 8,
                      color: "var(--ink)",
                    }}
                  >
                    “{x.headline}”
                  </div>
                </div>
              ),
            )}
          </div>
        </>
      )}

      <div className="foot-nav">
        <button type="button" className="btn ghost" onClick={onPrev}>
          <ArrowLeft /> 전략 수정
        </button>
        <button type="button" className="btn" onClick={onRestart}>
          처음부터 다시 만들기
        </button>
      </div>

      <CutZoomModal
        open={zoomOpen}
        cuts={ad.cuts}
        ratio={ratio}
        initialIndex={zoomInitial}
        tone={ad.tone}
        adIndex={safeIdx}
        onClose={() => setZoomOpen(false)}
      />
    </div>
  );
}

function KV({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "100px 1fr",
        gap: 10,
        alignItems: "baseline",
        paddingBottom: 10,
        borderBottom: "1px dashed var(--hairline)",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 10,
          color: "var(--ink-4)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {k}
      </div>
      <div
        style={{ fontSize: 13, color: muted ? "var(--ink-3)" : "var(--ink-2)" }}
      >
        {v || "—"}
      </div>
    </div>
  );
}
