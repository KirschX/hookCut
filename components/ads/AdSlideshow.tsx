"use client";

import { useEffect, useRef, useState } from "react";
import type { RatioId } from "@/schemas/format";
import type { AdCut } from "@/schemas/ad-proposal";
import { AdPlate } from "@/components/ads/AdPlate";
import { classNames } from "@/lib/utils";
import { track } from "@vercel/analytics";

type Tone = "dark" | "warm" | "neutral";
type Mode = "play" | "grid";

const SLIDE_MS = 3000;

export function AdSlideshow(props: {
  cuts: AdCut[];
  ratio: RatioId;
  tone: Tone;
  adIndex: number;
  onCutClick: (cutIndex: number) => void;
}) {
  const { cuts, ratio, tone, adIndex, onCutClick } = props;
  const [mode, setMode] = useState<Mode>("play");
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prevAdIndex, setPrevAdIndex] = useState(adIndex);
  const reducedMotionRef = useRef(false);

  // Reset to first slide whenever ad changes (render-time derived state pattern)
  if (prevAdIndex !== adIndex) {
    setPrevAdIndex(adIndex);
    setIdx(0);
    setMode("play");
  }

  // Detect prefers-reduced-motion (no listener — once at mount per ad is enough)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (mode !== "play") return;
    if (cuts.length <= 1) return;
    if (paused) return;
    if (reducedMotionRef.current) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % cuts.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [mode, cuts.length, paused, adIndex]);

  if (cuts.length === 0) return null;

  // 1-cut: render plain plate, no toggle, no dots
  if (cuts.length === 1) {
    const c = cuts[0];
    return (
      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        <AdPlate
          adIndex={adIndex}
          cutIndex={0}
          prompt={c.prompt}
          composition={c.composition}
          bubbleKind={c.bubbleKind}
          bubblePosition={c.bubblePosition}
          bubbleText={c.bubbleText}
          caption={c.caption}
          ratio={ratio}
          tone={tone}
          imageUrl={c.imageUrl}
          priority
          onClick={() => onCutClick(0)}
        />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <div className="slideshow-head">
        <div className="mode-toggle" role="group" aria-label="표시 모드">
          <button
            type="button"
            aria-pressed={mode === "play"}
            className={classNames(mode === "play" && "is-on")}
            onClick={() => {
              if (mode === "play") return;
              setMode("play");
              setIdx(0);
              track("slideshow_mode_toggle", { mode: "play" });
            }}
          >
            PLAY
          </button>
          <button
            type="button"
            aria-pressed={mode === "grid"}
            className={classNames(mode === "grid" && "is-on")}
            onClick={() => {
              if (mode === "grid") return;
              setMode("grid");
              track("slideshow_mode_toggle", { mode: "grid" });
            }}
          >
            GRID
          </button>
        </div>
      </div>

      {mode === "play" ? (
        <>
          <div
            className="slideshow"
            role="group"
            aria-roledescription="carousel"
            aria-label={`광고 컷 슬라이드 ${cuts.length}장`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {cuts.map((c, i) => (
              <div
                key={i}
                className={classNames("slide", i === idx && "is-active")}
                role="group"
                aria-label={`컷 ${i + 1} / ${cuts.length}`}
                aria-hidden={i !== idx}
              >
                <AdPlate
                  adIndex={adIndex}
                  cutIndex={i}
                  prompt={c.prompt}
                  composition={c.composition}
                  bubbleKind={c.bubbleKind}
                  bubblePosition={c.bubblePosition}
                  bubbleText={c.bubbleText}
                  caption={c.caption}
                  ratio={ratio}
                  tone={tone}
                  imageUrl={c.imageUrl}
                  priority={i === 0}
                  onClick={() => onCutClick(i)}
                />
              </div>
            ))}
          </div>
          <div
            className="slideshow-dots"
            role="tablist"
            aria-label="컷 인디케이터"
          >
            {cuts.map((_, i) => (
              <button
                key={i}
                type="button"
                className={classNames("slideshow-dot", i === idx && "is-on")}
                aria-label={`컷 ${i + 1}로 이동`}
                aria-current={i === idx}
                onClick={() => {
                  setIdx(i);
                  track("slideshow_dot_jump", { cutIndex: i });
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {cuts.map((c, i) => (
            <div key={i}>
              <AdPlate
                adIndex={adIndex}
                cutIndex={i}
                prompt={c.prompt}
                composition={c.composition}
                bubbleKind={c.bubbleKind}
                bubblePosition={c.bubblePosition}
                bubbleText={c.bubbleText}
                caption={c.caption}
                ratio={ratio}
                tone={tone}
                imageUrl={c.imageUrl}
                onClick={() => onCutClick(i)}
              />
              <div
                style={{
                  fontSize: 11.5,
                  marginTop: 6,
                  color: "var(--ink-3)",
                  lineHeight: 1.35,
                }}
              >
                {c.caption}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
