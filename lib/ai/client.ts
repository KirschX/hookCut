import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { RatioId } from "@/schemas/format";

export const ANALYSIS_MODEL_ID =
  process.env.GOOGLE_ANALYSIS_MODEL ?? "gemini-2.5-flash";

export const GENERATE_MODEL_ID =
  process.env.GOOGLE_GENERATE_MODEL ?? "gemini-2.5-flash";

export function analysisModel() {
  return google(ANALYSIS_MODEL_ID);
}

export function generateModel() {
  return google(GENERATE_MODEL_ID);
}

export const SUPPORTED_IMAGE_MODELS = [
  "gemini-3.1-flash-image-preview",
  "gemini-3-pro-image-preview",
  "gemini-2.5-flash-image",
] as const;
export type ImageModelId = (typeof SUPPORTED_IMAGE_MODELS)[number];
export const DEFAULT_IMAGE_MODEL: ImageModelId =
  "gemini-3.1-flash-image-preview";

export async function generateAdImage(args: {
  modelId: ImageModelId;
  prompt: string;
  ratio: RatioId;
}): Promise<{ base64: string; mediaType: string }> {
  const result = await generateText({
    model: google(args.modelId),
    prompt: args.prompt,
    providerOptions: {
      google: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: args.ratio,
          // 2.5 flash image 는 imageSize 미지원 — 3.x preview 부터 지원.
          ...(args.modelId !== "gemini-2.5-flash-image"
            ? { imageSize: "1K" as const }
            : {}),
        },
      },
    },
  });
  const file = result.files.find((f) => f.mediaType.startsWith("image/"));
  if (!file) throw new Error("No image in response");
  return { base64: file.base64, mediaType: file.mediaType };
}
