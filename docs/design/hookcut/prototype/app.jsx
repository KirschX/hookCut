/* global React, ReactDOM */
const { useState: useStateApp, useEffect: useEffectApp } = React;
const { StepRail, LandingPage, InputPage, AnalysisPage, STEPS } = window.HookCutPart1;
const { StorylinePage, TargetingPage, FormatPage } = window.HookCutPart2;
const { ConfirmPage, ResultPage } = window.HookCutPart3;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentHue": 35,
  "serifHeadlines": true,
  "darkAdMockup": true,
  "showStepRail": true
}/*EDITMODE-END*/;

function App() {
  const [step, setStep] = useStateApp("landing");
  const [maxReached, setMaxReached] = useStateApp("landing");
  const [ctx, setCtx] = useStateApp({});

  // Tweaks
  const [tweaks, setTweak] = (window.useTweaks || ((d) => [d, () => {}]))(TWEAK_DEFAULTS);

  useEffectApp(() => {
    document.documentElement.style.setProperty("--accent", `oklch(0.62 0.18 ${tweaks.accentHue})`);
    document.documentElement.style.setProperty("--accent-2", `oklch(0.55 0.19 ${tweaks.accentHue - 5})`);
    document.documentElement.style.setProperty("--accent-soft", `oklch(0.94 0.04 ${tweaks.accentHue + 5})`);
    document.documentElement.style.setProperty("--accent-ink", `oklch(0.32 0.13 ${tweaks.accentHue})`);
  }, [tweaks.accentHue]);

  const stepIdx = STEPS.findIndex(s => s.id === step);
  const goTo = (id) => {
    setStep(id);
    const newIdx = STEPS.findIndex(s => s.id === id);
    const reachedIdx = STEPS.findIndex(s => s.id === maxReached);
    if (newIdx > reachedIdx) setMaxReached(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const next = () => goTo(STEPS[Math.min(stepIdx + 1, STEPS.length - 1)].id);
  const prev = () => goTo(STEPS[Math.max(stepIdx - 1, 0)].id);
  const restart = () => { setCtx({}); goTo("landing"); setMaxReached("landing"); };

  const pages = {
    landing: <LandingPage next={next} />,
    input: <InputPage ctx={ctx} setCtx={setCtx} next={next} prev={prev} />,
    analysis: <AnalysisPage ctx={ctx} next={next} prev={prev} />,
    storyline: <StorylinePage ctx={ctx} setCtx={setCtx} next={next} prev={prev} />,
    targeting: <TargetingPage ctx={ctx} setCtx={setCtx} next={next} prev={prev} />,
    format: <FormatPage ctx={ctx} setCtx={setCtx} next={next} prev={prev} />,
    confirm: <ConfirmPage ctx={ctx} next={next} prev={prev} />,
    result: <ResultPage ctx={ctx} prev={prev} restart={restart} />,
  };

  const TweaksPanel = window.TweaksPanel;
  const TweakSection = window.TweakSection;
  const TweakSlider = window.TweakSlider;
  const TweakToggle = window.TweakToggle;

  return (
    <>
      <div className="app">
        {tweaks.showStepRail && <StepRail currentStep={step} maxReached={maxReached} goTo={goTo} />}
        <main key={step} style={{ minWidth: 0 }}>
          {pages[step]}
        </main>
      </div>

      {TweaksPanel && (
        <TweaksPanel title="Tweaks">
          <TweakSection title="Visual">
            <TweakSlider label="Accent hue" value={tweaks.accentHue} min={0} max={360} step={1} onChange={(v) => setTweak("accentHue", v)} />
            <TweakToggle label="다크 광고 목업" value={tweaks.darkAdMockup} onChange={(v) => setTweak("darkAdMockup", v)} />
          </TweakSection>
          <TweakSection title="Layout">
            <TweakToggle label="좌측 스텝 레일" value={tweaks.showStepRail} onChange={(v) => setTweak("showStepRail", v)} />
          </TweakSection>
          <TweakSection title="네비게이션">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
              {STEPS.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setMaxReached(s.id); goTo(s.id); }}
                  style={{
                    fontSize: 11, padding: "6px 8px", borderRadius: 6,
                    border: "1px solid " + (step === s.id ? "var(--accent)" : "var(--hairline)"),
                    background: step === s.id ? "var(--accent)" : "var(--paper)",
                    color: step === s.id ? "white" : "var(--ink-2)",
                    fontFamily: "var(--mono)", letterSpacing: "0.04em",
                    cursor: "pointer",
                  }}
                >
                  {s.num} {s.label}
                </button>
              ))}
            </div>
          </TweakSection>
        </TweaksPanel>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
