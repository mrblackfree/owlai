import { z } from "zod";

// Category mapping with English keys for API compatibility
export const TOOL_CATEGORIES_MAP = {
  "Writing & Content Creation": { en: "Writing & Content Creation", ko: "글쓰기 및 콘텐츠 제작" },
  "Image Generation & Editing": { en: "Image Generation & Editing", ko: "이미지 생성 및 편집" },
  "Video Creation & Editing": { en: "Video Creation & Editing", ko: "비디오 제작 및 편집" },
  "Code & Development": { en: "Code & Development", ko: "코드 및 개발" },
  "Productivity & Automation": { en: "Productivity & Automation", ko: "생산성 및 자동화" },
  "Business & Marketing": { en: "Business & Marketing", ko: "비즈니스 및 마케팅" },
  "Research & Analysis": { en: "Research & Analysis", ko: "리서치 및 분석" },
  "Communication & Chat": { en: "Communication & Chat", ko: "커뮤니케이션 및 채팅" },
  "Education & Learning": { en: "Education & Learning", ko: "교육 및 학습" },
  "Design & Creative": { en: "Design & Creative", ko: "디자인 및 창작" },
  "Audio & Music": { en: "Audio & Music", ko: "오디오 및 음악" },
  "Data & Analytics": { en: "Data & Analytics", ko: "데이터 및 분석" },
  "Social Media": { en: "Social Media", ko: "소셜 미디어" },
  "SEO & Web": { en: "SEO & Web", ko: "SEO 및 웹" },
  "Healthcare & Wellness": { en: "Healthcare & Wellness", ko: "헬스케어 및 웰빙" },
  "Finance & Trading": { en: "Finance & Trading", ko: "금융 및 트레이딩" },
  "Gaming & Entertainment": { en: "Gaming & Entertainment", ko: "게임 및 엔터테인먼트" },
  "Translation & Language": { en: "Translation & Language", ko: "번역 및 언어" },
  "Other": { en: "Other", ko: "기타" }
} as const;

export const TOOL_CATEGORIES = Object.keys(TOOL_CATEGORIES_MAP) as readonly string[];

// Helper function to get translated category
export const getCategoryTranslation = (category: string, lang: 'en' | 'ko' = 'ko'): string => {
  const cat = TOOL_CATEGORIES_MAP[category as keyof typeof TOOL_CATEGORIES_MAP];
  return cat ? cat[lang] : category;
};

export const COMMON_TAGS_MAP = {
  "AI": { en: "AI", ko: "인공지능" },
  "Machine Learning": { en: "Machine Learning", ko: "머신러닝" },
  "GPT": { en: "GPT", ko: "GPT" },
  "Neural Networks": { en: "Neural Networks", ko: "신경망" },
  "Deep Learning": { en: "Deep Learning", ko: "딥러닝" },
  "NLP": { en: "NLP", ko: "자연어처리" },
  "Computer Vision": { en: "Computer Vision", ko: "컴퓨터 비전" },
  "Automation": { en: "Automation", ko: "자동화" },
  "No-Code": { en: "No-Code", ko: "노코드" },
  "API": { en: "API", ko: "API" },
};

export const COMMON_TAGS = new Set(Object.keys(COMMON_TAGS_MAP));

// Helper function to get translated tag
export const getTagTranslation = (tag: string, lang: 'en' | 'ko' = 'ko'): string => {
  const tagData = COMMON_TAGS_MAP[tag as keyof typeof COMMON_TAGS_MAP];
  return tagData ? tagData[lang] : tag;
};

export const toolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  websiteUrl: z.string().url("Invalid URL"),
  category: z.enum(TOOL_CATEGORIES),
  tags: z.array(z.string()),
  pricing: z.object({
    type: z.enum(["free", "freemium", "paid", "enterprise"]),
    startingPrice: z.number().optional(),
  }),
  features: z.array(z.string()),
  logo: z.string().url("Invalid URL").optional(),
  status: z.enum(["draft", "published", "archived"]),
  isTrending: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isUpcoming: z.boolean().default(false),
  isTopRated: z.boolean().default(false),
});

export type ToolFormData = z.infer<typeof toolSchema>; 