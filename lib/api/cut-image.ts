import { CutImageOutputSchema, type CutImageInput } from "@/schemas/cut-image";
import { fetchJson } from "./client";
import type { z } from "zod";

export type { CutImageInput } from "@/schemas/cut-image";
export type CutImageResult = z.infer<typeof CutImageOutputSchema>;

export function postCutImage(
  input: CutImageInput,
  signal?: AbortSignal,
): Promise<CutImageResult> {
  return fetchJson("/api/cut-image", {
    method: "POST",
    body: JSON.stringify(input),
    schema: CutImageOutputSchema,
    signal,
  });
}
