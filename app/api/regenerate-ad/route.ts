import { generateObject } from "ai";
import { generateModel } from "@/lib/ai/client";
import {
  RegenerateAdInputSchema,
  RegenerateAdOutputSchema,
} from "@/schemas/regenerate";
import {
  GENERATE_ADS_SYSTEM_PROMPT,
  buildGenerateAdsUserMessage,
} from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 300;

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
  const parsed = RegenerateAdInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { context, hint } = parsed.data;
  const selectedStorylines = context.analysis.candidates.filter((c) =>
    context.storylines.includes(c.id),
  );

  const hintLine = hint
    ? `\n\n추가 지시: ${hint}\n같은 스토리라인이지만 기존 카피와 다른 각도로.`
    : "\n\n같은 스토리라인이지만 기존 카피와 다른 각도로 한 광고안만 만들어 ad 객체로 반환하세요.";

  try {
    const { object } = await generateObject({
      model: generateModel(),
      schema: RegenerateAdOutputSchema,
      system: GENERATE_ADS_SYSTEM_PROMPT + hintLine,
      prompt: buildGenerateAdsUserMessage({
        analysis: context.analysis,
        selectedStorylines,
        targeting: context.targeting,
        format: context.format,
        ratio: context.ratio,
        variantMix: context.variantMix,
        contentMedium: context.contentMedium,
        spoilers: context.analysis.spoilers,
        avoid: context.targeting.avoid,
      }),
      temperature: 0.65,
      maxOutputTokens: 16384,
      // Gemini CJK 경계 아티팩트 완화 (python-genai#1969).
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 1024,
          },
        },
      },
    });
    return Response.json(object);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Regenerate failed";
    return Response.json({ error: msg }, { status: 502 });
  }
}
