# HookCut — 통합 계획서 (Plan)

> 단일 계획서. MVP 골격 + 이미지 생성 + 결과 UX + 이미지 모델 셀렉터까지 본 문서로 설계되어 구현되었다.
> 기획 출처: `contents-to-ad-proposal.md` (요구·플로우)

---

## 0. 제품 정의

**HookCut**은 한국 웹소설/IP 본문(또는 위키 URL·메모)을 입력하면 AI가 광고 포인트를 분석하고, 선택형 워크플로우(스토리라인·타겟·형식)를 거쳐 광고 카피·CTA·컷 이미지를 묶은 광고안 N개를 생성하는 **Contents-to-Ads 워크플로우 SaaS**다.

차별점은 "이미지 생성기"가 아니라 "콘텐츠 분석 → 광고 기획 질문 → 스토리라인 선택 → 형식 결정 → 다중 광고안 생성"이라는 **워크플로우 레이어**이다. 결과물은 카피·말풍선·컷 이미지 + 의도 설명을 포함한 광고 기획안 형태.

### MVP 범위

- 8단계 워크플로우 풀 작동 (Landing → Result)
- LLM 호출 2지점 실연결: 콘텐츠 분석 + 광고안 생성 (스토리라인 후보는 분석에 동봉)
- 콘텐츠 매체 토글 (소설/웹툰/만화) — 분석/광고 prompt에 반영
- 광고 컷 실 이미지 생성 (Gemini-native 이미지 모델, lazy on-demand per cut, Vercel Blob 영구 저장)
- 카피/JSON 다운로드 + 단일 광고안 재생성
- 세션 sessionStorage 영속화 + 24h orphan blob cleanup cron

### Non-Goal (v1.x 이후)

- 모바일/터치 (`min-width: 1024px` 데스크톱 only)
- 외부 URL reference / 파일 업로드(.pdf/.docx) — UI placeholder만
- 동적 질문 생성 (정적 6질문)
- 인증·결제 — 익명 세션
- 그림체 reference 업로드 / 앵커 이미지 일관성 — 별도 사이클

---

## 1. 아키텍처

### 1-1. 시스템 다이어그램

```
┌───────────────────────────────────────────────────────────────────┐
│                        Browser (Next.js 16)                        │
│                                                                    │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐  │
│  │  RSC pages   │   │  Client wizard    │   │  Zustand store   │  │
│  │  (/, layout) │   │  ('/wizard')      │◄──┤  + sessionStore  │  │
│  └──────────────┘   └──────┬───────────┘   └──────────────────┘  │
│                            │                                       │
│                            ▼                                       │
│                    ┌──────────────────────────┐                   │
│                    │  hooks/use-* (단일 인터)  │                   │
│                    │  ├ useObject (stream)    │                   │
│                    │  └ useMutation (TanStack)│                   │
│                    └──────┬───────────────────┘                   │
└───────────────────────────┼───────────────────────────────────────┘
                            │ fetch
                            ▼
        ┌────────────────────────────────────────────────────────┐
        │           Next.js Route Handlers (Edge runtime)         │
        │                                                          │
        │  POST /api/analyze        POST /api/generate-ads        │
        │  POST /api/regenerate-ad  POST /api/cut-image           │
        │  GET  /api/cron/cleanup-blobs  POST /api/session/[id]   │
        │                                                          │
        │  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
        │  │ AI SDK v6│ │  Zod 4   │ │Vercel Blob│                │
        │  │ stream   │ │structured│ │  + cron   │                │
        │  └────┬─────┘ └──────────┘ └──────────┘                │
        └───────┼────────────────────────────────────────────────┘
                │
                ▼
        ┌──────────────────────────────────────┐
        │  Google Gemini (@ai-sdk/google)       │
        │  ├ gemini-2.5-flash       (text)      │
        │  └ gemini-3.1-flash-image-preview     │
        │     (+ pro / 2.5-flash-image 선택지)  │
        └──────────────────────────────────────┘
```

**런타임 결정:**
- Route Handlers는 Edge runtime — 스트리밍 첫 토큰 지연 최소화
- `/wizard`는 client component — 8단계 상호작용 + Zustand
- `/` (Landing)은 RSC — SEO + 정적 캐싱
- `/api/cron/cleanup-blobs`는 Vercel Cron 일 1회

### 1-2. 폴더 구조

```
hookcut/
├── app/
│   ├── layout.tsx              # 폰트, Analytics, Sonner, 모바일 gate
│   ├── globals.css             # 디자인 토큰 (oklch) + 컴포넌트 클래스
│   ├── page.tsx                # Landing (RSC)
│   ├── wizard/
│   │   ├── layout.tsx          # QueryProvider + hydrate
│   │   └── page.tsx            # ?step= router
│   └── api/
│       ├── analyze/route.ts            # streamObject
│       ├── generate-ads/route.ts       # streamObject
│       ├── regenerate-ad/route.ts      # generateObject
│       ├── cut-image/route.ts          # generateText + IMAGE modality + Blob put
│       ├── cron/cleanup-blobs/route.ts # 24h orphan TTL
│       └── session/[id]/route.ts       # KV stub (v1.2)
├── components/
│   ├── query/provider.tsx
│   ├── ads/                    # SampleAd, AdPlate, AdSlideshow, CutZoomModal
│   ├── wizard/                 # StepRail, StepGuard, FootNav, ModelPicker, steps/
│   └── primitives/
├── hooks/
│   ├── use-analyze-stream.ts       # /api/analyze useObject wrap
│   ├── use-generate-ads-stream.ts
│   ├── use-regenerate-ad.ts        # useMutation
│   └── use-cut-image.ts            # useMutation + 캐시 키
├── lib/
│   ├── ai/                     # client(model factories), prompts, image-utils
│   ├── api/                    # errors, client(fetchJson), cut-image, regenerate-ad
│   ├── query/                  # client, keys
│   └── ads/mock-builder.ts     # 데모/CI용 (route 미사용)
├── schemas/                    # zod (analysis, targeting, format, ad-proposal, cut-image, wizard, regenerate)
├── stores/wizard-store.ts      # Zustand 8단계 + setAdCutImageUrl
├── data/presets.ts             # 회귀 판타지 / 로판 데모 콘텐츠
└── vercel.json                 # cron schedule
```

### 1-3. 디자인 시스템

- Tailwind CSS v4 + oklch 디자인 토큰 (`paper`, `ink`, `accent`, `hairline` 등) `app/globals.css`에 직접 정의
- shadcn 미사용 (의존성 0). 모든 wrapper는 자체 컴포넌트
- 폰트: Pretendard (local), Newsreader, JetBrains Mono
- 사선 stripe SVG `.ad-image` placeholder가 Landing 미리보기·이미지 로딩 plate에 일관 사용됨
- 디자인 디테일은 hairline 보더 + 그림자 거의 없음 + (번호 + serif title + mono label) 3-단 리듬

---

## 2. 8단계 플로우

| Step | 경로 | 입력 | 사용자 액션 | 출력 (store) | 외부 호출 |
| --- | --- | --- | --- | --- | --- |
| Landing | `/` | — | `시작` | — | — |
| Input | `?step=input` | — | 본문/URL/메모/매체 토글 | `excerpt`, `wikiUrl`, `memo`, `contentMedium` | — |
| Analysis | `?step=analysis` | excerpt | (자동) | `analysis: Analysis` (장르·인물·후킹·후보 3~5) | POST /api/analyze (stream) |
| Storyline | `?step=storyline` | candidates | 카드 다중 선택 | `storylines: string[]` | — |
| Targeting | `?step=targeting` | — | 6질문 답변 | `targeting: Targeting` | — |
| Format | `?step=format` | — | 형식·비율·전략 | `format`, `ratio`, `variantMix` | — |
| Confirm | `?step=confirm` | 모든 store | `생성` 클릭 | `ads: AdProposal[]` | POST /api/generate-ads (stream) |
| Result | `?step=result` | ads | 변종 탭 / 재생성 / 다운로드 / 컷 줌 | `ads[i]` 갱신, cut imageUrl 채움 | POST /api/regenerate-ad, POST /api/cut-image |

**Step Jump Guard**: `?step=X` 직접 진입 시 누락 선행 데이터가 있으면 가까운 step으로 redirect. 가드 정의는 `components/wizard/StepGuard.tsx`.

**Confirm 완료 시점**: LLM 스트림 종료 + 모든 컷 이미지 생성 완료 → 자동 `?step=result` (중간 깜빡임 없는 단일 로딩 화면). race 회피 가드는 fix 문서 §2 참조.

---

## 3. 상태 / 데이터 페칭 레이어

### 3-1. Zustand 스토어 + sessionStorage

- 키: `hookcut:wizard:v2`
- 저장 항목: 8단계 입력/결과 + 광고 컷 imageUrl. 새로고침/뒤로가기 시 그대로 복원 (이미지 재호출 없음)
- 다중 디바이스 / 공유 URL: KV 통합 (v1.2 예정 — 현재 stub)

### 3-2. 레이어드 페칭 (시니어 검토 통과)

```
components/  → hooks/use-*  → lib/api/*       → fetch
                          └→ lib/query/*       (TanStack Query / queryKey)
```

원칙:
- `components/**/*.tsx` 는 `fetch` / `useObject` / `useMutation` / `useQuery` 직접 import 금지
- `hooks/use-*` 만 비즈니스 로직(캐시 키, retry, store sync)을 가짐
- `lib/api/*` 는 stateless. React import 0건
- 에러는 `HookCutApiError` 단일 형태로 정규화 → `code` + `userMessage`(한국어) + `debugMessage`(영문) + `retryable`

### 3-3. 두 패러다임 분리

| 패러다임 | 도구 | 적용 |
| --- | --- | --- |
| Streaming structured object | `experimental_useObject` (AI SDK) | analyze, generate-ads — partial JSON chunk 실시간 수신 |
| Imperative mutation | `useMutation` (TanStack) | regenerate-ad, cut-image — 1회성 POST + retry/cancel/cache |

두 layer를 강제 통합하지 않는다. 각 도구를 본연의 영역에서 쓰되 컴포넌트는 둘 다 직접 호출하지 않고 hooks/use-*를 통해서만 접근.

### 3-4. QueryClient 기본값

- `staleTime: 60s`, `gcTime: 5m`, query `retry: false`
- mutation `retry`: `error.retryable && failureCount < 2`, exponential backoff
- `<QueryProvider>`는 `app/wizard/layout.tsx`에 마운트 (Landing은 데이터 페칭 없음)

---

## 4. AI 파이프라인

### 4-1. 텍스트 (분석 / 광고 생성)

- Provider: `@ai-sdk/google` (Google AI Studio direct, **not** Vertex AI — 키 한 줄 인증)
- 모델: `gemini-2.5-flash` (분석/생성 동일). 환경변수로 분리하여 필요시 `gemini-2.5-pro`로 승격 가능
  - `GOOGLE_ANALYSIS_MODEL`, `GOOGLE_GENERATE_MODEL`
- 비용: 세션당 ≈ $0.013 (Anthropic Sonnet 대비 약 10배 저렴)

### 4-2. 이미지 (컷)

- Provider: Gemini-native image preview 모델 — `generateText` + `responseModalities: ["IMAGE"]` 경로
- 기본 모델: `gemini-3.1-flash-image-preview` (Nano Banana 2). 한국어 글리프 자체를 못 그리는 Imagen 4 한계를 모델 차원에서 해결
- 좌측 하단 **ModelPicker**로 사용자가 즉시 전환 가능:
  - `gemini-3.1-flash-image-preview` — Nano Banana 2 (기본)
  - `gemini-3-pro-image-preview` — Nano Banana Pro (고품질)
  - `gemini-2.5-flash-image` — 원조 Nano Banana (레거시·비교용)
- 비율 매핑: `lib/ai/image-utils.ts` `mapRatio()` — Gemini 이미지 모델은 자유 비율, 4:5 그대로 유지
- 저장: `@vercel/blob` `put()` 즉시 public URL → store에 `imageUrl` 캐시 → sessionStorage 영속화
- Cleanup: Vercel Cron 일 1회 (`/api/cron/cleanup-blobs`)
- 흐름: **Lazy on-demand per cut** — Edge 25s 첫 응답 한도 회피 + 카피 즉시 표시 + 실패 격리

### 4-3. Zod 스키마와 Gemini structured output 제약

Gemini 강제 키워드: `type`, `enum`, `properties`, `required`, `items`, `prefixItems`, `minItems`, `maxItems`, `minimum`, `maximum`, `format(date/date-time/time/duration/uuid)`, `description`, `nullable`.

미강제 (silently ignored): `minLength`, `maxLength`, `format(uri/email)`, `pattern`.

→ string 길이/URL 검증을 Gemini가 강제 못 하므로 Zod schema에 `min/max length`를 박으면 사후 reject 폭탄이 됨. UI display 길이 제약은 **클라이언트 측 transform truncate**로 수용성 있게 처리한다.

`schemas/ad-proposal.ts`의 `truncate(max)` 헬퍼:

```ts
const truncate = (max: number) =>
  z.string().transform((s) => (s.length > max ? s.slice(0, max) : s));
```

→ headline 40자, sub 80자, caption 40자, cta 20자, bubbleText 8자 등 모두 transform 처리.

---

## 5. 광고 카피·컷 시스템

### 5-1. AdProposal (광고안 1개)

```
shortName     # ≤40자, 변종 식별 라벨 (예: "복수 후킹 · 안정")
headline      # ≤40자, 헤드라인 카피
sub           # ≤80자, 보조 카피 (선택)
cta           # ≤20자, 행동 유도 (예: "첫 화 보기")
tone          # "dark" | "warm" | "neutral"
cuts[]        # 1~4개 컷, 형식에 따라 분배
intent        # 20~400자, 광고 기획자가 클라이언트에 보고하는 톤
type          # "stable" | "experimental"
storyId       # 선택된 candidate id ("A".."E")
```

### 5-2. AdCut (컷 7필드)

| 필드 | 형 | 비고 |
| --- | --- | --- |
| `caption` | 한국어 ≤40자 | 화면 밖 라벨 (이미지 위 미렌더) |
| `composition` | 영문 1~2문장 | framing·환경·인물·동작. UI 미노출, 이미지 prompt 합성용 |
| `bubbleKind` | `speech` / `narration` | — |
| `bubblePosition` | `top` / `bottom` / `left` / `right` | 시선·환경 디테일과 충돌 회피 |
| `bubbleText` | 한국어 2~8자 (4~6자 권장) | beat에 맞는 한 마디 |
| `prompt` | 영문 | 시각 스타일·분위기. 한국어 0건. 말풍선 텍스트 미포함 (서버 합성) |
| `imageUrl` | string? | 서버가 채움 (Blob URL) |

**왜 bubbleText를 prompt에서 분리하는가?** Gemini-native 이미지 모델도 짧은 한국어는 비교적 안정적이지만 prose 안의 따옴표 한국어 길이가 늘면 글리프 깨짐. → **bubbleText를 schema 분리** + **서버에서 overlay 합성**으로 burn-in 안정성 확보.

### 5-3. Narrative beat 분배 (4-cut 예시)

| cut 수 | beat 분배 |
| --- | --- |
| 4 | 기(setup) / 승(rising) / 전(climax) / 결(cliffhanger) |
| 3 | setup / climax / cliffhanger |
| 2 | setup / climax |
| 1 | climax only |

beat 의미:
- **setup**: 세계관·시간대·일상. wide / medium shot, 환경 단서 강조
- **rising**: 갈등 시그널. medium two-shot 또는 over-the-shoulder
- **climax**: 결정적 행동·감정 폭발. dramatic close-up 또는 action shot
- **cliffhanger**: 미해결 여운. silhouette·뒷모습·ambiguous framing. 결말 비공개

bubbleText 예: setup="그날 밤"/"황녀", rising="보였다"/"왔다", climax="복수다"/"끝이다", cliffhanger="그러나…"/"다음 날".

### 5-4. 시각 스타일 — 만화 톤 강제

LLM이 출력하는 컷 `prompt`는 다음 시각 조건을 항상 따른다 (시스템 프롬프트로 강제):

1. 첫 줄: `"Korean webtoon-style ad key visual"` 또는 `"Korean comic-style promotional banner illustration"`. `manga panel`/`comic panel` 단어 금지 (페이지 레이아웃 오인 방지)
2. flat 2D, clean line art, screen tone shading, bold ink linework, vivid poster palette + 강한 accent 1개. **NEVER photorealistic. NEVER 3D render. NEVER comic page layout/panel grid**
3. 톤 한 줄: `dark` → "dark moody palette, deep blacks, single red ink accent." / `warm` → "warm sunset palette, soft golden hatching, one orange accent." / `neutral` → "balanced grayscale poster, one bold accent ink color."
4. 같은 광고안의 다른 cut과 외형 디스크립터 2~3개 반복 (캐릭터 일관성)
5. 시간대·세계관 단서 일관 유지
6. 스포일러 금지

**광고 한 묶음의 컷들은 narrative arc**를 형성한다 (cut 개수에 따라 비례 축소). 정보 밀도를 위해 환경·소품·서브 캐릭터를 적극 포함하되 시각 초점은 컷마다 1~2개로 명료하게.

### 5-5. variantMix (생성 전략)

- `stable`: 모두 type="stable" — 장르 독자에게 익숙한 톤
- `stable+experimental`: 스토리라인당 stable 1 + experimental 1 (기본값)
- `experimental+`: 스토리라인당 experimental 2개 (서로 다른 각도)

### 5-6. 형식과 광고안 개수 매핑

- `2-2`: stories당 2 cuts. 광고안 개수 = stories.length × variantsPerStory (기본 형식)
- `1-1`: 1 cut, 광고안 1개
- `1-3`: 1 cut, 광고안 3개
- `2-1`: 2 cuts, 광고안 1개
- `4-1`: 4 cuts, 광고안 1개
- `card-3`: 1 cut, 광고안 3개

---

## 6. Result UX

### 6-1. 정보 위계: 슬라이드 vs 그리드

- **기본 = 슬라이드**. Result 진입 시 첫 화면은 항상 슬라이드 (광고는 시간 매체)
- **그리드 토글**: 슬라이드 우상단 작은 두 토글 (`PLAY` / `GRID`). 그리드는 디테일 비교용
- **단일 컷 광고**: 토글 자체를 숨김
- **컴팩트 갤러리**(다른 광고안)는 슬라이드 미적용 — 시각 소음 방지, 그리드만

### 6-2. 슬라이드 인터랙션 (`components/ads/AdSlideshow.tsx`)

- 자동 재생: 컷당 3.0초 노출 + 0.45초 cross-fade
- 호버 시 일시정지(데스크톱), 마우스 떨어지면 재개
- 슬라이드 하단 도트 인디케이터 — 클릭으로 점프
- `prefers-reduced-motion: reduce` → 자동 재생 OFF, 도트 수동만
- focus 광고안이 바뀌면 슬라이드로 리셋

### 6-3. 줌 모달 (`components/ads/CutZoomModal.tsx`)

- `createPortal` 기반 라이트박스 (Radix/Headless 미사용 — 의존성 0)
- 어두운 dim(검정 75%) + 중앙 카드: 큰 이미지 + 하단 컷 캡션(한국어 mono) + "1 / 2" 인디케이터
- 좌우 화살표 버튼: dim 영역 좌우 가장자리. 컷이 1개면 화살표 숨김
- 키보드: `←/→` 컷 이동, `Esc` 닫기. focus trap
- 닫기: 우상단 `X`, dim 클릭, `Esc`. `body { overflow: hidden }` 스크롤 잠금
- 내부에서 `AdPlate` 재사용 — imageUrl 로딩 상태 동일 표현

### 6-4. 재생성

- 기본 버튼: `같은 전략 재생성` — cut prompt 동일, 시각만 새 seed
- "다른 전략으로" → format 변경 후 재생성
- LLM 호출은 단일 광고안만 재생성 (다른 변종 보존)

---

## 7. 환경 변수

| 변수 | 용도 | 필수 |
| --- | --- | --- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI Studio 키 (텍스트+이미지 공용) | 필수 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 토큰 | 필수 |
| `CRON_SECRET` | 24h orphan blob cleanup cron 인증용 32+자 | 프로덕션 필수 |
| `GOOGLE_ANALYSIS_MODEL` | 기본 `gemini-2.5-flash` | 선택 |
| `GOOGLE_GENERATE_MODEL` | 기본 `gemini-2.5-flash` | 선택 |
| `GOOGLE_IMAGE_MODEL` | 기본 `gemini-3.1-flash-image-preview` | 선택 |
| `NEXT_PUBLIC_APP_URL` | 메타데이터/OG | 권장 |

---

## 8. 산출물 매핑

| 산출 | 위치 |
| --- | --- |
| 디자인 토큰 (oklch) + 컴포넌트 클래스 | `app/globals.css` |
| 8단계 wizard | `components/wizard/steps/`, `app/wizard/page.tsx` |
| 광고 view (slideshow / zoom / plate) | `components/ads/` |
| AI client + prompts | `lib/ai/{client,prompts,image-utils}.ts` |
| API 레이어 + 에러 정규화 | `lib/api/{client,errors,*}.ts` |
| TanStack Query 설정 | `lib/query/{client,keys}.ts`, `components/query/provider.tsx` |
| Zod 스키마 (Gemini 제약 반영 truncate) | `schemas/*` |
| 상태/영속화 | `stores/wizard-store.ts` (key `hookcut:wizard:v2`) |
| API routes (Edge) | `app/api/{analyze,generate-ads,regenerate-ad,cut-image,cron/cleanup-blobs}/route.ts` |
| Cron schedule | `vercel.json` |
| 데모 콘텐츠 | `data/presets.ts` (회귀 판타지 / 로판) |
