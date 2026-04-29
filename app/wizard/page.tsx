"use client";

import { Suspense, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWizardStore, type Step } from "@/stores/wizard-store";
import { StepRail } from "@/components/wizard/StepRail";
import { StepGuard } from "@/components/wizard/StepGuard";
import { ResultExistsBanner } from "@/components/wizard/ResultExistsBanner";
import { InputStep } from "@/components/wizard/steps/InputStep";
import { AnalysisStep } from "@/components/wizard/steps/AnalysisStep";
import { StorylineStep } from "@/components/wizard/steps/StorylineStep";
import { TargetingStep } from "@/components/wizard/steps/TargetingStep";
import { FormatStep } from "@/components/wizard/steps/FormatStep";
import { ConfirmStep } from "@/components/wizard/steps/ConfirmStep";
import { ResultStep } from "@/components/wizard/steps/ResultStep";

const VALID_STEPS: Exclude<Step, "landing">[] = [
  "input",
  "analysis",
  "storyline",
  "targeting",
  "format",
  "confirm",
  "result",
];

export default function WizardPage() {
  return (
    <Suspense fallback={null}>
      <WizardInner />
    </Suspense>
  );
}

function WizardInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const hydrated = useWizardStore((s) => s.hydrated);

  const param = sp.get("step");
  const step = (VALID_STEPS as string[]).includes(param ?? "")
    ? (param as Exclude<Step, "landing">)
    : "input";

  useEffect(() => {
    if (!param || !VALID_STEPS.includes(param as Exclude<Step, "landing">)) {
      router.replace("/wizard?step=input");
    }
  }, [param, router]);

  const goTo = useCallback(
    (next: Exclude<Step, "landing">) => {
      router.push(`/wizard?step=${next}`, { scroll: false });
    },
    [router],
  );

  const goPrev = useCallback(() => {
    const idx = VALID_STEPS.indexOf(step);
    if (idx <= 0) {
      router.push("/");
    } else {
      router.push(`/wizard?step=${VALID_STEPS[idx - 1]}`, { scroll: false });
    }
  }, [step, router]);

  if (!hydrated) {
    return (
      <>
        <StepRail currentStep={step} />
        <div className="stage" style={{ paddingTop: 80 }}>
          <div
            className="mono subtle"
            style={{
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            세션을 복원하는 중…
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <StepRail currentStep={step} />
      <main>
        <StepGuard step={step} />
        {step !== "result" && <ResultExistsBanner />}
        {step === "input" && (
          <InputStep onNext={() => goTo("analysis")} onPrev={goPrev} />
        )}
        {step === "analysis" && (
          <AnalysisStep onNext={() => goTo("storyline")} onPrev={goPrev} />
        )}
        {step === "storyline" && (
          <StorylineStep onNext={() => goTo("targeting")} onPrev={goPrev} />
        )}
        {step === "targeting" && (
          <TargetingStep onNext={() => goTo("format")} onPrev={goPrev} />
        )}
        {step === "format" && (
          <FormatStep onNext={() => goTo("confirm")} onPrev={goPrev} />
        )}
        {step === "confirm" && (
          <ConfirmStep onNext={() => goTo("result")} onPrev={goPrev} />
        )}
        {step === "result" && <ResultStep onPrev={goPrev} />}
      </main>
    </>
  );
}
