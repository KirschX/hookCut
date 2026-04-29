"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postCutImage,
  type CutImageInput,
  type CutImageResult,
} from "@/lib/api/cut-image";
import { useWizardStore } from "@/stores/wizard-store";
import { qk } from "@/lib/query/keys";
import { normalizeError, HookCutApiError } from "@/lib/api/errors";
import { toast } from "sonner";

type CutImageMutateInput = Omit<CutImageInput, "modelId">;

export function useCutImage(adIndex: number, cutIndex: number) {
  const setAdCutImageUrl = useWizardStore((s) => s.setAdCutImageUrl);
  const modelId = useWizardStore((s) => s.imageModelId);
  const qc = useQueryClient();
  return useMutation<CutImageResult, HookCutApiError, CutImageMutateInput>({
    mutationFn: (input) =>
      postCutImage({ ...input, modelId }).catch((e) => {
        throw normalizeError(e);
      }),
    onSuccess: (data, input) => {
      setAdCutImageUrl(adIndex, cutIndex, data.imageUrl);
      qc.setQueryData(
        qk.cutImage(adIndex, cutIndex, input.prompt, input.ratio),
        data,
      );
    },
    onError: (err) => {
      if (
        err.code === "policy" ||
        err.code === "validation" ||
        err.code === "schema_mismatch"
      ) {
        toast.error(err.userMessage);
      }
    },
  });
}
