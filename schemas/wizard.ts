import { z } from "zod";
import { AnalysisSchema } from "./analysis";
import { TargetingSchema } from "./targeting";
import { FormatSchema, RatioSchema, VariantMixSchema } from "./format";
import { AdProposalSchema } from "./ad-proposal";

export const WizardSnapshotSchema = z.object({
  schemaVersion: z.literal(2).default(2),
  presetId: z.enum(["revenge", "romance"]).optional(),
  contentMedium: z.enum(["novel", "webtoon", "manga"]).default("novel"),
  excerpt: z.string().default(""),
  wikiUrl: z.string().default(""),
  memo: z.string().default(""),
  title: z.string().default(""),
  analysis: AnalysisSchema.nullable().default(null),
  storylines: z.array(z.string()).default([]),
  targeting: TargetingSchema.nullable().default(null),
  format: FormatSchema.default("2-2"),
  ratio: RatioSchema.default("4:5"),
  variantMix: VariantMixSchema.default("stable+experimental"),
  ads: z.array(AdProposalSchema).default([]),
});
export type WizardSnapshot = z.infer<typeof WizardSnapshotSchema>;
