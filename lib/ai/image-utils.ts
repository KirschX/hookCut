import type { BubbleKind, BubblePosition } from "@/schemas/ad-proposal";

export function composeImagenPrompt(p: {
  prompt: string;
  composition: string;
  bubbleKind: BubbleKind;
  bubblePosition: BubblePosition;
  bubbleText: string;
}): string {
  const bubble =
    p.bubbleKind === "speech"
      ? `with a single bold ${p.bubblePosition} speech bubble. The bubble contains the Korean Hangul text "${p.bubbleText}", clearly legible. Lettering inside the bubble: "${p.bubbleText}".`
      : `with a single bold ${p.bubblePosition} narration banner. The banner contains the Korean Hangul text "${p.bubbleText}", clearly legible. Banner text: "${p.bubbleText}".`;
  return [p.prompt.trim(), p.composition.trim(), bubble].join(". ");
}
