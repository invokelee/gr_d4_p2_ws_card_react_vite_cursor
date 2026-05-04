import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { ProxyOptions } from "vite";

/** 브라우저→OpenAI 직접 호출은 CORS로 차단되므로, 개발/프리뷰는 동일 출처 프록시 사용 */
function openaiProxy(apiKey: string): Record<string, ProxyOptions> {
  return {
    "/openai-proxy": {
      target: "https://api.openai.com",
      changeOrigin: true,
      secure: true,
      rewrite: (path) => path.replace(/^\/openai-proxy/, ""),
      configure: (proxy) => {
        proxy.on("proxyReq", (proxyReq) => {
          if (apiKey) {
            proxyReq.setHeader("Authorization", `Bearer ${apiKey}`);
          }
        });
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  /** 프록시용: VITE_ 우선, 많은 예제는 OPENAI_API_KEY 만 쓰기도 함 */
  const apiKey =
    env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY || "";
  const openAiConfigured = Boolean(apiKey);
  /** Vercel 빌드에서는 서버리스 `/api/*` 로 OpenAI 프록시 */
  const relayPrefix = process.env.VERCEL ? "/api" : "/openai-proxy";

  return {
    plugins: [react()],
    publicDir: "public",
    /** 클라이언트는 OPENAI_API_KEY 를 볼 수 없으므로, 설정 여부만 주입 */
    define: {
      __OPENAI_KEY_CONFIGURED__: JSON.stringify(openAiConfigured),
      __OPENAI_HTTP_PREFIX__: JSON.stringify(relayPrefix),
    },
    server: {
      port: 8861,
      strictPort: true,
      host: true,
      proxy: openaiProxy(apiKey),
    },
    preview: {
      port: 8861,
      strictPort: true,
      host: true,
      /* merge 시 server.proxy를 물려받음 — 명시적으로 동일 프록시 유지 */
      proxy: openaiProxy(apiKey),
    },
  };
});
