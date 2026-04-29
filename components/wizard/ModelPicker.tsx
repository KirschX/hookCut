"use client";
import { useWizardStore } from "@/stores/wizard-store";
import {
  SUPPORTED_IMAGE_MODELS,
  type ImageModelId,
} from "@/lib/ai/client";

const LABELS: Record<ImageModelId, string> = {
  "gemini-3.1-flash-image-preview": "Flash 3.1 (기본)",
  "gemini-3-pro-image-preview": "Pro 3 (고품질, 느림)",
  "gemini-2.5-flash-image": "Flash 2.5 (레거시)",
};

export function ModelPicker() {
  const value = useWizardStore((s) => s.imageModelId);
  const setValue = useWizardStore((s) => s.setImageModelId);
  return (
    <div className="rail-model-picker">
      <label className="rail-model-picker-label" htmlFor="rail-model-select">
        이미지 모델
      </label>
      <select
        id="rail-model-select"
        className="rail-model-picker-select"
        value={value}
        onChange={(e) => setValue(e.target.value as ImageModelId)}
      >
        {SUPPORTED_IMAGE_MODELS.map((id) => (
          <option key={id} value={id}>
            {LABELS[id]}
          </option>
        ))}
      </select>
    </div>
  );
}
