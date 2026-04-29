# HookCut — Contents to Ads

콘텐츠를 넣으면, AI가 광고 소재로 바꿔주는 Contents-to-Ads 워크플로우 서비스입니다.
컨텐츠 본문을 분석해 스토리라인 후보·타겟·형식을 묻고, 카피·CTA·컷 이미지를 묶은 광고안 N개를 생성합니다.

기획서: [`docs/plans/contents-to-ad-proposal.md`](docs/plans/contents-to-ad-proposal.md)
제품 한 페이지: [`ONE_PAGER.md`](ONE_PAGER.md)

---

## 실행 방법

```bash
pnpm install
cp .env.local.example .env.local
# .env.local 에 키 입력 (아래 환경 변수 표 참고)
pnpm dev
```

브라우저: <http://localhost:3000>

빌드/검증:

```bash
pnpm build    # 프로덕션 빌드 (Turbopack)
pnpm lint     # ESLint
```

### 환경 변수

| 변수 | 용도 | 필수 |
| --- | --- | --- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI Studio 키 (텍스트 + 이미지 공용, [발급](https://aistudio.google.com/apikey)) | 필수 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 토큰 (광고 컷 이미지 저장) | 필수 |
| `CRON_SECRET` | 24h orphan blob cleanup cron 인증용 32+자 문자열 | 프로덕션 필수 |
| `GOOGLE_ANALYSIS_MODEL` | 분석 모델, 기본 `gemini-2.5-flash` | 선택 |
| `GOOGLE_GENERATE_MODEL` | 광고 생성 모델, 기본 `gemini-2.5-flash` | 선택 |
| `GOOGLE_IMAGE_MODEL` | 이미지 모델, 기본 `imagen-4.0-fast-generate-001` | 선택 |
| `NEXT_PUBLIC_APP_URL` | 앱 base URL (메타데이터/OG) | 권장 |

---

## 기술 스택

**프레임워크 / 언어**

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5
- Tailwind CSS v4 (oklch 토큰 직접 정의, shadcn 미사용)

**AI / 데이터**

- Vercel AI SDK v6 — `streamObject` + `experimental_useObject` (analyze, generate-ads), `generateObject` (regenerate-ad), `experimental_generateImage` (cut-image)
- Google Gemini (`@ai-sdk/google`) — 분석/카피 생성
- Imagen 4 fast — 컷 이미지 생성 (Vercel Blob 영구 저장 + 24h TTL cleanup)
- Zod 4 — 입력/출력 스키마 (Gemini structured output 제약 반영)

**상태 / 데이터 페칭**

- Zustand 5 + sessionStorage 영속화 (`hookcut:wizard:v2`)
- TanStack Query 5 — mutation/캐시 레이어
- 레이어 분리: `lib/api/*` (fetch wrapper) → `lib/query/*` (key) → `hooks/use-*` (UI 단일 인터페이스) → `components/**` (순수 view)

**런타임 / 인프라**

- Vercel Edge Runtime — `/api/analyze`, `/api/generate-ads`, `/api/regenerate-ad`, `/api/cut-image`
- Vercel Blob — 컷 이미지 저장
- Vercel Cron — 24h orphan blob cleanup
- Vercel Analytics + Speed Insights

---

## 8단계 플로우

| Step | 경로 | 입력 | 출력 |
| --- | --- | --- | --- |
| Landing | `/` | — | 시작 |
| Input | `/wizard?step=input` | 본문 발췌 / URL / 메모 / 매체 | excerpt |
| Analysis | `?step=analysis` | excerpt | 분석 (장르·인물·후킹·스토리라인 후보) |
| Storyline | `?step=storyline` | candidates | 선택된 ID 배열 |
| Targeting | `?step=targeting` | — | 6질문 답변 |
| Format | `?step=format` | — | 형식·비율·전략 |
| Confirm | `?step=confirm` | 모든 store | 광고안 (카피·CTA·컷 prompt) |
| Result | `?step=result` | ads | 컷별 이미지 lazy 생성 / 카피 / JSON 다운로드 / 재생성 |

---

## 사용한 AI 도구와 활용 방식

본 프로젝트는 다음 AI 도구들을 **specify → plan → implementation → refine** 단계로 활용해 진행했습니다.

| 도구 | 활용 단계 | 역할 |
| --- | --- | --- |
| **ChatGPT** | specify | 제품 정의·기획서 초안(`docs/plans/contents-to-ad-proposal.md`) 작성, 워크플로우/스토리라인 후보 구조 도출 |
| **Claude Design** | plan (디자인) | 랜딩·위저드 7개 페이지 프로토타입 디자인, 디자인 토큰(oklch) 1차 정의 |
| **Claude Code** | plan / implementation / refine | 구현 플랜 분해, Next.js 16 기반 코드 작성, 스키마·레이어 분리 리팩터, 카피·프롬프트 정합성 검증 |

각 단계의 산출물은 다음 위치에 보관되어 있습니다.

- specify: [`docs/plans/contents-to-ad-proposal.md`](docs/plans/contents-to-ad-proposal.md), [`ONE_PAGER.md`](ONE_PAGER.md)
- plan: `docs/plans/`
- implementation: `app/`, `components/`, `hooks/`, `lib/`, `schemas/`, `stores/`
- refine: 스키마 truncate 정책 (`schemas/ad-proposal.ts`), 시스템 프롬프트 컷 beat 분배 (`lib/ai/prompts.ts`)

---

## 폴더 구조

```
app/
  page.tsx                 # Landing (RSC)
  layout.tsx               # 폰트, Analytics, Sonner Toaster, 모바일 gate
  globals.css              # 디자인 토큰 + 컴포넌트 클래스 (oklch)
  wizard/
    layout.tsx             # QueryProvider + hydrate
    page.tsx               # ?step= router
  api/
    analyze/route.ts                # streamObject (Gemini)
    generate-ads/route.ts           # streamObject (Gemini)
    regenerate-ad/route.ts          # generateObject (Gemini)
    cut-image/route.ts              # experimental_generateImage + Blob put
    cron/cleanup-blobs/route.ts     # 24h orphan TTL
    session/[id]/route.ts           # KV (v1.2 예정)

components/
  query/provider.tsx       # QueryClientProvider + Devtools
  ads/                     # SampleAd, AdPlate (실 이미지 lazy)
  wizard/                  # StepRail, StepGuard, FootNav, HydrateClient, steps/
  primitives/              # ArrowRight, ArrowLeft, Check

hooks/
  use-analyze-stream.ts    # /api/analyze useObject wrap
  use-generate-ads-stream.ts
  use-regenerate-ad.ts     # useMutation
  use-cut-image.ts         # useMutation + 캐시 키

lib/
  ai/                      # client, prompts, image-utils (mapRatio)
  api/                     # errors, client (fetchJson), cut-image, regenerate-ad
  query/                   # client, keys
  ads/mock-builder.ts      # mock 광고 빌더 (개발용)
  kv.ts                    # KV stub (v1.2)
  utils.ts

schemas/                   # zod (analysis, targeting, format, ad-proposal, cut-image, wizard, regenerate)
stores/wizard-store.ts     # Zustand 8단계 state + setAdCutImageUrl
data/presets.ts            # 회귀 판타지 / 로판 데모 콘텐츠
types/index.ts
vercel.json                # cron schedule
```

---

## 상태 / 영속화

- **단일 디바이스**: `sessionStorage` (`hookcut:wizard:v2`) — 새로고침/뒤로가기 복원. 광고 컷 imageUrl 도 함께 저장되어 새로고침 시 재호출 없이 즉시 표시됩니다.
- **다중 디바이스 / 공유 URL**: KV 통합 (v1.2 예정).

## 알려진 제약

- 모바일 미지원 (1024px 미만은 안내 화면)
- 파일 업로드(.pdf/.docx) UI만 (disabled, v1.1 예정)
- 동적 질문 생성 미지원 (정적 6질문)
- 인증·결제 없음 (익명 세션)
- 그림체 reference 업로드 / 앵커 이미지 — v1.2 예정
