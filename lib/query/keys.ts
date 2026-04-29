export const qk = {
  cutImage: (adIndex: number, cutIndex: number, prompt: string, ratio: string) =>
    ["cutImage", adIndex, cutIndex, prompt, ratio] as const,
};
