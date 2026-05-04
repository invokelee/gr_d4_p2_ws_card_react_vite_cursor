import { useCallback, useMemo, useState } from "react";
import { QuoteCard } from "./components/QuoteCard";
import { fetchQuoteFromOpenAI } from "./lib/openai";
import type { QuoteCardData } from "./lib/types";
import "./App.css";

const DEFAULT_MODEL = "gpt-4o-mini";

export default function App() {
  const [seed, setSeed] = useState("");
  const [data, setData] = useState<QuoteCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY ?? "";
  const model = import.meta.env.VITE_OPENAI_MODEL ?? DEFAULT_MODEL;
  /** .env 의 VITE_OPENAI_API_KEY 또는 OPENAI_API_KEY(프록시용, 빌드 시 주입) */
  const hasKey = __OPENAI_KEY_CONFIGURED__;

  const hintText = useMemo(
    () =>
      "예: 과학, 예술, 독립운동 — 비워두면 모델이 주제를 고릅니다.",
    [],
  );

  const loadQuote = useCallback(async () => {
    if (!hasKey) {
      setError(
        ".env에 VITE_OPENAI_API_KEY 또는 OPENAI_API_KEY를 넣고 dev 서버를 재시작하세요.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await fetchQuoteFromOpenAI(apiKey, model, seed);
      setData(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, [apiKey, hasKey, model, seed]);

  return (
    <div className="app-shell">
      <header className="top-bar m3-elevation-1">
        <div className="top-bar__inner">
          <div className="brand">
            <span className="brand__mark" aria-hidden />
            <div>
              <h1 className="brand__title m3-title-large">명언 카드</h1>
              <p className="brand__subtitle m3-body-small">
                한국계 저명 인물의 말을 카드로 만듭니다
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="main-region">
        <div className="main-region__inner">
          <section className="control-panel m3-surface-container-high m3-elevation-1">
            <label className="m3-label-large" htmlFor="seed-input">
              주제 키워드 (선택)
            </label>
            <input
              id="seed-input"
              className="m3-filled-field"
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder={hintText}
              disabled={loading}
              autoComplete="off"
            />
            <div className="control-panel__actions">
              <button
                type="button"
                className="m3-filled-button"
                onClick={() => void loadQuote()}
                disabled={loading || !hasKey}
              >
                {loading ? "불러오는 중…" : "새 명언 만들기"}
              </button>
            </div>
            {!hasKey && (
              <p className="m3-body-small warning" role="status">
                프로젝트 루트 <code>.env</code>에{" "}
                <code>VITE_OPENAI_API_KEY</code> 또는{" "}
                <code>OPENAI_API_KEY</code>를 넣고{" "}
                <strong>npm run dev</strong>를 다시 실행해 주세요. (변수명에{" "}
                <code>VITE_</code> 접두사가 없으면 브라우저에 노출되지 않아, 위
                두 이름 중 하나가 있어야 버튼이 활성화됩니다.)
              </p>
            )}
            {error && (
              <p className="m3-body-small error" role="alert">
                {error}
              </p>
            )}
          </section>

          {data && (
            <section className="card-region" aria-live="polite">
              <QuoteCard data={data} />
            </section>
          )}

          {!data && !loading && (
            <p className="empty-hint m3-body-large">
              버튼을 눌러 GPT가 선별한 명언 카드를 받아 보세요.
            </p>
          )}
        </div>
      </main>

      <footer className="site-footer m3-body-small">
        <p>
          배경 이미지는 명언의 분위기에 맞춰 선택됩니다. 디자인은 Material 3
          적응형 레이아웃과 XELA Robotics 스타일의 다크·테크 톤을 참고했습니다.
        </p>
      </footer>
    </div>
  );
}
