"use client";

import { useEffect } from "react";
import { useWizardStore } from "@/stores/wizard-store";
import { AdProposalSchema } from "@/schemas/ad-proposal";
import { z } from "zod";

// MVP: hydrate from sessionStorage (KV integration in Sprint 5).
const KEY = "hookcut:wizard:v2";
const AdsArraySchema = z.array(AdProposalSchema);

export function HydrateClient() {
  const hydrated = useWizardStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated) return;
    try {
      const raw =
        typeof window !== "undefined" ? sessionStorage.getItem(KEY) : null;
      if (raw) {
        const snap = JSON.parse(raw);
        // schema 마이그레이션 안전망: 이전 버전 ads는 새 스키마와 맞지 않음 → silent 폐기.
        if (snap && Array.isArray(snap.ads)) {
          const parsed = AdsArraySchema.safeParse(snap.ads);
          if (!parsed.success) {
            snap.ads = [];
          }
        }
        useWizardStore.getState().hydrate(snap);
      } else {
        useWizardStore.getState().setHydrated(true);
      }
    } catch {
      useWizardStore.getState().setHydrated(true);
    }

    const unsub = useWizardStore.subscribe((s) => {
      if (!s.hydrated) return;
      try {
        const snap = {
          presetId: s.presetId,
          contentMedium: s.contentMedium,
          excerpt: s.excerpt,
          wikiUrl: s.wikiUrl,
          memo: s.memo,
          title: s.title,
          analysis: s.analysis,
          storylines: s.storylines,
          targeting: s.targeting,
          format: s.format,
          ratio: s.ratio,
          variantMix: s.variantMix,
          ads: s.ads,
          imageModelId: s.imageModelId,
        };
        sessionStorage.setItem(KEY, JSON.stringify(snap));
      } catch {
        /* ignore quota */
      }
    });
    return () => unsub();
  }, [hydrated]);

  return null;
}
