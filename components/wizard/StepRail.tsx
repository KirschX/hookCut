"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useWizardStore,
  STEPS,
  STEP_INDEX,
  type Step,
} from "@/stores/wizard-store";
import { Check } from "@/components/primitives/icons";
import { classNames } from "@/lib/utils";
import { ModelPicker } from "@/components/wizard/ModelPicker";

function maxReachedStep(s: ReturnType<typeof useWizardStore.getState>): Step {
  if (s.ads.length > 0) return "result";
  if (s.targeting && s.format) return "confirm";
  if (s.targeting) return "format";
  if (s.storylines.length > 0) return "targeting";
  if (s.analysis) return "storyline";
  if (s.excerpt.length >= 50) return "analysis";
  return "input";
}

export function StepRail({ currentStep }: { currentStep: Step }) {
  const router = useRouter();
  const state = useWizardStore();
  const maxReached = maxReachedStep(state);
  const reachedIdx = STEP_INDEX[maxReached];
  const currentIdx = STEP_INDEX[currentStep];

  const goTo = (id: Step) => {
    if (id === "landing") router.push("/");
    else router.push(`/wizard?step=${id}`);
  };

  return (
    <aside className="rail">
      <Link
        href="/"
        className="brand"
        style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
      >
        <div className="mark">
          Hook<em>Cut</em>
        </div>
        <div className="ver">v0.1</div>
      </Link>
      <div className="brand-sub">Contents → Ads</div>

      <ol className="steps">
        {STEPS.filter((s) => s.id !== "landing").map((s) => {
          const idx = STEP_INDEX[s.id];
          const isDone = idx < currentIdx;
          const isActive = s.id === currentStep;
          const isLocked = idx > reachedIdx;
          return (
            <li key={s.id} style={{ listStyle: "none" }}>
              <button
                type="button"
                className={classNames(
                  "step",
                  isDone && "is-done",
                  isActive && "is-active",
                  isLocked && "is-locked",
                )}
                onClick={() => !isLocked && goTo(s.id)}
                disabled={isLocked}
                aria-current={isActive ? "step" : undefined}
              >
                <div className="num">{isDone ? <Check /> : s.num}</div>
                <div>
                  <div className="label">{s.label}</div>
                  <span className="sub">{s.sub}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="rail-bottom">
        <ModelPicker />
      </div>
    </aside>
  );
}
