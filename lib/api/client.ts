import type { z } from "zod";
import { HookCutApiError } from "./errors";

export async function fetchJson<T>(
  url: string,
  init: RequestInit & { schema: z.ZodType<T>; signal?: AbortSignal },
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { "content-type": "application/json", ...init.headers },
    });
  } catch (e) {
    throw new HookCutApiError("network", "네트워크 오류입니다.", "Fetch failed", true, e);
  }
  if (res.status === 429) {
    throw new HookCutApiError(
      "rate_limit",
      "잠시 후 다시 시도해 주세요.",
      "429",
      true,
    );
  }
  if (res.status === 422) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new HookCutApiError(
      "policy",
      "이미지 정책에 의해 거부되었습니다.",
      body.error ?? "policy",
      false,
    );
  }
  if (res.status >= 400 && res.status < 500) {
    const body = await res.text();
    throw new HookCutApiError(
      "validation",
      "요청을 처리할 수 없습니다.",
      `${res.status}: ${body}`,
      false,
    );
  }
  if (res.status >= 500) {
    throw new HookCutApiError(
      "provider_error",
      "서버 오류입니다.",
      `${res.status}`,
      true,
    );
  }
  let json: unknown;
  try {
    json = await res.json();
  } catch (e) {
    throw new HookCutApiError(
      "schema_mismatch",
      "응답을 해석할 수 없습니다.",
      "Invalid JSON",
      false,
      e,
    );
  }
  const parsed = init.schema.safeParse(json);
  if (!parsed.success) {
    throw new HookCutApiError(
      "schema_mismatch",
      "응답 형식 오류입니다.",
      parsed.error.message,
      false,
    );
  }
  return parsed.data;
}
