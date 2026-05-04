export type QuoteCardData = {
  name: string;
  /** 짧은 업적·소개 (한국어) */
  achievements: string;
  birthYear: number | null;
  deathYear: number | null;
  isAlive: boolean;
  quoteKo: string;
  quoteEn: string;
  /** 1–5, `img` 폴더 배경과 대응 */
  backgroundIndex: number;
  /** 명언 톤·맥락 (UI 힌트) */
  mood: string;
};
