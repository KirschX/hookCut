"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore, type Step } from "@/stores/wizard-store";

type GuardFn = (s: ReturnType<typeof useWizardStore.getState>) => Step | null;

const guards: Record<Exclude<Step, "landing">, GuardFn> = {
  input: () => null,
  analysis: (s) => (s.excerpt.length >= 50 ? null : "input"),
  storyline: (s) => (s.analysis ? null : "analysis"),
  targeting: (s) => (s.storylines.length > 0 ? null : "storyline"),
  format: (s) => (s.targeting ? null : "targeting"),
  confirm: (s) => (s.targeting && s.format ? null : "format"),
  result: (s) => (s.ads.length > 0 ? null : "confirm"),
};

export function StepGuard({ step }: { step: Exclude<Step, "landing"> }) {
  const router = useRouter();
  const hydrated = useWizardStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const target = guards[step](useWizardStore.getState());
    if (target && target !== step) {
      router.replace(`/wizard?step=${target}`);
    }
  }, [step, hydrated, router]);

  return null;
}
