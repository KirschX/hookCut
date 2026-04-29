import { streamObject } from "ai";
import { generateModel } from "@/lib/ai/client";
import {
  GenerateAdsInputSchema,
  GenerateAdsOutputSchema,
} from "@/schemas/ad-proposal";
import {
  GENERATE_ADS_SYSTEM_PROMPT,
  buildGenerateAdsUserMessage,
} from "@/lib/ai/prompts";

export const runtime = "edge";

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "LLM provider not configured" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const parsed = GenerateAdsInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const selectedStorylines = data.analysis.candidates.filter((c) =>
    data.storylines.includes(c.id),
  );

  const result = streamObject({
    model: generateModel(),
    schema: GenerateAdsOutputSchema,
    system: GENERATE_ADS_SYSTEM_PROMPT,
    prompt: buildGenerateAdsUserMessage({
      analysis: data.analysis,
      selectedStorylines,
      targeting: data.targeting,
      format: data.format,
      ratio: data.ratio,
      variantMix: data.variantMix,
      contentMedium: data.contentMedium,
      spoilers: data.analysis.spoilers,
      avoid: data.targeting.avoid,
    }),
    onError: ({ error }) => {
      console.error("[generate-ads] streamObject error", error);
    },
    onFinish: ({ object, error, usage }) => {
      if (error) {
        console.error("[generate-ads] streamObject finish error", {
          error,
          usage,
          objectSample: JSON.stringify(object, null, 2).slice(0, 4000),
        });
      } else {
        console.log("[generate-ads] streamObject finished", {
          usage,
          adsCount: Array.isArray(
            (object as { ads?: unknown[] } | undefined)?.ads,
          )
            ? (object as { ads: unknown[] }).ads.length
            : 0,
        });
      }
    },
    temperature: 0.5,
    maxOutputTokens: 32768,
    // Gemini BPE 토크나이저의 CJK 경계 아티팩트 완화 (googleapis/python-genai#1969).
    // 출력 길이 증가 시 mid-string 토큰 붕괴가 잦아져 thinkingBudget을 충분히 확보.
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 2048,
        },
      },
    },
  });
  return result.toTextStreamResponse();
}
