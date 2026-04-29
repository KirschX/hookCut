"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RatioId } from "@/schemas/format";
import type { AdCut } from "@/schemas/ad-proposal";
import { Portal } from "@/components/primitives/Portal";
import { AdPlate } from "@/components/ads/AdPlate";
import { ArrowLeft, ArrowRight } from "@/components/primitives/icons";
import { track } from "@vercel/analytics";

type Tone = "dark" | "warm" | "neutral";

export function CutZoomModal(props: {
  open: boolean;
  cuts: AdCut[];
  ratio: RatioId;
  initialIndex: number;
  tone: Tone;
  adIndex: number;
  onClose: () => void;
}) {
  const { open, cuts, ratio, initialIndex, tone, adIndex, onClose } = props;
  const [idx, setIdx] = useState(initialIndex);
  const [seen, setSeen] = useState({ open, initialIndex });
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Sync idx whenever the modal opens or initialIndex changes (render-time pattern)
  if (seen.open !== open || seen.initialIndex !== initialIndex) {
    setSeen({ open, initialIndex });
    if (open) setIdx(initialIndex);
  }

  const total = cuts.length;
  const canPrev = idx > 0;
  const canNext = idx < total - 1;

  const goPrev = useCallback(
    (source: "prev" | "key" = "prev") => {
      if (!canPrev) return;
      setIdx((i) => Math.max(0, i - 1));
      track("cut_zoom_navigate", { direction: source });
    },
    [canPrev],
  );
  const goNext = useCallback(
    (source: "next" | "key" = "next") => {
      if (!canNext) return;
      setIdx((i) => Math.min(total - 1, i + 1));
      track("cut_zoom_navigate", { direction: source });
    },
    [canNext, total],
  );

  // Keyboard handlers + scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (canPrev) {
          setIdx((i) => Math.max(0, i - 1));
          track("cut_zoom_navigate", { direction: "key" });
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (canNext) {
          setIdx((i) => Math.min(total - 1, i + 1));
          track("cut_zoom_navigate", { direction: "key" });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, canPrev, canNext, total]);

  if (!open) return null;
  const cut = cuts[idx];
  if (!cut) return null;

  return (
    <Portal>
      <div
        className="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="광고 컷 확대 보기"
      >
        <button
          type="button"
          aria-label="닫기"
          className="lightbox-dim"
          onClick={onClose}
        />

        {total > 1 && (
          <>
            <button
              type="button"
              className="lightbox-nav left"
              aria-label="이전 컷"
              disabled={!canPrev}
              onClick={() => goPrev("prev")}
            >
              <ArrowLeft size={20} />
            </button>
            <button
              type="button"
              className="lightbox-nav right"
              aria-label="다음 컷"
              disabled={!canNext}
              onClick={() => goNext("next")}
            >
              <ArrowRight size={20} />
            </button>
          </>
        )}

        <div className="lightbox-card">
          <button
            ref={closeBtnRef}
            type="button"
            className="lightbox-close"
            aria-label="모달 닫기"
            onClick={onClose}
          >
            ×
          </button>
          <div className="lightbox-image">
            <AdPlate
              key={`${adIndex}-${idx}`}
              adIndex={adIndex}
              cutIndex={idx}
              prompt={cut.prompt}
              composition={cut.composition}
              bubbleKind={cut.bubbleKind}
              bubblePosition={cut.bubblePosition}
              bubbleText={cut.bubbleText}
              caption={cut.caption}
              ratio={ratio}
              tone={tone}
              imageUrl={cut.imageUrl}
              priority
            />
          </div>
          <div className="lightbox-meta">
            <span className="lightbox-caption">{cut.caption}</span>
            {total > 1 && (
              <span className="lightbox-index mono">
                {idx + 1} / {total}
              </span>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
