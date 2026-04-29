/* global React */
const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2 } = React;
const { presets: presets2, analysis: analysis2 } = window.HookCutData;
const { FootNav, ArrowRight: AR, ArrowLeft: AL, Check: CK, classNames: cx } = window.HookCutPart1;

/* ================== STORYLINE ================== */
function StorylinePage({ ctx, setCtx, next, prev }) {
  const a = analysis2[ctx.presetId || "revenge"];
  const selected = ctx.storylines || [];
  const toggle = (id) => {
    const ns = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
    setCtx({ ...ctx, storylines: ns });
  };

  return (
    <div className="stage page-enter">
      <div className="eyebrow">Step 03 · Angle</div>
      <h1 className="page-title">어떤 <em>스토리라인</em>을 광고로 만들까요?</h1>
      <p className="lede">
        AI가 콘텐츠에서 광고화 가능한 방향을 뽑아냈습니다. 하나만 골라도 좋고, 두 개를 골라 비교해도 좋습니다.
        결과 단계에서 각각 다른 광고안이 만들어집니다.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {a.candidates.map((c) => {
          const on = selected.includes(c.id);
          return (
            <div
              key={c.id}
              className={cx("card", "hover", on && "accent-selected")}
              onClick={() => toggle(c.id)}
              style={{ padding: 22, cursor: "pointer", position: "relative" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.16em", marginBottom: 6 }}>OPTION {c.id}</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.15, letterSpacing: "-0.01em" }}>{c.title}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: 999,
                  border: "1.5px solid " + (on ? "var(--accent)" : "var(--hairline-strong)"),
                  background: on ? "var(--accent)" : "transparent",
                  color: "white", display: "grid", placeItems: "center",
                  transition: "all 150ms ease",
                  flexShrink: 0,
                }}>
                  {on && <CK size={11} />}
                </div>
              </div>
              <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.55, marginBottom: 18 }}>
                {c.summary}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                <Row label="Target" value={c.target} />
                <Row label="Pros" value={c.pros.join(" · ")} accent />
                <Row label="Risk" value={c.risks.join(" · ")} warn />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-24" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span className="chip dot">{selected.length} 선택됨</span>
        <button className="btn ghost" onClick={() => setCtx({ ...ctx, storylines: a.candidates.map(c => c.id) })}>
          AI 추천 전체 사용
        </button>
        <button className="btn ghost" onClick={() => setCtx({ ...ctx, storylines: [] })}>초기화</button>
      </div>

      <FootNav onPrev={prev} onNext={next} nextLabel="타겟 설정" canNext={selected.length > 0} />
    </div>
  );
}

function Row({ label, value, accent, warn }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 12, alignItems: "baseline" }}>
      <div className="mono" style={{
        fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
        color: warn ? "var(--warn)" : accent ? "var(--good)" : "var(--ink-4)",
      }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{value}</div>
    </div>
  );
}

/* ================== TARGETING ================== */
const TARGETING = [
  { key: "age", label: "연령대", multi: false, opts: ["10대", "20대 초반", "20대 후반~30대", "40대 이상", "전체"] },
  { key: "readerType", label: "독자 성향", multi: false, opts: ["남성향 판타지", "여성향 로판", "무협 · 선협", "라이트노벨 · 서브컬처", "일반 대중"] },
  { key: "audience", label: "기존 vs 신규", multi: false, opts: ["기존 장르 독자", "신규 유입", "작품을 아는 팬", "이탈 유저 재유입"] },
  { key: "goal", label: "광고 목적", multi: false, opts: ["첫 클릭 유도", "첫 화 읽기 유도", "캐릭터 어필", "세계관 어필", "이벤트 홍보", "팬덤 반응 유도"] },
  { key: "tone", label: "톤앤매너", multi: true, opts: ["강한 후킹", "감성 몰입", "캐릭터 중심", "코믹 · 밈", "고급스럽고 진지", "어두운 분위기", "밝고 캐주얼"] },
  { key: "avoid", label: "피하고 싶은 방향", multi: true, opts: ["과도한 선정성", "과도한 폭력성", "스포일러", "유치한 카피", "낚시성 광고", "원작과 다른 분위기", "캐릭터 왜곡"], warn: true },
];

function TargetingPage({ ctx, setCtx, next, prev }) {
  const t = ctx.targeting || {};
  const set = (key, val) => {
    const def = TARGETING.find(x => x.key === key);
    let nv;
    if (def.multi) {
      const cur = t[key] || [];
      nv = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val];
    } else {
      nv = val;
    }
    setCtx({ ...ctx, targeting: { ...t, [key]: nv } });
  };
  // Defaults
  useEffect2(() => {
    if (!ctx.targeting) {
      setCtx(c => ({ ...c, targeting: {
        age: "20대 후반~30대",
        readerType: "남성향 판타지",
        audience: "기존 장르 독자",
        goal: "첫 화 읽기 유도",
        tone: ["강한 후킹", "어두운 분위기"],
        avoid: ["스포일러", "캐릭터 왜곡"],
      }}));
    }
  }, []);

  return (
    <div className="stage page-enter">
      <div className="eyebrow">Step 04 · Audience & Tone</div>
      <h1 className="page-title">누구에게, <em>어떤 톤으로</em> 보여줄까요?</h1>
      <p className="lede">선택형으로 묻습니다. 답은 광고 카피, 컷 구성, 색감, 정보량까지 모두 영향을 줍니다.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {TARGETING.map((q, i) => {
          const v = t[q.key];
          return (
            <div key={q.key} className="card" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                <div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
                    Q{String(i+1).padStart(2, "0")} {q.multi ? "· 복수 선택" : "· 단일 선택"}
                  </div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 21, letterSpacing: "-0.01em" }}>{q.label}</div>
                </div>
                {q.warn && <span className="chip warn">주의 항목</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {q.opts.map(o => {
                  const on = q.multi ? (v || []).includes(o) : v === o;
                  return (
                    <button
                      key={o}
                      className={cx("tag", q.warn ? "warn-tag" : "accent", on && "is-on")}
                      onClick={() => set(q.key, o)}
                    >
                      {on && q.multi && <CK size={10} />}
                      <span style={{ marginLeft: on && q.multi ? 6 : 0 }}>{o}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <FootNav onPrev={prev} onNext={next} nextLabel="출력 형식" />
    </div>
  );
}

/* ================== FORMAT ================== */
const FORMATS = [
  { id: "2-2", label: "2컷 광고 2쌍", sub: "RECOMMENDED", desc: "안정 1쌍 + 실험 1쌍. 배너·SNS에 가장 잘 맞습니다.", recommended: true, count: 4 },
  { id: "1-1", label: "단일 배너 1장", sub: "BANNER", desc: "한 장으로 끝내는 강한 후킹.", count: 1 },
  { id: "1-3", label: "단일 배너 3장", sub: "BANNER ×3", desc: "버전을 바꿔가며 테스트.", count: 3 },
  { id: "2-1", label: "2컷 광고 1쌍", sub: "MINI", desc: "2컷, 단일 광고안.", count: 2 },
  { id: "4-1", label: "4컷 만화형", sub: "STORYBOARD", desc: "한 줄의 서사를 넣고 싶을 때.", count: 4 },
  { id: "card-3", label: "SNS 카드뉴스 3장", sub: "CARDNEWS", desc: "트위터/인스타에 적합.", count: 3 },
];
const RATIOS = [
  { id: "1:1", label: "1:1", w: 40, h: 40 },
  { id: "4:5", label: "4:5", w: 36, h: 45 },
  { id: "16:9", label: "16:9", w: 50, h: 28 },
  { id: "9:16", label: "9:16", w: 28, h: 50 },
];

function FormatPage({ ctx, setCtx, next, prev }) {
  const fmt = ctx.format || "2-2";
  const ratio = ctx.ratio || "4:5";
  const variants = ctx.variantMix || "stable+experimental";

  return (
    <div className="stage page-enter">
      <div className="eyebrow">Step 05 · Format</div>
      <h1 className="page-title">어떤 <em>형식으로</em> 만들까요?</h1>
      <p className="lede">기본값은 ‘2컷 광고 2쌍’입니다. 안정적인 광고안과 실험적인 광고안을 함께 만들어 비교할 수 있습니다.</p>

      <h2 className="section-title">광고 형식 <span className="count">{FORMATS.length} OPTIONS</span></h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {FORMATS.map(f => {
          const on = fmt === f.id;
          return (
            <div
              key={f.id}
              className={cx("card", "hover", on && "accent-selected")}
              onClick={() => setCtx({ ...ctx, format: f.id })}
              style={{ padding: 18, cursor: "pointer", position: "relative" }}
            >
              {f.recommended && <span className="chip accent dot" style={{ position: "absolute", top: 14, right: 14 }}>추천</span>}
              <FormatGlyph id={f.id} />
              <div style={{ fontFamily: "var(--serif)", fontSize: 18, marginTop: 12, letterSpacing: "-0.005em" }}>{f.label}</div>
              <div className="mono subtle" style={{ fontSize: 10, letterSpacing: "0.1em", marginTop: 4, textTransform: "uppercase" }}>{f.sub}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 10, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <h2 className="section-title">이미지 비율</h2>
          <div style={{ display: "flex", gap: 10 }}>
            {RATIOS.map(r => {
              const on = ratio === r.id;
              return (
                <button
                  key={r.id}
                  className={cx("tag", "accent", on && "is-on")}
                  onClick={() => setCtx({ ...ctx, ratio: r.id })}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 14px", height: 78, justifyContent: "center" }}
                >
                  <div style={{ width: r.w, height: r.h, border: "1.5px solid currentColor", borderRadius: 3 }}></div>
                  <span style={{ fontSize: 11, fontFamily: "var(--mono)" }}>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h2 className="section-title">생성 전략</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "stable", label: "모두 안정적으로", sub: "장르 독자 익숙한 톤" },
              { id: "stable+experimental", label: "안정 1 + 실험 1", sub: "기본 추천" },
              { id: "experimental+", label: "실험적 위주", sub: "과감한 카피·구도" },
            ].map(o => {
              const on = variants === o.id;
              return (
                <button
                  key={o.id}
                  className={cx("card", "hover", on && "selected")}
                  onClick={() => setCtx({ ...ctx, variantMix: o.id })}
                  style={{ padding: "10px 14px", textAlign: "left", border: "1px solid " + (on ? "var(--ink)" : "var(--hairline)"), background: "var(--paper)", display: "grid", gridTemplateColumns: "16px 1fr", gap: 12, alignItems: "center", cursor: "pointer" }}
                >
                  <div style={{
                    width: 14, height: 14, borderRadius: 999,
                    border: "1.5px solid " + (on ? "var(--ink)" : "var(--hairline-strong)"),
                    background: on ? "var(--ink)" : "transparent",
                  }}></div>
                  <div>
                    <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{o.label}</div>
                    <div className="mono subtle" style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{o.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <FootNav onPrev={prev} onNext={next} nextLabel="전략 확인" />
    </div>
  );
}

function FormatGlyph({ id }) {
  const c = "var(--ink-3)";
  const sw = 1.5;
  if (id === "2-2") {
    return (
      <svg width="68" height="36" viewBox="0 0 68 36" fill="none">
        <rect x="1" y="1" width="14" height="34" stroke={c} strokeWidth={sw}/>
        <rect x="17" y="1" width="14" height="34" stroke={c} strokeWidth={sw}/>
        <rect x="37" y="1" width="14" height="34" stroke={c} strokeWidth={sw}/>
        <rect x="53" y="1" width="14" height="34" stroke={c} strokeWidth={sw}/>
      </svg>
    );
  }
  if (id === "1-1") return <svg width="68" height="36" viewBox="0 0 68 36"><rect x="1" y="1" width="66" height="34" stroke={c} strokeWidth={sw} fill="none"/></svg>;
  if (id === "1-3") return (
    <svg width="68" height="36" viewBox="0 0 68 36"><rect x="1" y="1" width="20" height="34" stroke={c} strokeWidth={sw} fill="none"/><rect x="24" y="1" width="20" height="34" stroke={c} strokeWidth={sw} fill="none"/><rect x="47" y="1" width="20" height="34" stroke={c} strokeWidth={sw} fill="none"/></svg>
  );
  if (id === "2-1") return <svg width="68" height="36" viewBox="0 0 68 36"><rect x="1" y="1" width="32" height="34" stroke={c} strokeWidth={sw} fill="none"/><rect x="35" y="1" width="32" height="34" stroke={c} strokeWidth={sw} fill="none"/></svg>;
  if (id === "4-1") return (
    <svg width="68" height="36" viewBox="0 0 68 36">
      <rect x="1" y="1" width="32" height="16" stroke={c} strokeWidth={sw} fill="none"/>
      <rect x="35" y="1" width="32" height="16" stroke={c} strokeWidth={sw} fill="none"/>
      <rect x="1" y="19" width="32" height="16" stroke={c} strokeWidth={sw} fill="none"/>
      <rect x="35" y="19" width="32" height="16" stroke={c} strokeWidth={sw} fill="none"/>
    </svg>
  );
  return (
    <svg width="68" height="36" viewBox="0 0 68 36">
      <rect x="1" y="1" width="20" height="34" stroke={c} strokeWidth={sw} fill="none"/>
      <rect x="24" y="1" width="20" height="34" stroke={c} strokeWidth={sw} fill="none"/>
      <rect x="47" y="1" width="20" height="34" stroke={c} strokeWidth={sw} fill="none"/>
    </svg>
  );
}

window.HookCutPart2 = { StorylinePage, TargetingPage, FormatPage, FORMATS };
