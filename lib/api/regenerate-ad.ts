import { fetchJson } from "./client";
import type { z } from "zod";
import { AdProposalSchema, GenerateAdsInputSchema } from "@/schemas/ad-proposal";
import { RegenerateAdOutputSchema } from "@/schemas/regenerate";
import type { AdProposal } from "@/types";

export type RegenerateInput = {
  context: z.infer<typeof GenerateAdsInputSchema>;
  replaceIndex: number;
  hint?: string;
};

export async function postRegenerateAd(
  input: RegenerateInput,
  signal?: AbortSignal,
): Promise<AdProposal> {
  const body = await fetchJson("/api/regenerate-ad", {
    method: "POST",
    body: JSON.stringify(input),
    schema: RegenerateAdOutputSchema,
    signal,
  });
  // Defensive: re-validate ad shape (already inside RegenerateAdOutputSchema, but explicit)
  return AdProposalSchema.parse(body.ad);
}
