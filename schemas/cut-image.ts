import { z } from "zod";
import { RatioSchema } from "./format";
import { BubbleKindSchema, BubblePositionSchema } from "./ad-proposal";
import { SUPPORTED_IMAGE_MODELS } from "@/lib/ai/client";

export const ImageModelIdSchema = z.enum(SUPPORTED_IMAGE_MODELS);
export type ImageModelId = z.infer<typeof ImageModelIdSchema>;

// 입력은 LLM이 채운 AdCut에서 흘러옴. AdCutSchema가 이미 truncate transform으로 정규화했고,
// Imagen은 긴 prompt를 잘 처리하므로 길이 강제 불필요. 비어있는 것만 차단.
export const CutImageInputSchema = z.object({
  prompt: z.string().min(1),
  composition: z.string().min(1),
  bubbleKind: BubbleKindSchema,
  bubblePosition: BubblePositionSchema,
  bubbleText: z.string().min(1),
  ratio: RatioSchema,
  adIndex: z.number().int().min(0).max(7),
  cutIndex: z.number().int().min(0).max(3),
  modelId: ImageModelIdSchema,
});
export type CutImageInput = z.infer<typeof CutImageInputSchema>;

export const CutImageOutputSchema = z.object({
  imageUrl: z.string().url(),
  adIndex: z.number().int(),
  cutIndex: z.number().int(),
});
export type CutImageOutput = z.infer<typeof CutImageOutputSchema>;
