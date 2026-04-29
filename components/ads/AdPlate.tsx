"use client";
import { useEffect } from "react";
import { ratioToCss, type RatioId } from "@/schemas/format";
import { classNames } from "@/lib/utils";
import { useCutImage } from "@/hooks/use-cut-image";
import type { BubbleKind, BubblePosition } from "@/schemas/ad-proposal";

type Tone = "dark" | "warm" | "neutral";

export function AdPlate(props: {
  adIndex: number;
  cutIndex: number;
  prompt: string;
  composition: string;
  bubbleKind: BubbleKind;
  bubblePosition: BubblePosition;
  bubbleText: string;
  caption: string;
  ratio: RatioId;
  tone: Tone;
  imageUrl?: string;
  onClick?: () => void;
  priority?: boolean;
}) {
  const {
    adIndex,
    cutIndex,
    prompt,
    composition,
    bubbleKind,
    bubblePosition,
    bubbleText,
    caption,
    ratio,
    tone,
    imageUrl,
    onClick,
    priority,
  } = props;
  const m = useCutImage(adIndex, cutIndex);

  useEffect(() => {
    if (imageUrl) return;
    if (m.isPending || m.isSuccess) return;
    if (m.isError) return;
    m.mutate({
      prompt,
      composition,
      bubbleKind,
      bubblePosition,
      bubbleText,
      ratio,
      adIndex,
      cutIndex,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, prompt, ratio, adIndex, cutIndex]);

  const url = imageUrl ?? m.data?.imageUrl;
  const status = url
    ? "done"
    : m.isPending
      ? "loading"
      : m.isError
        ? "error"
        : "idle";

  const interactiveProps = onClick
    ? {
        role: "button" as const,
        tabIndex: 0,
        onClick,
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        },
        "aria-label": `${caption || `컷 ${cutIndex + 1}`} 확대 보기`,
      }
    : {};

  return (
    <div
      className={classNames("ad-image", tone)}
      style={{
        aspectRatio: ratioToCss(ratio),
        position: "relative",
        cursor: onClick ? "zoom-in" : undefined,
      }}
      {...interactiveProps}
    >
      {url ? (
        <img
          src={url}
          alt={caption}
          loading={priority ? "eager" : "lazy"}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            animation: "fadeIn 350ms ease both",
          }}
        />
      ) : (
        <div className="ad-image-placeholder">
          {status === "loading" && <span className="mono">생성 중…</span>}
          {status === "error" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                m.reset();
              }}
              className="mono ad-image-retry"
            >
              {m.error?.userMessage ?? "실패"} — 클릭하여 재시도
            </button>
          )}
        </div>
      )}
    </div>
  );
}
