import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { CutImageInputSchema } from "@/schemas/cut-image";
import { composeImagenPrompt } from "@/lib/ai/image-utils";
import { generateAdImage } from "@/lib/ai/client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "LLM provider not configured" },
      { status: 503 },
    );
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Blob storage not configured" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const parsed = CutImageInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const {
    prompt,
    composition,
    bubbleKind,
    bubblePosition,
    bubbleText,
    ratio,
    adIndex,
    cutIndex,
    modelId,
  } = parsed.data;
  const finalPrompt = composeImagenPrompt({
    prompt,
    composition,
    bubbleKind,
    bubblePosition,
    bubbleText,
  });

  let img: { base64: string; mediaType: string } | null = null;
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      img = await generateAdImage({
        modelId,
        prompt: finalPrompt,
        ratio,
      });
      if (img) break;
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : "";
      if (/safety|policy|blocked/i.test(msg)) {
        return Response.json({ error: msg, code: "policy" }, { status: 422 });
      }
    }
  }
  if (!img) {
    const msg =
      lastErr instanceof Error ? lastErr.message : "Image generation failed";
    return Response.json(
      { error: msg, code: "provider_error" },
      { status: 502 },
    );
  }

  const ext = img.mediaType === "image/png" ? "png" : "jpg";
  const bytes = Uint8Array.from(atob(img.base64), (c) => c.charCodeAt(0));
  const fileBlob = new Blob([bytes], { type: img.mediaType });
  const blob = await put(`cuts/${nanoid(12)}.${ext}`, fileBlob, {
    access: "public",
    contentType: img.mediaType,
    cacheControlMaxAge: 60 * 60 * 24 * 7,
  });
  return Response.json({ imageUrl: blob.url, adIndex, cutIndex });
}
