import { z } from "zod";

export const FormatSchema = z.enum(["2-2", "1-1", "1-3", "2-1", "4-1", "card-3"]);
export type FormatId = z.infer<typeof FormatSchema>;

export const RatioSchema = z.enum(["1:1", "4:5", "16:9", "9:16"]);
export type RatioId = z.infer<typeof RatioSchema>;

export const VariantMixSchema = z.enum(["stable", "stable+experimental", "experimental+"]);
export type VariantMix = z.infer<typeof VariantMixSchema>;

export const FORMATS: ReadonlyArray<{
  id: FormatId;
  label: string;
  sub: string;
  desc: string;
  recommended?: boolean;
  count: number;
}> = [
  { id: "2-2", label: "2컷 광고 2쌍", sub: "RECOMMENDED", desc: "안정 1쌍 + 실험 1쌍. 배너·SNS에 가장 잘 맞습니다.", recommended: true, count: 4 },
  { id: "1-1", label: "단일 배너 1장", sub: "BANNER", desc: "한 장으로 끝내는 강한 후킹.", count: 1 },
  { id: "1-3", label: "단일 배너 3장", sub: "BANNER ×3", desc: "버전을 바꿔가며 테스트.", count: 3 },
  { id: "2-1", label: "2컷 광고 1쌍", sub: "MINI", desc: "2컷, 단일 광고안.", count: 2 },
  { id: "4-1", label: "4컷 만화형", sub: "STORYBOARD", desc: "한 줄의 서사를 넣고 싶을 때.", count: 4 },
  { id: "card-3", label: "SNS 카드뉴스 3장", sub: "CARDNEWS", desc: "트위터/인스타에 적합.", count: 3 },
];

export const RATIOS: ReadonlyArray<{ id: RatioId; label: string; w: number; h: number }> = [
  { id: "1:1", label: "1:1", w: 40, h: 40 },
  { id: "4:5", label: "4:5", w: 36, h: 45 },
  { id: "16:9", label: "16:9", w: 50, h: 28 },
  { id: "9:16", label: "9:16", w: 28, h: 50 },
];

export const VARIANT_OPTIONS = [
  { id: "stable" as const, label: "모두 안정적으로", sub: "장르 독자 익숙한 톤" },
  { id: "stable+experimental" as const, label: "안정 1 + 실험 1", sub: "기본 추천" },
  { id: "experimental+" as const, label: "실험적 위주", sub: "과감한 카피·구도" },
];

export function ratioToCss(r: RatioId): string {
  return r.replace(":", "/");
}
