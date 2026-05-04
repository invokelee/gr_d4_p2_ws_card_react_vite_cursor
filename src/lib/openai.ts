import type { QuoteCardData } from "./types";
import { openAiChatCompletionsUrl } from "./openaiRelay";

const SYSTEM_INSTRUCTION = `당신은 한국 태생의 유명인(역사·문학·과학·예술·사회운동 등)이 남긴 실제 명언을 선별합니다.
반드시 실존 인물의 출처가 분명한 인용만 사용하고, 불확실하면 다른 인물·명언으로 교체합니다.
응답은 요청된 JSON 객체 하나만 포함하고, 그 외 텍스트는 넣지 마세요.`;

function buildUserPrompt(seedHint: string): string {
  const hint = seedHint.trim()
    ? `선호 주제/키워드: "${seedHint.trim()}"`
    : "주제는 자유롭게 선택하세요.";
  return `${hint}

다음 필드를 모두 채우세요. 인물은 반드시 한국 태생이어야 합니다.
- name: 인물 이름 (한글)
- achievements: 이 인물이 널리 알려진 업적·분야를 1~2문장(한국어)
- birthYear, deathYear: 출생·사망 연도(정수). 생존이면 deathYear는 null, isAlive는 true
- isAlive: 생존 여부
- quoteKo: 그 인물의 명언 본문(한국어, 짧은 인용부호 없이 문장만)
- quoteEn: 위 명언의 자연스러운 영어 번역
- mood: 명언의 분위기를 한 단어로(예: 희망, 성찰, 열정)
- backgroundIndex: 명언의 맥락·분위기에 맞게 1~5 중 하나.
  1=부드러운 하늘·빛, 2=도시·에너지, 3=심연·집중, 4=자연·서정, 5=따뜻한 톤.

JSON 키: name, achievements, birthYear, deathYear, isAlive, quoteKo, quoteEn, mood, backgroundIndex`;
}

function parseJsonObject(content: string): unknown {
  const trimmed = content.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  const jsonStr = fence ? fence[1].trim() : trimmed;
  return JSON.parse(jsonStr) as unknown;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function toQuoteCardData(raw: unknown): QuoteCardData {
  if (!isRecord(raw)) {
    throw new Error("응답 형식이 올바르지 않습니다.");
  }
  const name = String(raw.name ?? "");
  const achievements = String(raw.achievements ?? "");
  const quoteKo = String(raw.quoteKo ?? "");
  const quoteEn = String(raw.quoteEn ?? "");
  const mood = String(raw.mood ?? "");
  const isAlive = Boolean(raw.isAlive);
  const birthYear =
    raw.birthYear === null || raw.birthYear === undefined
      ? null
      : Number(raw.birthYear);
  const deathYear =
    raw.deathYear === null || raw.deathYear === undefined
      ? null
      : Number(raw.deathYear);
  let backgroundIndex = Number(raw.backgroundIndex);
  if (!Number.isFinite(backgroundIndex)) backgroundIndex = 1;
  backgroundIndex = Math.min(Math.max(Math.round(backgroundIndex), 1), 5);

  if (!name || !quoteKo || !quoteEn) {
    throw new Error("필수 필드가 비어 있습니다.");
  }

  return {
    name,
    achievements,
    birthYear: Number.isFinite(birthYear) ? birthYear : null,
    deathYear: Number.isFinite(deathYear) ? deathYear : null,
    isAlive,
    quoteKo,
    quoteEn,
    mood,
    backgroundIndex,
  };
}

export async function fetchQuoteFromOpenAI(
  _apiKey: string,
  model: string,
  seedHint: string,
): Promise<QuoteCardData> {
  const res = await fetch(openAiChatCompletionsUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: buildUserPrompt(seedHint) },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API 오류 (${res.status}): ${errText.slice(0, 400)}`);
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("응답 본문이 비어 있습니다.");
  }

  const parsed = parseJsonObject(content);
  return toQuoteCardData(parsed);
}
