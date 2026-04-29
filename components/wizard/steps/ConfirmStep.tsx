"use client";

import { useEffect, useMemo, useState } from "react";
import { useWizardStore } from "@/stores/wizard-store";
import { useGenerateAdsStream } from "@/hooks/use-generate-ads-stream";
import { useGenerateAllCutImages } from "@/hooks/use-generate-all-cut-images";
import { presets } from "@/data/presets";
import { FORMATS } from "@/schemas/format";
import { ArrowLeft, ArrowRight } from "@/components/primitives/icons";
import { toast } from "sonner";
import { classNames } from "@/lib/utils";
import type { Storyline } from "@/types";

export function ConfirmStep({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  const {
    presetId,
    contentMedium,
    analysis,
    storylines,
    targeting,
    format,
    ratio,
    variantMix,
    adsStatus,
    setAdsStatus,
    ads,
  } = useWizardStore();
  const imagesPct = useWizardStore((s) => s.imagesProgress);
  const imagesPhase = useWizardStore((s) => s.imagesStatus);
  const setImagesStatus = useWizardStore((s) => s.setImagesStatus);
  const adsError = useWizardStore((s) => s.adsError);
  const imagesError = useWizardStore((s) => s.imagesError);

  const fmt = FORMATS.find((f) => f.id === format)!;
  const stories: Storyline[] = useMemo(() => {
    if (!analysis) return [];
    return storylines
      .map((id) => analysis.candidates.find((c) => c.id === id))
      .filter((x): x is Storyline => Boolean(x));
  }, [analysis, storylines]);

  const variantsList = useMemo(() => {
    if (variantMix === "stable")
      return stories.map((s) => ({ story: s, type: "stable" as const }));
    if (variantMix === "experimental+")
      return stories.flatMap((s) => [
        { story: s, type: "experimental" as const },
        { story: s, type: "experimental" as const },
      ]);
    return stories.flatMap((s) => [
      { story: s, type: "stable" as const },
      { story: s, type: "experimental" as const },
    ]);
  }, [variantMix, stories]);

  const [navPending, setNavPending] = useState(false);

  useEffect(() => {
    if (adsStatus === "error" || imagesPhase === "error") setNavPending(false);
  }, [adsStatus, imagesPhase]);

  const { submit, object, isLoading, error } = useGenerateAdsStream({
    onSuccess: () => {
      /* navigate 안 함 — useGenerateAllCutImages.onAllDone가 navigate */
    },
  });

  useGenerateAllCutImages({
    concurrency: 4,
    onAllDone: () => onNext(),
    onError: (msg) => {
      setNavPending(false);
      toast.error(msg);
    },
  });

  // 진행률은 두 페이즈 합산. interpolation 없이 실제 신호로만 derive.
  const adsCount = object?.ads?.filter(Boolean).length ?? 0;
  const adsTarget = variantsList.length || 1;
  const llmProgress = Math.min(50, (adsCount / adsTarget) * 50);
  const imagePart = imagesPhase === "idle" ? 0 : (imagesPct / 100) * 50;

  const adsHaveMissingImages =
    ads.length > 0 && ads.some((a) => a.cuts.some((c) => !c.imageUrl));
  const inImageBridge =
    adsStatus === "done" && adsHaveMissingImages && imagesPhase === "idle";
  const progress = inImageBridge ? 50 : Math.min(100, llmProgress + imagePart);

  const imagesTotal = ads.reduce((n, a) => n + a.cuts.length, 0);
  const imagesDone =
    imagesTotal > 0 ? Math.round((imagesPct / 100) * imagesTotal) : 0;

  const startGeneration = () => {
    if (!analysis || !targeting) return;
    if (adsStatus === "loading") return;
    setNavPending(true);
    // 다시 생성: 이전 done 상태 잔재 청소 (banner도 자동으로 사라지고 hook 재실행 보장).
    setImagesStatus("idle", 0);
    setAdsStatus("loading", 0);
    submit({
      analysis,
      storylines,
      targeting,
      format,
      ratio,
      variantMix,
      contentMedium,
    });
  };

  const hasPriorResult = ads.length > 0 && imagesPhase === "done";

  if (!analysis || !targeting) return null;

  const showLoading =
    imagesPhase !== "error" &&
    adsStatus !== "error" &&
    (navPending ||
      adsStatus === "loading" ||
      isLoading ||
      imagesPhase === "loading" ||
      (adsStatus === "done" && adsHaveMissingImages));

  if (showLoading) {
    return (
      <div className="stage page-enter">
        <div className="eyebrow">Step 06 · Generating</div>
        <h1 className="page-title">
          광고 소재를 <em>만들고 있습니다…</em>
        </h1>
        <p className="lede">
          선택하신 전략에 따라 카피와 이미지 프롬프트를 구성하고, 각 컷을
          생성합니다.
        </p>

        <div className="card" style={{ padding: 28 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 10,
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                color: "var(--ink-3)",
                textTransform: "uppercase",
              }}
            >
              Generating · {variantsList.length} variant
              {variantsList.length > 1 ? "s" : ""}
            </span>
            <span
              className="mono"
              style={{ fontSize: 13, color: "var(--ink)" }}
            >
              {Math.floor(progress)}%
            </span>
          </div>
          <div
            style={{
              height: 4,
              background: "var(--paper-3)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: progress + "%",
                height: "100%",
                background: "var(--accent)",
                transition: "width 160ms linear",
              }}
            ></div>
          </div>
          <div
            className="mt-24"
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            {[
              {
                label: "광고 카피 생성 중",
                count: `${adsCount} / ${adsTarget}`,
                done: adsCount >= adsTarget && adsTarget > 0,
                active:
                  (isLoading || adsStatus === "loading") &&
                  imagesPhase === "idle",
              },
              {
                label: "이미지 생성 중",
                count: imagesTotal > 0 ? `${imagesDone} / ${imagesTotal}` : "—",
                done: imagesPhase === "done",
                active: imagesPhase === "loading",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "16px 1fr auto auto",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    border:
                      "1.5px solid " +
                      (s.done ? "var(--good)" : "var(--hairline-strong)"),
                    background: s.done ? "var(--good)" : "transparent",
                  }}
                ></div>
                <span
                  style={{
                    fontSize: 13,
                    color: s.done || s.active ? "var(--ink)" : "var(--ink-3)",
                  }}
                >
                  {s.label}
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--ink-3)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {s.count}
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: s.done
                      ? "var(--good)"
                      : s.active
                        ? "var(--accent)"
                        : "var(--ink-4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {s.done ? "OK" : s.active ? "RUN" : "..."}
                </span>
              </div>
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
              생성 실패
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
            <button
              type="button"
              className="btn"
              onClick={() => {
                setAdsStatus("idle", 0);
              }}
            >
              돌아가기
            </button>
          </div>
        )}
      </div>
    );
  }

  const presetTitle = presetId ? presets[presetId].title : "사용자 콘텐츠";

  const errorMsg =
    adsStatus === "error"
      ? adsError
      : imagesPhase === "error"
        ? imagesError
        : undefined;

  return (
    <div className="stage page-enter">
      <div className="eyebrow">Step 06 · Confirm</div>
      <h1 className="page-title">
        생성 전에, <em>전략을 확인</em>해주세요.
      </h1>
      <p className="lede">아래 전략으로 광고 소재가 생성됩니다.</p>

      {errorMsg && (
        <div
          className="card"
          style={{
            borderColor: "var(--warn)",
            padding: 18,
            marginBottom: 18,
          }}
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
            직전 생성 실패
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--ink-2)",
              fontFamily: "var(--font-mono)",
              wordBreak: "break-all",
              marginBottom: 10,
            }}
          >
            {errorMsg}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
            브라우저 콘솔에서 자세한 zod issues / 원본 객체를 확인하세요.
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 28 }}>
        <SummaryRow label="콘텐츠" value={presetTitle} sub={analysis.genre} />
        <SummaryRow
          label="스토리라인"
          value={
            stories.length === 0
              ? "선택 없음"
              : stories.map((s) => s.title).join(" · ")
          }
          sub={stories.length > 0 ? `${stories.length}개 방향` : ""}
        />
        <SummaryRow
          label="타겟"
          value={[targeting.age, targeting.readerType, targeting.audience]
            .filter(Boolean)
            .join(" · ")}
        />
        <SummaryRow
          label="목적 · 톤"
          value={targeting.goal}
          sub={targeting.tone.join(" · ")}
        />
        <SummaryRow
          label="피하기"
          value={targeting.avoid.join(" · ") || "없음"}
          warn
        />
        <SummaryRow
          label="형식"
          value={fmt.label}
          sub={`이미지 비율 ${ratio} · 총 ${variantsList.length}개 광고안`}
          last
        />
      </div>

      <h2 className="section-title mt-32">
        생성될 광고안{" "}
        <span className="count">{variantsList.length} VARIANTS</span>
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {variantsList.map((v, i) => (
          <div key={i} className="card" style={{ padding: 18 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span
                className={classNames(
                  "chip",
                  "dot",
                  v.type === "experimental" && "accent",
                )}
              >
                {v.type === "stable" ? "안정적" : "실험적"} 광고안{" "}
                {String.fromCharCode(65 + i)}
              </span>
              <span
                className="mono subtle"
                style={{ fontSize: 10, letterSpacing: "0.1em" }}
              >
                {fmt.label}
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                letterSpacing: "-0.005em",
                marginBottom: 4,
              }}
            >
              {v.story.title}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
              {v.story.summary}
            </div>
          </div>
        ))}
      </div>

      <div className="foot-nav">
        <button type="button" className="btn ghost" onClick={onPrev}>
          <ArrowLeft /> 이전
        </button>
        <button
          type="button"
          className="btn accent lg"
          onClick={startGeneration}
          disabled={variantsList.length === 0}
        >
          {hasPriorResult ? "다시 생성하기 (기존 결과 폐기)" : "광고 소재 생성"}{" "}
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  sub,
  warn,
  last,
}: {
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr auto",
        gap: 18,
        alignItems: "baseline",
        padding: "14px 0",
        borderBottom: last ? "none" : "1px dashed var(--hairline)",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 10.5,
          color: warn ? "var(--warn)" : "var(--ink-4)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        {label}
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            color: "var(--ink)",
            letterSpacing: "-0.005em",
            lineHeight: 1.3,
          }}
        >
          {value || "—"}
        </div>
        {sub && (
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>
            {sub}
          </div>
        )}
      </div>
      <div />
    </div>
  );
}
