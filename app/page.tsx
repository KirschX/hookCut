import Link from "next/link";
import { SampleAd } from "@/components/ads/SampleAd";

export default function Home() {
  return (
    <div className="stage page-enter">
      <div className="eyebrow">A Contents-to-Ads workflow</div>
      <h1 className="page-title">
        콘텐츠를 넣으면,
        <br />
        <em>광고 소재가</em> 바로 나옵니다.
      </h1>
      <p className="lede">
        컨텐츠 본문, 참고 URL, 관련 텍스트 문서를 넣으면 HookCut이 광고 포인트를 분석하고, 필요한 선택지만 골라
        묻고, 타겟에 맞는 광고 배너·컷 이미지를 생성합니다. 프롬프트를 직접 쓸 필요가 없습니다.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 56 }}>
        <Link href="/wizard?step=input" className="btn primary lg">
          광고 소재 만들기
          <ArrowRight />
        </Link>
        <Link href="#preview" className="btn lg" scroll>
          예시 결과 보기
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
          borderTop: "1px solid var(--hairline)",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        {[
          {
            num: "01",
            t: "콘텐츠를 이해합니다",
            d: "소설 본문·위키·설정 문서를 분석해 장르, 갈등, 후킹 포인트, 스포일러 위험을 추출합니다.",
          },
          {
            num: "02",
            t: "광고 방향을 함께 정합니다",
            d: "AI가 광고화 가능한 스토리라인 후보를 카드로 제안하고, 타겟·톤·목적을 선택형으로 묻습니다.",
          },
          {
            num: "03",
            t: "여러 광고안을 만듭니다",
            d: "안정적 버전과 실험적 버전을 함께 생성합니다. 광고는 정답 하나가 아니니까요.",
          },
        ].map((x, i) => (
          <div
            key={x.num}
            style={{
              padding: "32px 28px 32px 0",
              paddingLeft: i === 0 ? 0 : 28,
              borderRight: i < 2 ? "1px solid var(--hairline)" : "none",
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 11,
                color: "var(--accent)",
                letterSpacing: "0.16em",
                marginBottom: 14,
              }}
            >
              {x.num}
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 22,
                lineHeight: 1.25,
                marginBottom: 10,
                letterSpacing: "-0.01em",
              }}
            >
              {x.t}
            </div>
            <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.6 }}>{x.d}</div>
          </div>
        ))}
      </div>

      <h2 id="preview" className="section-title mt-32">
        미리보기 <span className="count">SAMPLE OUTPUT</span>
      </h2>
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

      <div
        className="mt-32"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 24,
          borderTop: "1px solid var(--hairline)",
        }}
      >
        <div
          className="mono subtle"
          style={{
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          For 웹소설 · 캐릭터 IP · 스토리 콘텐츠 · SNS 운영자
        </div>
        <Link href="/wizard?step=input" className="btn primary">
          시작하기 <ArrowRight />
        </Link>
      </div>
    </div>
  );
}

function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg className="arrow" width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path
        d="M2 7h10M8 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
