"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useWizardStore } from "@/stores/wizard-store";
import { presets, type PresetId } from "@/data/presets";
import { FootNav } from "@/components/wizard/FootNav";
import { classNames } from "@/lib/utils";

export function InputStep({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  const { excerpt, wikiUrl, memo, presetId, contentMedium, setInput } =
    useWizardStore();

  // Auto-fill demo content on first mount only when empty
  useEffect(() => {
    if (!excerpt && !presetId) {
      const p = presets.revenge;
      setInput({
        presetId: "revenge",
        excerpt: p.excerpt,
        wikiUrl: p.wikiUrl,
        memo: p.memo,
        title: p.title,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPreset = (id: PresetId) => {
    const p = presets[id];
    setInput({
      presetId: id,
      excerpt: p.excerpt,
      wikiUrl: p.wikiUrl,
      memo: p.memo,
      title: p.title,
    });
  };

  const charCount = excerpt.length;
  const canNext = charCount >= 50;

  return (
    <div className="stage page-enter">
      <div className="eyebrow">Step 01 · Source</div>
      <h1 className="page-title">
        콘텐츠를 <em>넣어주세요</em>.
      </h1>
      <p className="lede">
        캐릭터와의 대화, 컨텐츠 본문, 참고 URL, 관련 텍스트 문서 — 어떤 형태든 좋습니다. 여러 자료를 함께
        넣을수록 분석이 정확해집니다. 미리 준비된 두 작품 중
        하나로 테스트 해보세요.
      </p>

      {/* Preset switch */}
      <div className="mb-24">
        <span className="field-label">데모 콘텐츠</span>
        <div style={{ display: "flex", gap: 8 }}>
          {Object.values(presets).map((p) => (
            <button
              key={p.id}
              type="button"
              className={classNames("tag", presetId === p.id && "is-on")}
              onClick={() => setPreset(p.id)}
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              {p.title} ·{" "}
              <span style={{ opacity: 0.7, marginLeft: 4 }}>{p.genre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content medium toggle */}
      <div className="mb-24">
        <span className="field-label">콘텐츠 매체</span>
        <div style={{ display: "flex", gap: 8 }}>
          {(
            [
              { id: "novel", label: "소설" },
              { id: "webtoon", label: "웹툰" },
              { id: "manga", label: "만화" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              className={classNames("tag", contentMedium === m.id && "is-on")}
              onClick={() => setInput({ contentMedium: m.id })}
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              {m.label}
            </button>
          ))}
        </div>
        {contentMedium !== "novel" && (
          <div
            className="mono"
            style={{
              marginTop: 8,
              fontSize: 11,
              color: "var(--ink-3)",
              letterSpacing: "0.06em",
            }}
          >
            웹툰·만화는 v1.1에서 그림체 reference 업로드를 지원할 예정입니다.
            지금은 본문 텍스트만 분석합니다.
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 22 }}>
        {/* Body textarea */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span className="field-label" style={{ marginBottom: 0 }}>
            메인 텍스트  
          </span>
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: canNext ? "var(--ink-3)" : "var(--warn)",
            }}
          >
            {charCount.toLocaleString()} / 50자
          </span>
        </div>
        <textarea
          className="textarea"
          value={excerpt}
          onChange={(e) => setInput({ excerpt: e.target.value })}
          placeholder="광고화하고 싶은 본문을 50자 이상 붙여 넣으세요."
          style={{
            minHeight: 220,
            fontFamily: "var(--font-serif)",
            fontSize: 15,
            lineHeight: 1.7,
          }}
        />

        {/* URL input (optional) */}
        <div
          style={{
            borderTop: "1px solid var(--hairline)",
            paddingTop: 18,
            marginTop: 22,
          }}
        >
          <span className="field-label">참고 URL · 선택</span>
          <input
            className="input"
            value={wikiUrl}
            onChange={(e) => setInput({ wikiUrl: e.target.value })}
            placeholder="https://wiki.example.com/..."
          />
          <div
            className="mono"
            style={{
              fontSize: 10.5,
              color: "var(--ink-4)",
              letterSpacing: "0.08em",
              marginTop: 6,
              textTransform: "uppercase",
            }}
          >
            메타데이터로만 사용됩니다 (페치 안 함)
          </div>
        </div>

        {/* File upload placeholder */}
        <div style={{ marginTop: 18 }}>
          <FileUploadDisabled />
        </div>

        {/* Memo */}
        <div
          style={{
            borderTop: "1px solid var(--hairline)",
            paddingTop: 18,
            marginTop: 22,
          }}
        >
          <span className="field-label">추가 요청 · 선택</span>
          <input
            className="input"
            value={memo}
            onChange={(e) => setInput({ memo: e.target.value })}
            placeholder="예: 강한 후킹형으로 만들고 싶다 / 여성향 로맨스 독자에게 맞추고 싶다"
          />
        </div>
      </div>

      <FootNav
        onPrev={onPrev}
        onNext={onNext}
        nextLabel="분석 시작"
        canNext={canNext}
      />
    </div>
  );
}

function FileUploadDisabled() {
  const handler = () =>
    toast(
      "PDF/DOCX 파싱은 v1.1에서 제공됩니다. 본문은 텍스트로 붙여넣어 주세요.",
    );
  return (
    <button
      type="button"
      onClick={handler}
      style={{
        display: "block",
        width: "100%",
        border: "1.5px dashed var(--hairline-strong)",
        borderRadius: "var(--radius)",
        padding: "32px 24px",
        textAlign: "center",
        color: "var(--ink-3)",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 8,
          color: "var(--ink-3)",
        }}
      >
        파일 업로드 · v1.1
      </div>
      <div style={{ fontSize: 13.5 }}>.txt · .docx · .pdf — v1.1 제공 예정</div>
    </button>
  );
}
