# HookCut — 디자인 프로토타입 아카이브

`contents-to-ad-proposal.md` 기획서를 기반으로 **Claude Design** (claude.ai/design) 에서 작성한 서비스 디자인 초안을 보존한 디렉터리.
추후 개발 플랜과 결합하여 실제 구현 시 **시각적 레퍼런스 / 인터랙션 사양 / 카피·데이터 톤**의 출처로 사용한다.

---

## 1. 출처 / 성격

- 생성 도구: Claude Design (handoff bundle)
- Export 일시: 2026-04-28
- 기반 문서: 레포 루트의 `contents-to-ad-proposal.md`
- 매체: HTML + React(UMD) + Babel standalone, vanilla CSS — **프로덕션 코드가 아닌 프로토타입**.

> 실제 구현 시에는 결과물의 **픽셀/인터랙션을 재현**하되, 내부 구조(UMD React + babel-standalone, 단일 styles.css)를 그대로 옮길 필요는 없다. 타깃 스택(Next.js / Vite + React / 등)에 맞게 재구성한다.

## 2. 디렉터리 구조

```
design/hookcut/
├── README.md              ← (이 파일) 구현 시 참고할 핵심 요약 + 인덱스
├── HANDOFF_README.md      ← Claude Design 원본 handoff 안내
├── chat-transcript.md     ← 디자인 대화 전문 (의도/결정 근거)
└── prototype/
    ├── HookCut.html       ← 엔트리. 모든 파일을 로드.
    ├── styles.css         ← 디자인 토큰(컬러/타입/스페이싱) + 컴포넌트 스타일
    ├── data.js            ← 데모 콘텐츠(회귀 판타지 / 로판) + 더미 광고안 데이터
    ├── app.jsx            ← 라우팅, ctx state, Tweaks 패널 통합
    ├── part1.jsx          ← Step 1~3 (Landing / Input / Analysis)
    ├── part2.jsx          ← Step 4~6 (Storyline / Targeting / Format)
    ├── part3.jsx          ← Step 7~8 (Confirm / Result)
    └── tweaks-panel.jsx   ← 디자인 토글 패널 (hue / dark / step rail / step jump)
```

## 3. 로컬 미리보기

브라우저에서 직접 `prototype/HookCut.html` 을 여는 것도 가능하지만, `<script type="text/babel">` 때문에 file:// 에서 CORS 이슈가 있을 수 있다. 권장:

```bash
cd design/hookcut/prototype
python3 -m http.server 5173
# → http://localhost:5173/HookCut.html
```

> `HANDOFF_README.md` 에는 "스크린샷 찍지 말고 소스를 직접 읽어라" 라고 명시되어 있다 — 모든 치수·색상·레이아웃 규칙은 `styles.css` 와 `*.jsx` 에 텍스트로 박혀있다.

## 4. 디자인 시스템 핵심 (chat-transcript.md 발췌)

| 항목 | 결정 |
| --- | --- |
| 포지셔닝 | 웹소설/IP 창작자용 광고 워크플로우 도구. 에디토리얼 진중함 + SaaS 명료함 |
| 베이스 컬러 | 페이퍼톤 `oklch(0.985 0.005 80)` |
| 텍스트 | 잉크 블랙 |
| 액센트 | vermillion `oklch(0.62 0.18 35)` (단일 강조색, hue 슬라이더로 조정 가능) |
| UI 타입 | Pretendard Variable |
| 헤드라인/카피 | Newsreader (세리프) |
| 메타/라벨 | JetBrains Mono |
| 레이아웃 | 좌측 고정 step rail + 중앙 작업 영역 |
| 카드 | hairline border, 그림자 거의 없음, 번호·라벨로 리듬 |
| 광고 결과 표현 | 사선 stripe SVG placeholder + "AD MOCKUP" 칩 + 모노 캡션 |

토큰 정의 위치: `prototype/styles.css` 상단 `:root` 변수.

## 5. 8단계 워크플로우 (구현 시 페이지/스텝 매핑)

| # | 스텝 | 파일 | 핵심 인터랙션 |
| - | --- | --- | --- |
| 1 | Landing | part1.jsx | 가치 제안 + 샘플 결과 미리보기 |
| 2 | Input | part1.jsx | 본문 / URL / 파일 탭, 데모 콘텐츠 토글(회귀 판타지 ↔ 로판) |
| 3 | Analysis | part1.jsx | 2초 스켈레톤 → 장르·갈등·인물·후킹·스포일러 카드 |
| 4 | Storyline | part2.jsx | AI 후보 4개 카드, **다중 선택** (제품 차별점이 가장 잘 드러나는 화면) |
| 5 | Targeting | part2.jsx | 6개 질문(연령/독자/유입/목적/톤/피하기), 단일·복수 혼합 |
| 6 | Format | part2.jsx | 6개 형식 + 비율 + 생성 전략(안정/실험 믹스) |
| 7 | Confirm | part3.jsx | 전략 요약 + 진행률 바 + 단계별 체크 |
| 8 | Result | part3.jsx | 메인 광고안 상세(2컷 placeholder + 카피·CTA) + 변종 갤러리, 카피 복사/다운로드/재생성 |

## 6. 알려진 제약 / 구현 시 주의

- 프로토타입의 React state(`ctx`)는 단일 컴포넌트 트리에서만 유지된다. 실제 제품에서는 라우터 + 서버 상태(분석 결과, 광고안)로 분리 필요.
- Step 7 직접 점프 시 `ctx.storylines` 빈 상태 가드가 들어가 있음 (chat 마지막 fix 참조) — 실제 구현에서도 **각 단계는 직전 단계 결과 없이 진입 시 fallback 또는 redirect** 처리 필요.
- 광고 placeholder (사선 stripe SVG) 는 실제 이미지 생성 결과로 대체될 자리. **AD MOCKUP 칩 / 모노 캡션 / 카피·CTA 위치**는 보존.
- 데모 데이터 2개(회귀 판타지 / 로판)는 `data.js` 에 인라인. 실제로는 사용자 입력 + AI 분석 결과 스키마로 대체.

## 7. 참고 순서 (개발 착수 시)

1. `contents-to-ad-proposal.md` (레포 루트) — 제품 정의 / Why
2. `design/hookcut/chat-transcript.md` — 디자인 의사결정 맥락
3. `design/hookcut/prototype/HookCut.html` → 로드 순서대로 `data.js` → `tweaks-panel.jsx` → `part1~3.jsx` → `app.jsx`
4. `prototype/styles.css` — 디자인 토큰 추출 (실제 스택의 토큰/테마로 이식)
