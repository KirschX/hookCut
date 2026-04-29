import { streamObject } from "ai";
import { analysisModel } from "@/lib/ai/client";
import { AnalyzeInputSchema, AnalysisSchema } from "@/schemas/analysis";
import { ANALYZE_SYSTEM_PROMPT, buildAnalyzeUserMessage } from "@/lib/ai/prompts";

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
  const parsed = AnalyzeInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const excerpt = data.excerpt.slice(0, 12000);

  const result = streamObject({
    model: analysisModel(),
    schema: AnalysisSchema,
    system: ANALYZE_SYSTEM_PROMPT,
    prompt: buildAnalyzeUserMessage({ ...data, excerpt }),
    temperature: 0.5,
  });

  return result.toTextStreamResponse();
}
