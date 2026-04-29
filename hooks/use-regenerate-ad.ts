"use client";
import { useMutation } from "@tanstack/react-query";
import {
  postRegenerateAd,
  type RegenerateInput,
} from "@/lib/api/regenerate-ad";
import { useWizardStore } from "@/stores/wizard-store";
import { normalizeError, HookCutApiError } from "@/lib/api/errors";
import { toast } from "sonner";
import type { AdProposal } from "@/types";

export function useRegenerateAd() {
  const setAdAt = useWizardStore((s) => s.setAdAt);
  return useMutation<AdProposal, HookCutApiError, RegenerateInput>({
    mutationFn: (input) =>
      postRegenerateAd(input).catch((e) => {
        throw normalizeError(e);
      }),
    onSuccess: (ad, input) => {
      setAdAt(input.replaceIndex, ad);
      toast.success("광고안을 재생성했습니다.");
    },
    onError: (err) => toast.error(err.userMessage),
  });
}
