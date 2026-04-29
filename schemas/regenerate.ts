import { z } from "zod";
import { GenerateAdsInputSchema, AdProposalSchema } from "./ad-proposal";

export const RegenerateAdInputSchema = z.object({
  context: GenerateAdsInputSchema,
  replaceIndex: z.number().int().min(0),
  hint: z.string().max(200).optional(),
});

export const RegenerateAdOutputSchema = z.object({
  ad: AdProposalSchema,
});
