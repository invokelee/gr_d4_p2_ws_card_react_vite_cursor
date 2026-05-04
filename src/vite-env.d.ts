/// <reference types="vite/client" />

declare const __OPENAI_KEY_CONFIGURED__: boolean;

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_OPENAI_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
