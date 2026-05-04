/** Vite 빌드 시 `vite.config`에서 주입. 로컬: `/openai-proxy`, Vercel: `/api` */

export function openAiChatCompletionsUrl(): string {
  if (__OPENAI_HTTP_PREFIX__ === "/api") {
    return "/api/chat-completions";
  }
  return `${__OPENAI_HTTP_PREFIX__}/v1/chat/completions`;
}

export function openAiSpeechUrl(): string {
  if (__OPENAI_HTTP_PREFIX__ === "/api") {
    return "/api/audio-speech";
  }
  return `${__OPENAI_HTTP_PREFIX__}/v1/audio/speech`;
}
