import { z } from "zod";

export const StorylineSchema = z.object({
  id: z.string().regex(/^[A-E]$/),
  title: z.string().min(1).max(40),
  summary: z.string().min(20).max(300),
  pros: z.array(z.string().max(60)).min(1).max(4),
  risks: z.array(z.string().max(80)).min(1).max(3),
  target: z.string().max(80),
});
export type Storyline = z.infer<typeof StorylineSchema>;

export const CharacterSchema = z.object({
  name: z.string().max(20),
  role: z.string().max(40),
  note: z.string().max(80),
});
export type Character = z.infer<typeof CharacterSchema>;

export const AnalysisSchema = z.object({
  genre: z.string().max(60),
  tone: z.array(z.string().max(20)).min(2).max(5),
  characters: z.array(CharacterSchema).min(1).max(6),
  coreConflict: z.string().min(20).max(300),
  hooks: z.array(z.string().max(120)).min(2).max(5),
  spoilers: z.array(z.string().max(160)).min(0).max(5),
  candidates: z.array(StorylineSchema).min(3).max(5),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

export const AnalyzeInputSchema = z.object({
  excerpt: z.string().min(50).max(20000),
  wikiUrl: z.string().url().optional().or(z.literal("")),
  memo: z.string().max(500).optional(),
  contentMedium: z.enum(["novel", "webtoon", "manga"]).default("novel"),
});
export type AnalyzeInput = z.infer<typeof AnalyzeInputSchema>;
