"use client";
import { useWizardStore } from "@/stores/wizard-store";
import { useRouter } from "next/navigation";

export function ResultExistsBanner() {
  const ads = useWizardStore((s) => s.ads);
  const imagesStatus = useWizardStore((s) => s.imagesStatus);
  const router = useRouter();
  if (ads.length === 0) return null;
  if (imagesStatus !== "done") return null;

  return (
    <div className="result-exists-banner" role="status">
      <div className="result-exists-banner-text">
        <b>이미 광고 결과가 만들어져 있습니다.</b>
        <span>설정을 바꾸고 다시 생성하면 기존 결과는 새 결과로 대체됩니다.</span>
      </div>
      <button
        type="button"
        className="btn"
        onClick={() => router.push("/wizard?step=result")}
      >
        결과로 돌아가기
      </button>
    </div>
  );
}
