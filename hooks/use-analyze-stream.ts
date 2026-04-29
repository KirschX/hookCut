"use client";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { AnalysisSchema } from "@/schemas/analysis";
import { useWizardStore } from "@/stores/wizard-store";
import { toast } from "sonner";
import { normalizeError } from "@/lib/api/errors";

export function useAnalyzeStream() {
  const setAnalysis = useWizardStore((s) => s.setAnalysis);
  const setAnalysisStatus = useWizardStore((s) => s.setAnalysisStatus);
  return useObject({
    api: "/api/analyze",
    schema: AnalysisSchema,
    onFinish: ({ object: finalObj, error: finalErr }) => {
      if (finalErr) {
        const e = normalizeError(finalErr);
        setAnalysisStatus("error", e.debugMessage);
        toast.error(e.userMessage);
        return;
      }
      const parsed = AnalysisSchema.safeParse(finalObj);
      if (parsed.success) {
        setAnalysis(parsed.data);
      } else {
        setAnalysisStatus("error", "schema_mismatch");
        toast.error("분석 결과 형식 오류입니다.");
      }
    },
    onError: (err) => {
      const e = normalizeError(err);
      setAnalysisStatus("error", e.debugMessage);
      toast.error(e.userMessage);
    },
  });
}
