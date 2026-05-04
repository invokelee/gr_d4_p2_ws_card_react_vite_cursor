/** Vite 프록시 → OpenAI `POST /v1/audio/speech` */
export const TTS_SPEECH_PATH = "/openai-proxy/v1/audio/speech";

const DEFAULT_TTS_MODEL = "tts-1";
const DEFAULT_VOICE = "nova";

let playingUrl: string | null = null;
let playingAudio: HTMLAudioElement | null = null;

export function stopAllSpeechPlayback(): void {
  if (playingAudio) {
    playingAudio.pause();
    playingAudio.removeAttribute("src");
    playingAudio.load();
    playingAudio = null;
  }
  if (playingUrl) {
    URL.revokeObjectURL(playingUrl);
    playingUrl = null;
  }
}

function attachPlaying(audio: HTMLAudioElement, objectUrl: string): void {
  stopAllSpeechPlayback();
  playingUrl = objectUrl;
  playingAudio = audio;
  audio.addEventListener(
    "ended",
    () => {
      if (playingAudio === audio) {
        stopAllSpeechPlayback();
      }
    },
    { once: true },
  );
}

export async function fetchSpeechMp3(
  input: string,
  options: { signal?: AbortSignal } = {},
): Promise<Blob> {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("읽을 텍스트가 없습니다.");
  }

  const model =
    import.meta.env.VITE_OPENAI_TTS_MODEL?.trim() || DEFAULT_TTS_MODEL;
  const voice =
    import.meta.env.VITE_OPENAI_TTS_VOICE?.trim() || DEFAULT_VOICE;

  const res = await fetch(TTS_SPEECH_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: options.signal,
    body: JSON.stringify({
      model,
      voice,
      input: trimmed,
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `음성 합성 오류 (${res.status}): ${errText.slice(0, 240)}`,
    );
  }

  return res.blob();
}

export async function playSpeechFromText(
  input: string,
  options: { signal?: AbortSignal } = {},
): Promise<void> {
  const blob = await fetchSpeechMp3(input, options);
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  attachPlaying(audio, url);
  audio.addEventListener(
    "error",
    () => {
      stopAllSpeechPlayback();
    },
    { once: true },
  );
  try {
    await audio.play();
  } catch (e) {
    stopAllSpeechPlayback();
    throw e instanceof Error ? e : new Error("재생을 시작할 수 없습니다.");
  }
}
