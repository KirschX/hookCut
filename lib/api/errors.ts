export type ApiErrorCode =
  | "network"
  | "timeout"
  | "validation"
  | "rate_limit"
  | "provider_error"
  | "schema_mismatch"
  | "policy"
  | "unknown";

export class HookCutApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    public readonly userMessage: string,
    public readonly debugMessage: string,
    public readonly retryable: boolean,
    public readonly cause?: unknown,
  ) {
    super(debugMessage);
    this.name = "HookCutApiError";
  }
}

export function normalizeError(e: unknown): HookCutApiError {
  if (e instanceof HookCutApiError) return e;
  if (e instanceof DOMException && e.name === "AbortError") {
    return new HookCutApiError(
      "timeout",
      "요청이 취소되었습니다.",
      "Request aborted",
      false,
      e,
    );
  }
  if (e instanceof Error) {
    return new HookCutApiError("unknown", "알 수 없는 오류입니다.", e.message, false, e);
  }
  return new HookCutApiError("unknown", "알 수 없는 오류입니다.", String(e), false);
}
