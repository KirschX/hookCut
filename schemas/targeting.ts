import { z } from "zod";

export const TargetingSchema = z.object({
  age: z.string().max(40),
  readerType: z.string().max(40),
  audience: z.string().max(40),
  goal: z.string().max(40),
  tone: z.array(z.string().max(40)),
  avoid: z.array(z.string().max(40)),
});
export type Targeting = z.infer<typeof TargetingSchema>;

export const DEFAULT_TARGETING: Targeting = {
  age: "20대 후반~30대",
  readerType: "남성향 판타지",
  audience: "기존 장르 독자",
  goal: "첫 화 읽기 유도",
  tone: ["강한 후킹", "어두운 분위기"],
  avoid: ["스포일러", "캐릭터 왜곡"],
};

export const TARGETING_QUESTIONS = [
  {
    key: "age" as const,
    label: "연령대",
    multi: false,
    opts: ["10대", "20대 초반", "20대 후반~30대", "40대 이상", "전체"],
  },
  {
    key: "readerType" as const,
    label: "독자 성향",
    multi: false,
    opts: ["남성향 판타지", "여성향 로판", "무협 · 선협", "라이트노벨 · 서브컬처", "일반 대중"],
  },
  {
    key: "audience" as const,
    label: "기존 vs 신규",
    multi: false,
    opts: ["기존 장르 독자", "신규 유입", "작품을 아는 팬", "이탈 유저 재유입"],
  },
  {
    key: "goal" as const,
    label: "광고 목적",
    multi: false,
    opts: ["첫 클릭 유도", "첫 화 읽기 유도", "캐릭터 어필", "세계관 어필", "이벤트 홍보", "팬덤 반응 유도"],
  },
  {
    key: "tone" as const,
    label: "톤앤매너",
    multi: true,
    opts: ["강한 후킹", "감성 몰입", "캐릭터 중심", "코믹 · 밈", "고급스럽고 진지", "어두운 분위기", "밝고 캐주얼"],
  },
  {
    key: "avoid" as const,
    label: "피하고 싶은 방향",
    multi: true,
    warn: true,
    opts: ["과도한 선정성", "과도한 폭력성", "스포일러", "유치한 카피", "낚시성 광고", "원작과 다른 분위기", "캐릭터 왜곡"],
  },
] as const;
