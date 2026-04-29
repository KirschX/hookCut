/* global React, ReactDOM */
const { useState, useEffect, useMemo, useRef } = React;
const { presets, analysis } = window.HookCutData;

/* ================== STEP DEFINITIONS ================== */
const STEPS = [
  { id: "landing",   num: "00", label: "시작",            sub: "Welcome" },
  { id: "input",     num: "01", label: "콘텐츠 입력",      sub: "Source" },
  { id: "analysis",  num: "02", label: "AI 분석",          sub: "Analyze" },
  { id: "storyline", num: "03", label: "스토리라인 선택",  sub: "Angle" },
  { id: "targeting", num: "04", label: "타겟 · 톤",        sub: "Audience" },
  { id: "format",    num: "05", label: "출력 형식",        sub: "Format" },
  { id: "confirm",   num: "06", label: "전략 확인",        sub: "Strategy" },
  { id: "result",    num: "07", label: "광고 소재",        sub: "Output" },
];

/* ================== UTILITIES ================== */
function classNames(...xs) { return xs.filter(Boolean).join(" "); }

function ArrowRight({ size = 14 }) {
  return (
    <svg className="arrow" width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ArrowLeft({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M12 7H2M6 3 2 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function Check({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M2 6.5 5 9.5 10 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ================== STEP RAIL ================== */
function StepRail({ currentStep, maxReached, goTo }) {
  const currentIdx = STEPS.findIndex(s => s.id === currentStep);
  return (
    <aside className="rail">
      <div className="brand">
        <div className="mark">Hook<em>Cut</em></div>
        <div className="ver">v0.1</div>
      </div>
      <div className="brand-sub">Contents → Ads</div>

      <ol className="steps">
        {STEPS.map((s, i) => {
          const reachedIdx = STEPS.findIndex(x => x.id === maxReached);
          const isDone = i < currentIdx;
          const isActive = i === currentIdx;
          const isLocked = i > reachedIdx;
          return (
            <li
              key={s.id}
              className={classNames("step", isDone && "is-done", isActive && "is-active", isLocked && "is-locked")}
              onClick={() => !isLocked && goTo(s.id)}
            >
              <div className="num">{isDone ? <Check /> : s.num}</div>
              <div>
                <div className="label">{s.label}</div>
                <span className="sub">{s.sub}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="rail-foot">
        <div className="row"><span>Project</span><b>제출용 데모</b></div>
        <div className="row"><span>Status</span><b>{currentStep === "result" ? "완료" : "진행중"}</b></div>
      </div>
    </aside>
  );
}

/* ================== LANDING ================== */
function LandingPage({ next }) {
  return (
    <div className="stage page-enter">
      <div className="eyebrow">A Contents-to-Ads workflow</div>
      <h1 className="page-title">콘텐츠를 넣으면,<br/><em>광고 소재가</em> 바로 나옵니다.</h1>
      <p className="lede">
       컨텐츠 본문, 참고 URL, 관련 텍스트 문서를 넣으면 HookCut이 광고 포인트를 분석하고,
        필요한 선택지만 골라 묻고, 타겟에 맞는 광고 배너·컷 이미지를 생성합니다.
        프롬프트를 직접 쓸 필요가 없습니다.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 56 }}>
        <button className="btn primary lg" onClick={next}>
          광고 소재 만들기 <ArrowRight />
        </button>
        <button className="btn lg">예시 결과 보기</button>
      </div>

      {/* What it does — three columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)" }}>
        {[
          { num: "01", t: "콘텐츠를 이해합니다", d: "소설 본문·위키·설정 문서를 분석해 장르, 갈등, 후킹 포인트, 스포일러 위험을 추출합니다." },
          { num: "02", t: "광고 방향을 함께 정합니다", d: "AI가 광고화 가능한 스토리라인 후보를 카드로 제안하고, 타겟·톤·목적을 선택형으로 묻습니다." },
          { num: "03", t: "여러 광고안을 만듭니다", d: "안정적 버전과 실험적 버전을 함께 생성합니다. 광고는 정답 하나가 아니니까요." },
        ].map((x, i) => (
          <div key={i} style={{
            padding: "32px 28px 32px 0",
            paddingLeft: i === 0 ? 0 : 28,
            borderRight: i < 2 ? "1px solid var(--hairline)" : "none",
          }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.16em", marginBottom: 14 }}>{x.num}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.25, marginBottom: 10, letterSpacing: "-0.01em" }}>{x.t}</div>
            <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.6 }}>{x.d}</div>
          </div>
        ))}
      </div>

      {/* Sample result preview */}
      <h2 className="section-title mt-32">미리보기 <span className="count">SAMPLE OUTPUT</span></h2>
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
        <SampleAd
          variant="stable"
          headline="죽었던 날로 돌아왔다."
          sub="이번엔, 내가 먼저 베어낸다."
          cta="첫 화 보기"
          tone="dark"
          captions={["배신당한 마지막 순간", "회귀 후 눈을 뜨는 카르엔"]}
        />
        <SampleAd
          variant="experimental"
          headline="형이라 부르던 자가, 무릎 꿇는다."
          sub=""
          cta="복수의 시작"
          tone="warm"
          captions={["조롱받던 과거", "모든 것을 가진 현재"]}
        />
      </div>

      <div className="mt-32" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, borderTop: "1px solid var(--hairline)" }}>
        <div className="mono subtle" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>For 웹소설 · 캐릭터 IP · 스토리 콘텐츠 · SNS 운영자</div>
        <button className="btn primary" onClick={next}>시작하기 <ArrowRight /></button>
      </div>
    </div>
  );
}

function SampleAd({ headline, sub, cta, tone, captions, variant }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span className={classNames("chip", "dot", variant === "experimental" && "accent")}>
          {variant === "stable" ? "안정적 광고안" : "실험적 광고안"}
        </span>
        <span className="mono subtle" style={{ fontSize: 10, letterSpacing: "0.1em" }}>2-CUT · 4:5</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {captions.map((c, i) => (
          <div key={i} className={classNames("ad-image", tone)} style={{ aspectRatio: "4/5" }}>
            <div className="label"><b>CUT {i+1}</b>{c}</div>
          </div>
        ))}
      </div>
      <div className="mt-16" style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
        “{headline}”
      </div>
      {sub && <div className="mt-8 muted" style={{ fontSize: 13.5 }}>{sub}</div>}
      <div className="mt-16" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="mono subtle" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>CTA</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{cta} →</span>
      </div>
    </div>
  );
}

/* ================== INPUT ================== */
function InputPage({ ctx, setCtx, next, prev }) {
  const [tab, setTab] = useState("text");
  const presetId = ctx.presetId || "revenge";
  const preset = presets[presetId];

  const setPreset = (id) => {
    setCtx({ ...ctx, presetId: id, excerpt: presets[id].excerpt, wikiUrl: presets[id].wikiUrl, memo: presets[id].memo, title: presets[id].title });
  };

  useEffect(() => {
    if (!ctx.excerpt) {
      setCtx(c => ({ ...c, presetId: "revenge", ...presets.revenge, excerpt: presets.revenge.excerpt, wikiUrl: presets.revenge.wikiUrl, memo: presets.revenge.memo }));
    }
  }, []);

  return (
    <div className="stage page-enter">
      <div className="eyebrow">Step 01 · Source</div>
      <h1 className="page-title">콘텐츠를 <em>넣어주세요</em>.</h1>
      <p className="lede">
        본문, 위키 URL, 설정 문서 — 어떤 형태든 좋습니다. 여러 자료를 함께 넣을수록 분석이 정확해집니다.
        프로토타입에서는 미리 준비된 두 작품 중 하나로 시작합니다.
      </p>

      {/* Preset switch */}
      <div className="mb-24">
        <span className="field-label">데모 콘텐츠</span>
        <div style={{ display: "flex", gap: 8 }}>
          {Object.values(presets).map(p => (
            <button
              key={p.id}
              className={classNames("tag", presetId === p.id && "is-on")}
              onClick={() => setPreset(p.id)}
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              {p.title} · <span style={{ opacity: 0.7, marginLeft: 4 }}>{p.genre}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tab-row" style={{ marginBottom: 0, padding: "0 18px" }}>
          {[
            { id: "text", n: "01", label: "본문 텍스트" },
            { id: "url", n: "02", label: "위키 / URL" },
            { id: "file", n: "03", label: "문서 업로드" },
          ].map(t => (
            <button key={t.id} className={classNames("tab", tab === t.id && "is-active")} onClick={() => setTab(t.id)}>
              <span className="num">{t.n}</span> {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 22 }}>
          {tab === "text" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className="field-label" style={{ marginBottom: 0 }}>본문 발췌 — 1~5화 분량 권장</span>
                <span className="mono subtle" style={{ fontSize: 11 }}>{(ctx.excerpt || "").length.toLocaleString()} chars</span>
              </div>
              <textarea
                className="textarea"
                value={ctx.excerpt || ""}
                onChange={(e) => setCtx({ ...ctx, excerpt: e.target.value })}
                placeholder="소설 본문을 붙여넣어 주세요…"
                style={{ minHeight: 220, fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.7 }}
              />
            </>
          )}
          {tab === "url" && (
            <>
              <span className="field-label">위키 / 작품 소개 페이지 URL</span>
              <input
                className="input"
                value={ctx.wikiUrl || ""}
                onChange={(e) => setCtx({ ...ctx, wikiUrl: e.target.value })}
                placeholder="https://wiki.example.com/..."
              />
              <div className="mt-16 mono subtle" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
                + URL 추가
              </div>
            </>
          )}
          {tab === "file" && (
            <div style={{
              border: "1.5px dashed var(--hairline-strong)",
              borderRadius: "var(--radius)",
              padding: "48px 24px",
              textAlign: "center",
              color: "var(--ink-3)",
            }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Drop files here</div>
              <div style={{ fontSize: 13.5 }}>.txt · .docx · .pdf · .md — 최대 10MB</div>
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--hairline)", padding: 22 }}>
          <span className="field-label">추가 요청 (선택)</span>
          <input
            className="input"
            value={ctx.memo || ""}
            onChange={(e) => setCtx({ ...ctx, memo: e.target.value })}
            placeholder="예: 강한 후킹형으로 만들고 싶다 / 여성향 로맨스 독자에게 맞추고 싶다"
          />
        </div>
      </div>

      <FootNav onPrev={prev} onNext={next} nextLabel="분석 시작" canNext={(ctx.excerpt || "").length > 50} />
    </div>
  );
}

/* ================== ANALYSIS ================== */
function AnalysisPage({ ctx, next, prev }) {
  const [phase, setPhase] = useState("loading"); // loading | done
  const a = analysis[ctx.presetId || "revenge"];

  useEffect(() => {
    setPhase("loading");
    const t = setTimeout(() => setPhase("done"), 2200);
    return () => clearTimeout(t);
  }, [ctx.presetId]);

  if (phase === "loading") {
    return (
      <div className="stage page-enter">
        <div className="eyebrow">Step 02 · Analyze</div>
        <h1 className="page-title">콘텐츠를 <em>읽고 있습니다…</em></h1>
        <p className="lede">광고 제작에 필요한 정보를 추출하는 중입니다. 보통 10~20초가 걸립니다.</p>

        <div className="card mt-16">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "본문 구조 분석",
              "주요 인물 및 관계 추출",
              "핵심 갈등과 후킹 포인트 추출",
              "스포일러 위험 영역 표시",
              "광고화 가능한 스토리라인 탐색",
            ].map((s, i) => (
              <AnalysisLine key={i} label={s} delay={i * 380} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stage page-enter">
      <div className="eyebrow">Step 02 · Analyze · 완료</div>
      <h1 className="page-title">분석이 <em>끝났습니다.</em></h1>
      <p className="lede">아래 정보를 광고 제작의 출발점으로 사용합니다. 다음 단계에서 어떤 방향으로 광고화할지 고르게 됩니다.</p>

      {/* Top meta row */}
      <div className="card mb-24" style={{ padding: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }}>
          <Meta label="장르" value={a.genre} />
          <Meta label="감정 톤" value={a.tone.join(" · ")} />
          <Meta label="추출된 후킹" value={`${a.hooks.length}개`} />
        </div>
        <hr className="divider" style={{ margin: "20px 0" }} />
        <div>
          <span className="field-label">핵심 갈등</span>
          <div style={{ fontFamily: "var(--serif)", fontSize: 19, lineHeight: 1.45, color: "var(--ink)", letterSpacing: "-0.005em" }}>
            “{a.coreConflict}”
          </div>
        </div>
      </div>

      {/* Two columns: characters + hooks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <h2 className="section-title">주요 인물 <span className="count">{a.characters.length} CHARACTERS</span></h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {a.characters.map((c, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, alignItems: "baseline", paddingBottom: 12, borderBottom: i < a.characters.length - 1 ? "1px dashed var(--hairline)" : "none" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--ink)" }}>{c.name}</div>
                <div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{c.role}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{c.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">광고화 후킹 포인트 <span className="count">HOOK CANDIDATES</span></h2>
          <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
            {a.hooks.map((h, i) => (
              <li key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 8 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.08em" }}>0{i+1}</span>
                <span style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--ink)", lineHeight: 1.35 }}>{h}</span>
              </li>
            ))}
          </ol>

          <hr className="divider" style={{ margin: "20px 0 16px" }} />
          <h2 className="section-title" style={{ marginBottom: 10 }}>스포일러 주의 <span className="count">DO NOT REVEAL</span></h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {a.spoilers.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "var(--ink-2)" }}>
                <span style={{ marginTop: 6, width: 6, height: 6, background: "var(--warn)", borderRadius: 999, flexShrink: 0 }}></span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <FootNav onPrev={prev} onNext={next} nextLabel="광고 방향 선택" />
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--ink)", letterSpacing: "-0.005em" }}>{value}</div>
    </div>
  );
}

function AnalysisLine({ label, delay }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), delay + 600);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "20px 1fr auto", gap: 12, alignItems: "center" }}>
      <div style={{
        width: 16, height: 16, borderRadius: 999,
        border: "1.5px solid " + (done ? "var(--good)" : "var(--hairline-strong)"),
        background: done ? "var(--good)" : "transparent",
        color: "white", display: "grid", placeItems: "center",
        transition: "all 250ms ease",
      }}>
        {done && <Check size={9} />}
      </div>
      <span style={{ fontSize: 14, color: done ? "var(--ink)" : "var(--ink-3)" }}>{label}</span>
      <span className="mono" style={{ fontSize: 10, color: done ? "var(--good)" : "var(--ink-4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {done ? "OK" : <span className="dots"><span></span><span></span><span></span></span>}
      </span>
    </div>
  );
}

window.HookCutPart1 = { StepRail, LandingPage, InputPage, AnalysisPage, STEPS, classNames, ArrowLeft, ArrowRight, Check };

/* Foot nav defined here too — used widely */
function FootNav({ onPrev, onNext, prevLabel = "이전", nextLabel = "다음", canNext = true }) {
  return (
    <div className="foot-nav">
      <button className="btn ghost" onClick={onPrev}><ArrowLeft /> {prevLabel}</button>
      <button className="btn primary" onClick={onNext} disabled={!canNext} style={{ opacity: canNext ? 1 : 0.4, cursor: canNext ? "pointer" : "not-allowed" }}>
        {nextLabel} <ArrowRight />
      </button>
    </div>
  );
}
window.HookCutPart1.FootNav = FootNav;
