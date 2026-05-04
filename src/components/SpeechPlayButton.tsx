import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { playSpeechFromText, stopAllSpeechPlayback } from "../lib/tts";

type Lang = "ko" | "en";

type Props = {
  text: string;
  lang: Lang;
  className?: string;
};

function SpeakerIcon() {
  return (
    <svg
      className="speech-btn__icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M11 5L6 9H3v6h3l5 4V5z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M15.54 8.46a5 5 0 010 7.07M17.66 6.34a8 8 0 010 11.32"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
}

export function SpeechPlayButton({ text, lang, className = "" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const ariaLabel =
    lang === "ko" ? "한국어 명언 듣기" : "영문 번역 듣기";

  const disabled = !text.trim() || loading;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      stopAllSpeechPlayback();
    };
  }, []);

  const onClick = useCallback(async () => {
    if (!text.trim()) return;
    setError(null);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    try {
      stopAllSpeechPlayback();
      await playSpeechFromText(text, { signal: ac.signal });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "재생 실패");
    } finally {
      if (abortRef.current === ac) {
        abortRef.current = null;
      }
      setLoading(false);
    }
  }, [text]);

  return (
    <div className={`speech-btn-wrap ${className}`.trim()}>
      <button
        type="button"
        className={`speech-btn${loading ? " speech-btn--loading" : ""}`}
        onClick={() => void onClick()}
        disabled={disabled}
        aria-label={ariaLabel}
        title={error ?? ariaLabel}
      >
        <SpeakerIcon />
        {loading && (
          <span className="speech-btn__spinner" aria-hidden />
        )}
      </button>
      {error && (
        <span className="speech-btn__err m3-body-small" role="status">
          {error}
        </span>
      )}
    </div>
  );
}
