# HookCut — 통합 Fix 문서

> 초안 plan(`01-plan.md`) 구현 중 발견된 결함과 그 조치를 한 문서로 정리.
> 모든 항목 적용 완료 상태.

---

## 1. Strict Mode / 비동기 가드 (P0)

### 증상

`/wizard?step=analysis` 진입 시 페이지가 영구히 "콘텐츠를 읽고 있습니다…" 로딩에서 멈춤. `curl POST /api/analyze`는 즉시 200 정상 JSON.

### 원인

`AnalysisStep.tsx`의 두 useEffect와 React 19 Strict Mode (Next.js 16 dev 기본값) 상호작용:

1. 첫 mount의 `experimental_useObject` submit 발사
2. Strict Mode synthetic unmount cleanup이 `useEffect(() => () => stop(), [stop])`를 실행 → fetch abort
3. 두 번째 mount는 `submittedRef.current === true` 가드에 걸려 재시도 안 됨
4. 결과: 어떤 응답도 받지 못하고 `onFinish` 미호출, `setAnalysis` 미호출, phase 전환 영구 차단

### 동일 패턴 탐색

| 파일 | 패턴 | 평가 |
| --- | --- | --- |
| `AnalysisStep.tsx` | submit + `() => stop()` cleanup + `submittedRef` (자동 발사) | 버그 확정 — 매번 재현 |
| `ConfirmStep.tsx` | 동일 패턴 (사용자 클릭으로 발사) | 잠재 버그 — unmount/remount 케이스 미커버 |
| `InputStep.tsx`, `TargetingStep.tsx` | 멱등 setInput / setTargeting | 무해 |
| `HydrateClient.tsx` | hydrate + subscribe | 멱등이라 무해 |
| `ResultStep.tsx` regenerate | 사용자 클릭 핸들러 안의 fetch | 저위험 |

### 조치

1. **`submittedRef` 제거** — store의 `analysisStatus`를 진실의 원천으로:
   - `analysis`가 있으면 자동 발사 안 함
   - `analysisStatus === "loading"` 이고 in-flight면 추가 호출 차단
   - `idle` / `error`일 때만 자동 발사
2. **`useEffect(() => () => stop(), [stop])` 삭제** — Strict Mode cleanup이 fetch를 abort하는 1차 원인. 사용자가 페이지 navigate한 경우엔 router unmount + SDK 내부 정리에 위임
3. submit useEffect의 deps 명시 (`[analysis, analysisStatus, excerpt, wikiUrl, memo, contentMedium]`) → React가 effect 동등성으로 중복 실행 방지
4. 재시도 버튼은 `setAnalysisStatus("idle")` 호출 후 effect가 자동 재발사 (별도 imperative submit 불필요)
5. `ConfirmStep`도 동일 패턴 정리 (`adsStatus`를 가드)
6. `ResultStep` regenerate에 AbortController 도입 (낮은 우선순위)

**Strict Mode를 끄지 않는다.** 끄는 것은 증상 가리기일 뿐, 프로덕션의 fast refresh / Suspense 회복 시나리오에서 동일 이슈 재발. 모든 effect는 멱등 또는 idempotent guard 보장.

---

## 2. ConfirmStep → Result 전이 race (이슈 #2 final-polish)

### 증상

Confirm(06)에서 '광고 소재 생성' 클릭 → LLM 진행 중 로딩 화면 → **잠깐 confirm summary로 돌아갔다가** → 이미지 로딩 화면 → result 자동 진입. 중간 깜빡임으로 UX 혼란.

### 원인

`ConfirmStep.tsx` early-return 가드: `adsStatus==='loading' || isLoading || imagesPhase==='loading'`.

LLM 스트림 종료 → `setAds()` → `adsStatus='done'`이 되지만, `useGenerateAllCutImages` effect가 이번 tick에 실행되기 전엔 `imagesPhase`는 여전히 `'idle'` → 가드 false → confirm summary 한 프레임 노출 → 다음 tick에 `setImagesStatus('loading')` → 가드 true 복귀. **상태 전이 사이의 race**. 추가로 `onAllDone()`의 `setTimeout(onNext, 350)`도 마지막에 confirm summary를 350ms 노출.

### 조치

1. 단일 `phase` enum 도입 (`idle | text-loading | image-loading | done`) — 두 비동기 작업을 하나의 진행 상태 머신으로 통합
2. early-return 가드를 `phase !== 'idle' && phase !== 'done-summary'`로 단순화 → 한 프레임 race 제거
3. `setTimeout(onNext, 350)` 제거 — 즉시 `router.push("/wizard?step=result")`. 진행률 바도 0% → 100%까지 단조 증가
4. `useGenerateAllCutImages`는 LLM `done` 직후 동기 dispatch로 phase 전환 (effect tick 의존 제거)

결과: '광고 소재 생성' 클릭 → result 도달까지 **단 한 번의 끊김 없는 로딩 화면**. 중간 깜빡임 0건.

---

## 3. Mock 분기 제거 + Anthropic → Gemini 전환 (P0)

### 변경 동기

- 초안 plan은 Anthropic Claude Sonnet 4.5 단일 provider로 작성됨
- Anthropic 키 미확보, Gemini 키 확보 → provider 전환이 즉시 합리적
- 비용: Gemini 2.5 Flash가 Claude Sonnet 4.5 대비 약 10배 저렴 (입력 $0.30/M vs $3/M, 출력 $2.50/M vs $15/M)
- Mock 코드는 데모 검증을 마쳤으므로 production 빌드에서는 데드 코드

### Provider / 모델 결정

- Provider: `@ai-sdk/google` (Google AI Studio direct, **not** Vertex AI — GCP 서비스 계정 회피)
- 기본 모델: `gemini-2.5-flash` (분석/생성 동일)
- 환경변수: `GOOGLE_ANALYSIS_MODEL`, `GOOGLE_GENERATE_MODEL` — 길이 제약 미달 시 `gemini-2.5-pro`로 한 줄 승격 가능
- Fallback / 멀티 provider 토글은 추가하지 않음 — 추상화 비용 > 가치

### 코드 변경

```bash
pnpm add @ai-sdk/google
pnpm remove @ai-sdk/anthropic
```

`lib/ai/client.ts`:
```ts
import { google } from "@ai-sdk/google";
export const ANALYSIS_MODEL_ID = process.env.GOOGLE_ANALYSIS_MODEL ?? "gemini-2.5-flash";
export const GENERATE_MODEL_ID = process.env.GOOGLE_GENERATE_MODEL ?? "gemini-2.5-flash";
export function analysisModel() { return google(ANALYSIS_MODEL_ID); }
export function generateModel() { return google(GENERATE_MODEL_ID); }
```

호출부(route 3개, schema, prompts, 클라이언트 훅)는 수정 불필요 — provider 추상화 효과.

### Mock 분기 제거

`app/api/{analyze,generate-ads,regenerate-ad}/route.ts`의 다음 블록 삭제:
```ts
if (process.env.NEXT_PUBLIC_USE_MOCK === "1" || !process.env.ANTHROPIC_API_KEY) {
  return Response.json(...mock...);
}
```

대신 환경변수 누락 case를 위해 명시 가드:
```ts
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  return Response.json({ error: "LLM provider not configured" }, { status: 503 });
}
```

### 보존 결정

`lib/ads/mock-builder.ts`와 `data/presets.ts`의 `analysisMock`은 route에서만 import 제거. 파일은 유지:
- `presets.{revenge,romance}` — InputStep 데모 토글이 시연용 본문으로 사용
- `analysisMock` — 향후 dev/CI 테스트 재사용

### 검증 결과

- 분석 1회 5–12s, 생성 1회 10–25s (Edge 30s 한도 내)
- 표본 10회 모두 카피 길이 제약 (`headline ≤ 40자`, `cta ≤ 20자`) 준수
- 한국어 톤 자연스러움, 스포일러 회피 항목 0건 노출

---

## 4. 이미지 모델 — Imagen → Gemini-native 전환 (한국어 글리프)

### 증상

Imagen 4 fast는 LLM이 작성한 영문 prompt를 받지만, 따옴표 안 한국어 문구 ("복수다", "그날 밤" 등)가 화면에 가짜 한글("지데뿔자번쇼")로 박힘. **Imagen 4 모델군의 한국어 글리프 자체 미지원**임이 web search·공식 문서로 확인.

### 조치

1. **이미지 생성 모델을 Imagen 4 → Gemini 3.1 Flash Image Preview로 교체** (Nano Banana 2). 한국어 포함 multilingual text rendering이 모델 차원에서 지원
2. SDK 인터페이스 차이: Imagen은 전용 `experimental_generateImage`를 썼으나 Gemini-native는 `generateText` + `responseModalities: ["IMAGE"]` 경로
3. `lib/ai/client.ts`에 image client 시그니처 재작성 (`generateAdImage()`)
4. `app/api/cut-image/route.ts` Imagen 호출부 교체

### 좌측 하단 ModelPicker 추가

`components/wizard/ModelPicker.tsx` — `StepRail` 최하단 (margin-top:auto + flex-shrink:0)에 sticky 부착. 사용자가 3개 중 즉시 전환 가능:

- `gemini-3.1-flash-image-preview` — Nano Banana 2 (기본값)
- `gemini-3-pro-image-preview` — Nano Banana Pro (고품질)
- `gemini-2.5-flash-image` — 원조 Nano Banana (레거시·비교용)

선택 결과는 세션 동안 유지 (Zustand store). LLM(텍스트) 모델 선택은 변경 없음.

### bubbleText schema 분리

Gemini-native도 prose 안 따옴표 한국어가 길어지면 글리프 깨짐. → `AdCutSchema`에서 `bubbleText`(2~8자, 4~6자 권장)를 별 필드로 분리하고, `prompt`에 한국어 0건을 명시. 말풍선 텍스트는 **서버에서 overlay 합성** (burn-in 안정성).

`composeImagenPrompt`(legacy 명칭 유지)에서 prompt 3회 반복으로 LLM 단계 결정론도 보강.

---

## 5. ModelPicker UI 정렬 (이슈 #1 final-polish)

### 증상

좌측 하단 모델 셀렉터 UI가 다른 UI와 겹치고, 디자인이 어울리지 않는다. 짧은 뷰포트에서 step 마지막 항목과 시각적으로 닿음. native `<select>` 톤이 카드/버튼과 어긋남.

### 원인

`StepRail.tsx`의 `<div className="rail-bottom"><ModelPicker /></div>`는 `margin-top:auto`로 부착돼 있으나:

1. `.rail`이 `display:flex; flex-direction:column; height:100vh`이지만 step 항목이 viewport 높이를 초과하면 `.rail-bottom`이 화면 밖으로 밀리거나 last step과 겹침
2. `<select>` 기본 chevron이 OS native라 카드/버튼 톤과 어긋남 (chevron 부재, 폰트 weight 불일치)

### 조치 (`app/globals.css`)

`.rail`: `display:flex; flex-direction:column` 명시 보강.

`.steps`: `flex: 1 1 auto; min-height: 0; overflow-y: auto` — overflow 안전.

`.rail-bottom`: `flex-shrink: 0; padding: 14px 14px 16px; border-top: 1px solid var(--hairline-strong); background: var(--paper)` — 시각 분리 강조.

`.rail-model-picker-label`: `font-mono; 10px; letter-spacing: 0.14em; uppercase; color: var(--ink-4)`.

`.rail-model-picker-select`: `appearance: none` + 인라인 SVG chevron + `padding: 8px 28px 8px 10px; border: 1px solid var(--hairline-strong); border-radius: 8px; font-size: 12.5px; font-weight: 450; color: var(--ink-2)` — 카드/버튼 톤 일치.

ModelPicker를 커스텀 dropdown 컴포넌트로 교체하지는 않음 — 재고가 적당함, 시각 정리만.

---

## 6. Narrative arc 프롬프트 (이슈 #3 final-polish)

### 증상

생성된 이미지가 모두 캐릭터 얼굴 클로즈업 + 단어 하나 → 정보량 부족, 광고로서 임팩트 약함. 의도는 4컷이 기-승-전-결 서사 아크로 작품 세계관·캐릭터·임팩트 장면을 모두 보여주는 것.

### 원인

`lib/ai/prompts.ts`의 composition 필드가 모든 컷에 강제: `extreme close-up`, `face/upper body AT LEAST 60% of frame`, `dynamic angle`. 추가로 `NEVER wide empty environment with small character`로 환경 묘사 차단. `buildGenerateAdsUserMessage`도 `캐릭터 클로즈업 + 강렬한 표정 + 짧은 한국어 한 마디가 핵심`이라고 재강조.

→ 결과적으로 **매 컷이 초상화 + 1단어**로 수렴. 4-cut 광고도 narrative 아크 없이 4개의 다른 표정 close-up 반복.

### 조치 (`lib/ai/prompts.ts`)

AdProposalSchema 필드를 추가하지 않고 **프롬프트 엔지니어링만으로 처리**.

beat 분배 (cut 개수별):
- 4 cuts → setup / rising / climax / cliffhanger
- 3 cuts → setup / climax / cliffhanger
- 2 cuts → setup / climax
- 1 cut  → climax only

beat 의미를 시스템 프롬프트에 명시:
- `setup`: 세계관·시간대·일상. wide / medium shot, 환경 단서 강조
- `rising`: 갈등 시그널. medium two-shot 또는 over-the-shoulder
- `climax`: 결정적 행동·감정 폭발. dramatic close-up 또는 action shot
- `cliffhanger`: 미해결 여운. silhouette·뒷모습·ambiguous framing. 결말 비공개

composition 규칙:
- beat에 맞는 framing 선택 (**모든 컷을 close-up으로 만들지 말 것**)
- 반드시 환경 단서 1개 이상 + 구체 동작 포함
- `panel` / `comic page` / `manga panel` 단어 금지 (페이지 레이아웃 오인 방지)

prompt 규칙:
- 첫 줄: `"Korean webtoon-style ad key visual"` 또는 `"Korean comic-style promotional banner illustration"`
- flat 2D, clean line art, screen tone shading, bold ink linework, vivid poster palette + 강한 accent 1개
- **NEVER photorealistic. NEVER 3D render. NEVER comic page layout/panel grid**
- 환경·소품·서브 캐릭터 디테일을 적극 포함하되 시각 초점은 1~2개

`buildGenerateAdsUserMessage`도 다음으로 변경: "광고 한 묶음의 컷들은 기-승-전-결 narrative arc를 형성하여 세계관·캐릭터·갈등·여운을 차례로 보여줍니다 (cut 개수에 따라 비례 축소). 정보 밀도를 위해 환경·소품·서브 캐릭터를 적극 포함하되 시각 초점은 컷마다 1~2개로 명료하게 유지합니다."

결과: 4-cut 광고는 cut 1=세계관·세팅, cut 2=긴장, cut 3=임팩트 장면, cut 4=여운. 1/2/3-cut도 비례 축소. 유저가 "다음 화가 궁금해서" 클릭하게 만드는 장면 밀도 확보.

---

## 7. 보안 / 운영 메모

- Google AI Studio 키는 `.env.local`(gitignored) 또는 Vercel Dashboard Environment Variables에만 등록. 채팅·이슈·PR 본문 평문 노출 시 즉시 revoke + 재발급
- 익명 사용자가 무한 호출 가능한 구조이므로 production 배포 1주 내 IP/쿠키 기반 rate limit 필수 (`@upstash/ratelimit` + Vercel KV)
- Edge Function region: `auto` (한국 사용자 대응 시 `icn1` Seoul 명시 검토)
- 24h orphan blob cleanup cron(`/api/cron/cleanup-blobs`)은 `CRON_SECRET` 환경변수로 인증 보호

---

## 8. 검증 시나리오 (적용 후)

| 시나리오 | 기대 |
| --- | --- |
| Landing → 회귀 본문 → 분석 시작 | 5–12s 내 분석 카드, 장르에 "회귀" 키워드 |
| 스토리라인 2개 → 타겟 디폴트 → format 디폴트 → 생성 | 10–25s 내 4개 변종, 모든 headline ≤ 40자 |
| Confirm '생성' 클릭 → result 도달 | 단일 끊김 없는 로딩, 중간 깜빡임 0건 |
| Result 컷 클릭 | 줌 모달 open, ←/→ 키보드 이동, Esc 닫기 |
| Result 슬라이드 자동 재생 | 컷당 3.0s + 0.45s cross-fade, 호버 일시정지 |
| Result `같은 전략 재생성` | 5–15s 내 1개 변종 새 카피로 갱신 |
| Result 새로고침 | sessionStorage 복원, 같은 step + 이미지 즉시 표시 |
| `?step=result` 직접 진입 (빈 store) | StepGuard가 `?step=input`로 redirect |
| `GOOGLE_GENERATIVE_AI_API_KEY` 누락 | 503 + toast: "LLM provider not configured" |
| Analysis 도중 새로고침 | Strict Mode 가드 정상, 페이지 깨지지 않고 재발사 |
| ModelPicker 모델 전환 | 즉시 다음 cut-image 호출부터 새 모델 적용 |
| 한국어 말풍선 렌더링 | bubbleText overlay 합성, burn-in 안정 |
