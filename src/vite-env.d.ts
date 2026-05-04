/// <reference types="vite/client" />

declare const __OPENAI_KEY_CONFIGURED__: boolean;
declare const __OPENAI_HTTP_PREFIX__: string;

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_OPENAI_MODEL: string;
  /** TTS: 기본 `tts-1` (예: `gpt-4o-mini-tts`) */
  readonly VITE_OPENAI_TTS_MODEL?: string;
  /** TTS 보이스: alloy, echo, fable, onyx, nova, shimmer 등 */
  readonly VITE_OPENAI_TTS_VOICE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
