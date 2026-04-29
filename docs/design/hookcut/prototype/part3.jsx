/* global React */
const { useState: useState3, useEffect: useEffect3, useMemo: useMemo3 } = React;
const { presets: P3, analysis: A3 } = window.HookCutData;
const { FootNav: FN3, ArrowRight: AR3, ArrowLeft: AL3, Check: CK3, classNames: cx3 } = window.HookCutPart1;
const { FORMATS: FORMATS3 } = window.HookCutPart2;

/* ================== CONFIRM ================== */
function ConfirmPage({ ctx, next, prev }) {
  const a = A3[ctx.presetId || "revenge"];
  const fmt = FORMATS3.find(f => f.id === (ctx.format || "2-2"));
  const stories = (ctx.storylines || []).map(id => a.candidates.find(c => c.id === id)).filter(Boolean);
  const t = ctx.targeting || {};

  const [generating, setGenerating] = useState3(false);
  const [progress, setProgress] = useState3(0);

  const variantsList = useMemo3(() => {
    const mix = ctx.variantMix || "stable+experimental";
    if (mix === "stable") return stories.map(s => ({ story: s, type: "stable" }));
    if (mix === "experimental+") return stories.flatMap(s => [{ story: s, type: "experimental" }, { story: s, type: "experimental" }]);
    return stories.flatMap(s => [{ story: s, type: "stable" }, { story: s, type: "experimental" }]);
  }, [ctx.variantMix, stories]);

  useEffect3(() => {
    if (!generating) return;
    let p = 0;
    const id = setInterval(() => {
      p += 4 + Math.random() * 6;
      setProgress(Math.min(100, p));
      if (p >= 100) { clearInterval(id); setTimeout(next, 350); }
    }, 120);
    return () => clearInterval(id);
  }, [generating]);

  if (generating) {
    return (
      <div className="stage page-enter">
        <div className="eyebrow">Step 06 · Generating</div>
        <h1 className="page-title">광고 소재를 <em>만들고 있습니다…</em></h1>
        <p className="lede">선택하신 전략에 따라 카피와 이미지 프롬프트를 구성하고, 각 컷을 생성합니다.</p>

        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--ink-3)", textTransform: "uppercase" }}>
              Generating · {variantsList.length} variant{variantsList.length > 1 ? "s" : ""}
            </span>
            <span className="mono" style={{ fontSize: 13, color: "var(--ink)" }}>{Math.floor(progress)}%</span>
          </div>
          <div style={{ height: 4, background: "var(--paper-3)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: progress + "%", height: "100%", background: "var(--accent)", transition: "width 120ms linear" }}></div>
          </div>
          <div className="mt-24" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "스토리라인별 카피 초안 작성",
              "타겟에 맞춘 톤 조정",
              "이미지 프롬프트 구조화",
              "컷 단위 이미지 생성",
              "최종 정렬 및 미리보기 구성",
            ].map((s, i) => {
              const threshold = (i + 1) * 20;
              const done = progress >= threshold;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "16px 1fr auto", gap: 10, alignItems: "center" }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: 999,
                    border: "1.5px solid " + (done ? "var(--good)" : "var(--hairline-strong)"),
                    background: done ? "var(--good)" : "transparent",
                  }}></div>
                  <span style={{ fontSize: 13, color: done ? "var(--ink)" : "var(--ink-3)" }}>{s}</span>
                  <span className="mono" style={{ fontSize: 10, color: done ? "var(--good)" : "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{done ? "OK" : "..."}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stage page-enter">
      <div className="eyebrow">Step 06 · Confirm</div>
      <h1 className="page-title">생성 전에, <em>전략을 확인</em>해주세요.</h1>
      <p className="lede">아래 전략으로 광고 소재가 생성됩니다. 어느 항목이든 클릭해 즉시 수정할 수 있습니다.</p>

      <div className="card" style={{ padding: 28 }}>
        <SummaryRow label="콘텐츠" value={P3[ctx.presetId || "revenge"].title} sub={a.genre} editLabel="콘텐츠 수정" onEdit={() => {}} />
        <SummaryRow
          label="스토리라인"
          value={stories.length === 0 ? "선택 없음" : stories.map(s => s.title).join(" · ")}
          sub={stories.length > 0 ? `${stories.length}개 방향` : ""}
        />
        <SummaryRow
          label="타겟"
          value={[t.age, t.readerType, t.audience].filter(Boolean).join(" · ")}
        />
        <SummaryRow
          label="목적 · 톤"
          value={t.goal}
          sub={(t.tone || []).join(" · ")}
        />
        <SummaryRow
          label="피하기"
          value={(t.avoid || []).join(" · ") || "없음"}
          warn
        />
        <SummaryRow
          label="형식"
          value={fmt.label}
          sub={`이미지 비율 ${ctx.ratio || "4:5"} · 총 ${variantsList.length * (fmt.count / 2 || 2)}컷 예상`}
          last
        />
      </div>

      <h2 className="section-title mt-32">생성될 광고안 <span className="count">{variantsList.length} VARIANTS</span></h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {variantsList.map((v, i) => (
          <div key={i} className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className={cx3("chip", "dot", v.type === "experimental" && "accent")}>
                {v.type === "stable" ? "안정적" : "실험적"} 광고안 {String.fromCharCode(65 + i)}
              </span>
              <span className="mono subtle" style={{ fontSize: 10, letterSpacing: "0.1em" }}>{fmt.label}</span>
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 18, letterSpacing: "-0.005em", marginBottom: 4 }}>{v.story.title}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{v.story.summary}</div>
          </div>
        ))}
      </div>

      <div className="foot-nav">
        <button className="btn ghost" onClick={prev}><AL3 /> 이전</button>
        <button className="btn accent lg" onClick={() => setGenerating(true)}>
          광고 소재 생성 <AR3 />
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, sub, warn, last, editLabel = "수정", onEdit }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 18, alignItems: "baseline",
      padding: "14px 0",
      borderBottom: last ? "none" : "1px dashed var(--hairline)",
    }}>
      <div className="mono" style={{ fontSize: 10.5, color: warn ? "var(--warn)" : "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</div>
      <div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--ink)", letterSpacing: "-0.005em", lineHeight: 1.3 }}>{value || "—"}</div>
        {sub && <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>{sub}</div>}
      </div>
      <button className="btn ghost" style={{ fontSize: 12, padding: "6px 10px" }} onClick={onEdit}>{editLabel}</button>
    </div>
  );
}

/* ================== RESULT ================== */
function ResultPage({ ctx, prev, restart }) {
  const presetId = ctx.presetId || "revenge";
  const a = A3[presetId];
  const t = ctx.targeting || {};
  // If user jumped here without picking storylines, fall back to first 2 candidates
  const storyIds = (ctx.storylines && ctx.storylines.length > 0)
    ? ctx.storylines
    : a.candidates.slice(0, 2).map(c => c.id);
  const stories = storyIds.map(id => a.candidates.find(c => c.id === id)).filter(Boolean);
  const isRomance = presetId === "romance";

  // Generate ad mocks based on storyline
  const ads = useMemo3(() => {
    const mix = ctx.variantMix || "stable+experimental";
    const types = mix === "stable" ? ["stable"] : mix === "experimental+" ? ["experimental", "experimental"] : ["stable", "experimental"];
    const built = stories.flatMap((s, si) => types.map((type, ti) => buildAd(s, type, isRomance, si * 10 + ti)));
    // Safety net: if nothing built, give one fallback
    if (built.length === 0 && a.candidates.length > 0) {
      return [buildAd(a.candidates[0], "stable", isRomance, 0)];
    }
    return built;
  }, [ctx, presetId]);

  const [focusAd, setFocusAd] = useState3(0);
  const safeIdx = Math.min(focusAd, Math.max(0, ads.length - 1));
  const ad = ads[safeIdx];

  if (!ad) {
    return (
      <div className="stage page-enter">
        <div className="eyebrow">Step 07 · Output</div>
        <h1 className="page-title">먼저 <em>이전 단계</em>를 완료해주세요.</h1>
        <p className="lede">광고 소재를 만들려면 콘텐츠와 스토리라인을 먼저 골라야 합니다.</p>
        <button className="btn primary" onClick={prev}>이전 단계로</button>
      </div>
    );
  }

  return (
    <div className="stage page-enter" style={{ maxWidth: 1180 }}>
      <div className="eyebrow">Step 07 · Output</div>
      <h1 className="page-title"><em>{ads.length}개</em>의 광고 소재가 준비되었습니다.</h1>
      <p className="lede">각 광고안에는 이미지 컷, 카피, CTA, 그리고 ‘왜 이 방향으로 만들었는지’가 함께 들어 있습니다. 마음에 들지 않으면 같은 전략으로 재생성하거나 다른 전략으로 다시 시도할 수 있습니다.</p>

      {/* Variant tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
        {ads.map((x, i) => (
          <button
            key={i}
            className={cx3("tag", focusAd === i && "is-on")}
            onClick={() => setFocusAd(i)}
            style={{ padding: "8px 14px" }}
          >
            <span className="mono" style={{ fontSize: 10, marginRight: 6, opacity: 0.7 }}>0{i+1}</span>
            {x.shortName}
          </button>
        ))}
      </div>

      {/* Main result */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr" }}>
          {/* LEFT — visual */}
          <div style={{ padding: 28, background: "var(--paper-2)", borderRight: "1px solid var(--hairline)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span className={cx3("chip", "dot", ad.type === "experimental" && "accent")}>
                {ad.type === "stable" ? "안정적 광고안" : "실험적 광고안"}
              </span>
              <span className="mono subtle" style={{ fontSize: 10.5, letterSpacing: "0.1em" }}>2-CUT · {ctx.ratio || "4:5"}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {ad.cuts.map((c, i) => (
                <div key={i}>
                  <div className={cx3("ad-image", ad.tone)} style={{ aspectRatio: ctx.ratio === "16:9" ? "16/9" : ctx.ratio === "9:16" ? "9/16" : ctx.ratio === "1:1" ? "1/1" : "4/5" }}>
                    <div className="label">
                      <b>CUT {i+1}</b>
                      {c.caption}
                    </div>
                  </div>
                  <div className="mono subtle" style={{ fontSize: 9.5, marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Prompt · {c.prompt}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 18 }}>
              <div className="mono subtle" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>HEADLINE</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 28, lineHeight: 1.15, letterSpacing: "-0.015em", marginBottom: 10, color: "var(--ink)" }}>
                “{ad.headline}”
              </div>
              {ad.sub && <div style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 18 }}>{ad.sub}</div>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px dashed var(--hairline)" }}>
                <span className="mono subtle" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>CTA</span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: 13.5, fontWeight: 600, color: "white",
                  background: "var(--ink)", padding: "8px 14px", borderRadius: 6,
                }}>
                  {ad.cta} <AR3 size={12} />
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — intent + actions */}
          <div style={{ padding: 28, display: "flex", flexDirection: "column" }}>
            <div className="mono subtle" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>광고 의도</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 19, lineHeight: 1.35, letterSpacing: "-0.005em", marginBottom: 22, color: "var(--ink)" }}>
              {ad.intent}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginBottom: 24 }}>
              <KV k="기반 스토리라인" v={ad.story.title} />
              <KV k="목적" v={t.goal || "첫 화 읽기 유도"} />
              <KV k="타겟" v={[t.age, t.readerType].filter(Boolean).join(" · ")} />
              <KV k="톤" v={(t.tone || []).join(" · ")} />
              <KV k="피한 방향" v={(t.avoid || []).join(" · ") || "없음"} muted />
            </div>

            <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button className="btn">카피 복사</button>
              <button className="btn">이미지 다운로드</button>
              <button className="btn">같은 전략 재생성</button>
              <button className="btn primary">다른 전략으로</button>
            </div>
          </div>
        </div>
      </div>

      {/* Other variants — compact gallery */}
      <h2 className="section-title mt-32">다른 광고안 <span className="count">{ads.length - 1} OTHERS</span></h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {ads.map((x, i) => i === focusAd ? null : (
          <div key={i} className="card hover" style={{ padding: 14, cursor: "pointer" }} onClick={() => setFocusAd(i)}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
              {x.cuts.map((c, j) => (
                <div key={j} className={cx3("ad-image", x.tone)} style={{ aspectRatio: "4/5" }}>
                  <div className="label" style={{ fontSize: 8.5, padding: 6 }}><b style={{ fontSize: 9 }}>{j+1}</b></div>
                </div>
              ))}
            </div>
            <span className={cx3("chip", "dot", x.type === "experimental" && "accent")} style={{ fontSize: 9.5 }}>{x.type === "stable" ? "안정적" : "실험적"}</span>
            <div style={{ fontFamily: "var(--serif)", fontSize: 14, lineHeight: 1.25, marginTop: 8, color: "var(--ink)" }}>“{x.headline}”</div>
          </div>
        ))}
      </div>

      <div className="foot-nav">
        <button className="btn ghost" onClick={prev}><AL3 /> 전략 수정</button>
        <button className="btn" onClick={restart}>처음부터 다시 만들기</button>
      </div>
    </div>
  );
}

function KV({ k, v, muted }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10, alignItems: "baseline", paddingBottom: 10, borderBottom: "1px dashed var(--hairline)" }}>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{k}</div>
      <div style={{ fontSize: 13, color: muted ? "var(--ink-3)" : "var(--ink-2)" }}>{v || "—"}</div>
    </div>
  );
}

/* ad builder */
function buildAd(story, type, isRomance, seed) {
  const baseRevenge = {
    "A-stable": {
      shortName: "복수 후킹 · 안정",
      headline: "죽었던 날로 돌아왔다.",
      sub: "이번엔, 내가 먼저 베어낸다.",
      cta: "첫 화 보기",
      tone: "dark",
      cuts: [
        { caption: "형이라 부르던 자에게 베이는 마지막 순간", prompt: "dark medieval hall, betrayed young swordsman, cinematic" },
        { caption: "열일곱의 침실, 다시 뜬 두 눈", prompt: "noble bedroom dawn light, awakening, close-up eyes" },
      ],
      intent: "장르 독자에게 익숙한 ‘회귀-복수’ 도식 위에서, 첫 페이지의 충격을 그대로 광고 면적으로 옮긴 안. 카피는 짧고 단정하게, 이미지는 어둡게 — 클릭 단가가 가장 안전합니다.",
    },
    "A-experimental": {
      shortName: "복수 후킹 · 실험",
      headline: "형이라 부르던 자가, 무릎 꿇는다.",
      sub: "분노로 시작한 이야기. 통쾌함으로 끝낼 수 있을까.",
      cta: "복수의 시작 보기",
      tone: "warm",
      cuts: [
        { caption: "조롱받던 과거의 자신", prompt: "young man kneeling, mocking nobles around, low angle" },
        { caption: "왕좌 앞, 모든 것을 가진 현재", prompt: "throne room, victorious figure, golden hour, dramatic" },
      ],
      intent: "감정 폭을 의도적으로 과장한 안. ‘조롱 → 권력 역전’이라는 시각적 대비를 강조해 후회·복수극 선호 독자에게 깊게 박히도록 설계했습니다. 다만 원작의 톤보다 강해 보일 수 있어 함께 비교용으로 권합니다.",
    },
    "B-stable": {
      shortName: "정체성 · 안정",
      headline: "나는 처음부터 제물이었다.",
      sub: "그 사실을 깨달은 자에게, 이야기는 다시 시작된다.",
      cta: "정체의 시작",
      tone: "",
      cuts: [
        { caption: "촛불 아래 펼쳐진 가문의 족보", prompt: "candlelit table, family ledger, mysterious atmosphere" },
        { caption: "거울 속 자신을 바라보는 카르엔", prompt: "young man facing mirror, dawn, contemplative" },
      ],
      intent: "흔한 회귀물 인상에서 거리를 두고, ‘제물로 길러졌다’는 설정을 전면화한 안. 신규 유입 독자에게 작품의 결을 먼저 보여주는 데 적합합니다.",
    },
    "B-experimental": {
      shortName: "정체성 · 실험",
      headline: "이 가문 전부가, 거짓이었다.",
      cta: "진실 읽기",
      tone: "warm",
      cuts: [
        { caption: "찢긴 가문 문장", prompt: "torn noble crest, ash, dramatic close-up" },
        { caption: "검 손잡이를 다시 잡는 손", prompt: "hand gripping sword hilt, scarred, determined" },
      ],
      intent: "‘설정의 거짓’을 정면으로 노출한 강한 카피 안. 신규 독자에게는 후킹이 강하지만, 스포일러 우려가 있어 노출 범위를 좁게 운영하길 권장합니다.",
    },
    "C-stable": {
      shortName: "관계 역전 · 안정",
      headline: "한 번도 너를 형이라 생각한 적 없다.",
      cta: "관계의 시작",
      tone: "dark",
      cuts: [
        { caption: "어린 시절, 형의 어깨 너머", prompt: "two boys, older one smiling, younger watching, vintage" },
        { caption: "성년의 마주섬", prompt: "two men facing in throne room, sword between" },
      ],
      intent: "관계의 시간 축을 두 컷으로 압축. 후회·복수물 선호 독자에게 가장 효과적인 구도입니다.",
    },
    "C-experimental": {
      shortName: "관계 역전 · 실험",
      headline: "그가 내 이름을 부르는 순간, 이 도시가 무너진다.",
      cta: "이름이 시작되는 곳",
      tone: "warm",
      cuts: [
        { caption: "이름이 새겨진 검", prompt: "engraved sword close-up, dramatic light" },
        { caption: "무너지는 첨탑", prompt: "tower collapsing, smoke, hero silhouette" },
      ],
      intent: "감정 과장과 스케일 과장을 동시에 사용한 실험 안. 트래픽 테스트용으로 짧게 돌리기 좋습니다.",
    },
    "D-stable": {
      shortName: "능력 과시 · 안정",
      headline: "검 한 자루 못 들던 손이었다.",
      sub: "그 손이, 이번엔 모든 것을 베어낸다.",
      cta: "첫 일격 보기",
      tone: "dark",
      cuts: [
        { caption: "흔들리는 손, 떨어지는 검", prompt: "trembling hand dropping sword, dust" },
        { caption: "단 한 번의 베기", prompt: "single sword strike, motion blur, cinematic" },
      ],
      intent: "숏폼·세로 썸네일을 염두에 둔 임팩트 중심 안.",
    },
    "D-experimental": {
      shortName: "능력 과시 · 실험",
      headline: "베어내는 데 한 호흡이면 충분하다.",
      cta: "한 컷, 첫 화",
      tone: "warm",
      cuts: [
        { caption: "정지된 시간 속 검", prompt: "frozen time, sword mid-air, particles" },
        { caption: "베어진 결과만 남은 화면", prompt: "aftermath, fallen enemies, single standing figure" },
      ],
      intent: "‘과정 생략’을 카피와 비주얼 모두에 일관시킨 실험 안.",
    },
  };

  const baseRomance = {
    "A-stable": {
      shortName: "계약 · 안정",
      headline: "절대, 나를 사랑하지 마십시오.",
      sub: "3개월의 가짜 약혼 — 그러나 먼저 무너진 쪽은 그였다.",
      cta: "첫 화 보기",
      tone: "warm",
      cuts: [
        { caption: "계약서 첫 줄", prompt: "elegant contract paper, ink pen, soft warm light" },
        { caption: "두 사람의 손이 멈춘 순간", prompt: "two hands almost touching, chandelier, romantic" },
      ],
      intent: "로판 정공법. 첫 줄의 강한 조건과 마지막 흔들림을 두 컷에 담았습니다.",
    },
    "A-experimental": {
      shortName: "계약 · 실험",
      headline: "그가 먼저 내 이름을 부른 밤.",
      cta: "그 밤 읽기",
      tone: "warm",
      cuts: [
        { caption: "흔들리는 촛불", prompt: "candle flickering close-up, dark warm tones" },
        { caption: "이름을 부르는 입술", prompt: "lips whispering, close-up, soft focus" },
      ],
      intent: "후회·집착 라인을 강하게 끌어올린 실험 안. 클릭 단가는 높지만 이탈도 큽니다.",
    },
    "B-stable": {
      shortName: "후회 · 안정",
      headline: "그가 무너지는 데 걸린 시간, 단 3개월.",
      cta: "공작이 무너지는 이야기",
      tone: "warm",
      cuts: [
        { caption: "북부의 첫 만남", prompt: "snowy north castle, cold meeting, formal" },
        { caption: "변해버린 그의 시선", prompt: "duke gazing softly, candlelit study" },
      ],
      intent: "후회·집착물 독자에게 최적화. 두 컷으로 시간 변화를 보여줍니다.",
    },
  };

  const dict = isRomance ? baseRomance : baseRevenge;
  const key = `${story.id}-${type}`;
  return { ...(dict[key] || dict[`${story.id}-stable`] || Object.values(dict)[0]), type, story };
}

window.HookCutPart3 = { ConfirmPage, ResultPage };
