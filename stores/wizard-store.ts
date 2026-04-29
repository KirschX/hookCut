"use client";

import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import type {
  Analysis,
  AdProposal,
  Targeting,
  FormatId,
  RatioId,
  VariantMix,
} from "@/types";
import type { PresetId } from "@/data/presets";
import {
  DEFAULT_IMAGE_MODEL,
  SUPPORTED_IMAGE_MODELS,
  type ImageModelId,
} from "@/lib/ai/client";

export type Step =
  | "landing"
  | "input"
  | "analysis"
  | "storyline"
  | "targeting"
  | "format"
  | "confirm"
  | "result";

export const STEPS: ReadonlyArray<{
  id: Step;
  num: string;
  label: string;
  sub: string;
}> = [
  { id: "landing", num: "00", label: "시작", sub: "Welcome" },
  { id: "input", num: "01", label: "콘텐츠 입력", sub: "Source" },
  { id: "analysis", num: "02", label: "AI 분석", sub: "Analyze" },
  { id: "storyline", num: "03", label: "스토리라인 선택", sub: "Angle" },
  { id: "targeting", num: "04", label: "타겟 · 톤", sub: "Audience" },
  { id: "format", num: "05", label: "출력 형식", sub: "Format" },
  { id: "confirm", num: "06", label: "전략 확인", sub: "Strategy" },
  { id: "result", num: "07", label: "광고 소재", sub: "Output" },
];

export const STEP_INDEX: Record<Step, number> = STEPS.reduce(
  (acc, s, i) => {
    acc[s.id] = i;
    return acc;
  },
  {} as Record<Step, number>,
);

export type ContentMedium = "novel" | "webtoon" | "manga";
export type AnalysisStatus = "idle" | "loading" | "done" | "error";
export type AdsStatus = "idle" | "loading" | "done" | "error";
export type ImagesStatus = "idle" | "loading" | "done" | "error";

export interface WizardState {
  sessionId: string | null;
  hydrated: boolean;

  presetId?: PresetId;
  contentMedium: ContentMedium;
  excerpt: string;
  wikiUrl: string;
  memo: string;
  title: string;

  analysis: Analysis | null;
  analysisStatus: AnalysisStatus;
  analysisError?: string;

  storylines: string[];
  targeting: Targeting | null;

  format: FormatId;
  ratio: RatioId;
  variantMix: VariantMix;

  ads: AdProposal[];
  adsStatus: AdsStatus;
  adsProgress: number;
  adsError?: string;

  imagesStatus: ImagesStatus;
  imagesProgress: number;
  imagesError?: string;

  imageModelId: ImageModelId;

  setInput: (
    patch: Partial<
      Pick<
        WizardState,
        "excerpt" | "wikiUrl" | "memo" | "title" | "presetId" | "contentMedium"
      >
    >,
  ) => void;
  setAnalysis: (a: Analysis) => void;
  setAnalysisStatus: (s: AnalysisStatus, err?: string) => void;
  toggleStoryline: (id: string) => void;
  setStorylines: (ids: string[]) => void;
  setTargeting: (t: Targeting) => void;
  setFormat: (
    patch: Partial<Pick<WizardState, "format" | "ratio" | "variantMix">>,
  ) => void;
  setAds: (ads: AdProposal[]) => void;
  setAdAt: (idx: number, ad: AdProposal) => void;
  setAdCutImageUrl: (adIndex: number, cutIndex: number, url: string) => void;
  setAdsStatus: (s: AdsStatus, progress?: number, err?: string) => void;
  setImagesStatus: (s: ImagesStatus, progress?: number, err?: string) => void;
  setImagesProgress: (n: number) => void;
  setImageModelId: (id: ImageModelId) => void;
  setSessionId: (id: string) => void;
  setHydrated: (h: boolean) => void;
  reset: () => void;
  hydrate: (snap: Partial<WizardState>) => void;
}

const initial: Omit<
  WizardState,
  | "setInput"
  | "setAnalysis"
  | "setAnalysisStatus"
  | "toggleStoryline"
  | "setStorylines"
  | "setTargeting"
  | "setFormat"
  | "setAds"
  | "setAdAt"
  | "setAdCutImageUrl"
  | "setAdsStatus"
  | "setImagesStatus"
  | "setImagesProgress"
  | "setImageModelId"
  | "setSessionId"
  | "setHydrated"
  | "reset"
  | "hydrate"
> = {
  sessionId: null,
  hydrated: false,
  presetId: undefined,
  contentMedium: "novel",
  excerpt: "",
  wikiUrl: "",
  memo: "",
  title: "",
  analysis: null,
  analysisStatus: "idle",
  analysisError: undefined,
  storylines: [],
  targeting: null,
  format: "2-2",
  ratio: "4:5",
  variantMix: "stable+experimental",
  ads: [],
  adsStatus: "idle",
  adsProgress: 0,
  adsError: undefined,
  imagesStatus: "idle",
  imagesProgress: 0,
  imagesError: undefined,
  imageModelId: DEFAULT_IMAGE_MODEL,
};

export const useWizardStore = create<WizardState>()(
  devtools(
    subscribeWithSelector((set) => ({
      ...initial,
      setInput: (p) => set((s) => ({ ...s, ...p })),
      setAnalysis: (a) =>
        set({ analysis: a, analysisStatus: "done", analysisError: undefined }),
      setAnalysisStatus: (status, err) =>
        set({ analysisStatus: status, analysisError: err }),
      toggleStoryline: (id) =>
        set((s) => ({
          storylines: s.storylines.includes(id)
            ? s.storylines.filter((x) => x !== id)
            : [...s.storylines, id],
        })),
      setStorylines: (ids) => set({ storylines: ids }),
      setTargeting: (t) => set({ targeting: t }),
      setFormat: (p) => set((s) => ({ ...s, ...p })),
      setAds: (ads) =>
        set({ ads, adsStatus: "done", adsProgress: 100, adsError: undefined }),
      setAdAt: (idx, ad) =>
        set((s) => ({
          ads: s.ads.map((x, i) => (i === idx ? ad : x)),
        })),
      setAdCutImageUrl: (adIndex, cutIndex, url) =>
        set((s) => ({
          ads: s.ads.map((ad, i) =>
            i === adIndex
              ? {
                  ...ad,
                  cuts: ad.cuts.map((c, j) =>
                    j === cutIndex ? { ...c, imageUrl: url } : c,
                  ),
                }
              : ad,
          ),
        })),
      setAdsStatus: (status, progress, err) =>
        set((s) => ({
          adsStatus: status,
          adsProgress: progress ?? s.adsProgress,
          adsError: err,
        })),
      setImagesStatus: (status, progress, err) =>
        set((s) => ({
          imagesStatus: status,
          imagesProgress: progress ?? s.imagesProgress,
          imagesError: err,
        })),
      setImagesProgress: (n) => set({ imagesProgress: n }),
      setImageModelId: (id) => set({ imageModelId: id }),
      setSessionId: (id) => set({ sessionId: id }),
      setHydrated: (h) => set({ hydrated: h }),
      reset: () => set({ ...initial, hydrated: true }),
      hydrate: (snap) => {
        const safeModel: ImageModelId =
          snap.imageModelId &&
          (SUPPORTED_IMAGE_MODELS as readonly string[]).includes(
            snap.imageModelId,
          )
            ? snap.imageModelId
            : DEFAULT_IMAGE_MODEL;
        set({ ...snap, imageModelId: safeModel, hydrated: true });
      },
    })),
    { name: "wizard-store" },
  ),
);
