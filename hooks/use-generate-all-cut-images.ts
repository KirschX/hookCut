"use client";
import { useEffect, useRef } from "react";
import { useWizardStore } from "@/stores/wizard-store";
import { postCutImage } from "@/lib/api/cut-image";
import type { AdProposal } from "@/schemas/ad-proposal";

export function useGenerateAllCutImages(opts: {
  onAllDone: () => void;
  onError: (msg: string) => void;
  concurrency?: number;
}) {
  const ads = useWizardStore((s) => s.ads);
  const adsStatus = useWizardStore((s) => s.adsStatus);
  const ratio = useWizardStore((s) => s.ratio);
  const setAdCutImageUrl = useWizardStore((s) => s.setAdCutImageUrl);
  const setImagesProgress = useWizardStore((s) => s.setImagesProgress);
  const setImagesStatus = useWizardStore((s) => s.setImagesStatus);
  const modelId = useWizardStore((s) => s.imageModelId);
  const lastProcessedAdsRef = useRef<AdProposal[] | null>(null);
  const concurrency = opts.concurrency ?? 4;
  const onAllDone = opts.onAllDone;
  const onError = opts.onError;

  useEffect(() => {
    if (adsStatus !== "done") return;
    if (ads.length === 0) return;
    if (lastProcessedAdsRef.current === ads) return;
    lastProcessedAdsRef.current = ads;

    const tasks: Array<{
      adIdx: number;
      cutIdx: number;
      prompt: string;
      composition: string;
      bubbleKind: "speech" | "narration";
      bubblePosition: "top" | "bottom" | "left" | "right";
      bubbleText: string;
    }> = [];
    ads.forEach((ad, adIdx) =>
      ad.cuts.forEach((c, cutIdx) => {
        if (!c.imageUrl) {
          tasks.push({
            adIdx,
            cutIdx,
            prompt: c.prompt,
            composition: c.composition,
            bubbleKind: c.bubbleKind,
            bubblePosition: c.bubblePosition,
            bubbleText: c.bubbleText,
          });
        }
      }),
    );

    if (tasks.length === 0) {
      // 이미 모든 컷이 완료된 상태로 hook이 re-mount된 경우 (confirm 재방문).
      // 자동으로 result로 이동시키지 않는다.
      setImagesStatus("done", 100);
      return;
    }

    const total = tasks.length;
    let completed = 0;
    let failed = 0;
    setImagesStatus("loading", 0);

    let cursor = 0;
    const next = async (): Promise<void> => {
      while (cursor < tasks.length) {
        const i = cursor++;
        const t = tasks[i];
        try {
          const r = await postCutImage({
            prompt: t.prompt,
            composition: t.composition,
            bubbleKind: t.bubbleKind,
            bubblePosition: t.bubblePosition,
            bubbleText: t.bubbleText,
            ratio,
            adIndex: t.adIdx,
            cutIndex: t.cutIdx,
            modelId,
          });
          setAdCutImageUrl(t.adIdx, t.cutIdx, r.imageUrl);
        } catch {
          failed++;
        }
        completed++;
        setImagesProgress(Math.round((completed / total) * 100));
      }
    };
    Promise.all(Array.from({ length: concurrency }, () => next())).then(() => {
      if (failed > 0) {
        setImagesStatus("error", undefined, `${failed}/${total} 실패`);
        onError(`${failed}/${total} 컷 이미지 생성 실패`);
        return;
      }
      setImagesStatus("done", 100);
      onAllDone();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adsStatus, ads]);
}
