"use client";

import { ArrowLeft, ArrowRight } from "@/components/primitives/icons";

export function FootNav({
  onPrev,
  onNext,
  prevLabel = "이전",
  nextLabel = "다음",
  canNext = true,
  variant = "primary",
}: {
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  canNext?: boolean;
  variant?: "primary" | "accent";
}) {
  return (
    <div className="foot-nav">
      <button type="button" className="btn ghost" onClick={onPrev} disabled={!onPrev}>
        <ArrowLeft /> {prevLabel}
      </button>
      <button
        type="button"
        className={variant === "accent" ? "btn accent lg" : "btn primary"}
        onClick={onNext}
        disabled={!canNext || !onNext}
      >
        {nextLabel} <ArrowRight />
      </button>
    </div>
  );
}
