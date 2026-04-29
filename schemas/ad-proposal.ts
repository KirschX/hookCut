import { z } from "zod";
import { AnalysisSchema } from "./analysis";
import { TargetingSchema } from "./targeting";
import { FormatSchema, RatioSchema, VariantMixSchema } from "./format";

export const BubbleKindSchema = z.enum(["speech", "narration"]);
export type BubbleKind = z.infer<typeof BubbleKindSchema>;

export const BubblePositionSchema = z.enum(["top", "bottom", "left", "right"]);
export type BubblePosition = z.infer<typeof BubblePositionSchema>;

// Gemini structured output 제약 (https://ai.google.dev/gemini-api/docs/structured-output):
// 강제: type, enum, properties, required, items, prefixItems, minItems, maxItems,
//       minimum, maximum, format(date/date-time/time/duration/uuid only), description, nullable.
// 미강제 (silently ignored): minLength, maxLength, format(uri/email), pattern.
// → string 길이/URL 검증은 Gemini가 강제 못 하므로 zod schema에 넣으면 사후 reject 폭탄이 됨.
//   UI display 길이 제약은 클라이언트 측 transform truncate로 수용성 있게 처리한다.
const truncate = (max: number) =>
  z.string().transform((s) => (s.length > max ? s.slice(0, max) : s));

export const AdCutSchema = z.object({
  // UI 라벨 (≤40 권장 — 초과 시 truncate).
  caption: truncate(40),
  // 이미지 prompt 합성용 내부 필드 — UI 미노출. 길이 제한 없음.
  composition: z.string().min(1),
  bubbleKind: BubbleKindSchema,
  bubblePosition: BubblePositionSchema,
  // 이미지 overlay에 burn-in되는 한국어. 8자 이상이면 글리프 가독성 하락 → truncate.
  bubbleText: z
    .string()
    .min(1)
    .transform((s) => (s.length > 8 ? s.slice(0, 8) : s)),
  prompt: z.string().min(1),
  // LLM이 빈 문자열로 채우는 케이스 → undefined 정규화. 실제 imageUrl은 서버가 주입.
  imageUrl: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});
export type AdCut = z.infer<typeof AdCutSchema>;

export const AdProposalSchema = z.object({
  shortName: truncate(40),
  headline: truncate(40),
  sub: z
    .string()
    .optional()
    .transform((v) =>
      v && v.length > 0 ? (v.length > 80 ? v.slice(0, 80) : v) : undefined,
    ),
  cta: truncate(20),
  tone: z.enum(["dark", "warm", "neutral"]).default("neutral"),
  cuts: z.array(AdCutSchema).min(1).max(4),
  // UI에 스크롤로 노출 — 길이 제한 없음.
  intent: z.string().min(1),
  type: z.enum(["stable", "experimental"]),
  storyId: z.string(),
});
export type AdProposal = z.infer<typeof AdProposalSchema>;

export const GenerateAdsInputSchema = z.object({
  analysis: AnalysisSchema,
  storylines: z.array(z.string()).min(1),
  targeting: TargetingSchema,
  format: FormatSchema,
  ratio: RatioSchema,
  variantMix: VariantMixSchema,
  contentMedium: z.enum(["novel", "webtoon", "manga"]).default("novel"),
});
export type GenerateAdsInput = z.infer<typeof GenerateAdsInputSchema>;

export const GenerateAdsOutputSchema = z.object({
  ads: z.array(AdProposalSchema).min(1).max(8),
});
