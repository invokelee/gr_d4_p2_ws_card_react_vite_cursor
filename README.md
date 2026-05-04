# 한국인 명언 카드 (GPT)

OpenAI Chat Completions API로 **한국 태생 유명인**의 명언을 생성하고, 카드 UI로 보여 주는 **React + Vite** 웹앱입니다.

## 기능

- 한글 명언과 그 아래 **영문 번역**
- 인물 **이름**, **업적(한글 요약)**, **생존 연도** 표시
- 명언의 분위기에 맞춰 **배경 이미지 5종** 중 하나 선택 (`backgroundIndex` 1–5)
- 선택 입력: **주제 키워드**로 생성 방향 힌트
- **듣기(TTS)**: 명언 **앞쪽**에 스피커 아이콘(작은 원형 버튼). 한글·영문 각각 [OpenAI Speech API](https://developers.openai.com/api/docs/guides/audio) `audio/speech`로 MP3 합성 후 재생. 다른 언어 재생 시 이전 오디오는 자동 중지, 새 명언 생성 시에도 재생 중지
- UI: **Material Design 3** 스타일의 토큰·적응형 레이아웃(컴팩트/미디엄/익스팬디드 구간), 다크 톤·틸 악센트([XELA Robotics technology](https://xelarobotics.com/technology/) 페이지 느낌 참고)

## 기술 스택

- React 19, TypeScript
- Vite 5
- OpenAI API:
  - **Chat Completions** — `response_format: json_object`
  - **Audio Speech** — `POST /v1/audio/speech` (MP3)

## 사전 요건

- Node.js 20 권장 (Vite 5와 호환되는 버전)
- [OpenAI API 키](https://platform.openai.com/api-keys)

## 설치 및 실행

```bash
cd goorm_ws/AI_Fit_T/Day4/cursor/ws_card_react_vite
npm install
```

### 환경 변수

프로젝트 루트(`package.json`과 같은 위치)에 `.env` 파일을 만듭니다.

| 변수 | 필수 | 설명 |
|------|------|------|
| `VITE_OPENAI_API_KEY` | 둘 중 하나 | Vite가 클라이언트에 넣을 수 있음. |
| `OPENAI_API_KEY` | 둘 중 하나 | 브라우저에는 노출되지 않음. **프록시**가 서버 측에서만 사용. |
| `VITE_OPENAI_MODEL` | 아니오 | Chat 기본값 `gpt-4o-mini` |
| `VITE_OPENAI_TTS_MODEL` | 아니오 | TTS 기본값 `tts-1` (예: `gpt-4o-mini-tts`) |
| `VITE_OPENAI_TTS_VOICE` | 아니오 | 기본값 `nova` (`alloy`, `echo`, `fable`, `onyx`, `shimmer` 등 [문서](https://platform.openai.com/docs/guides/text-to-speech) 기준) |

**「새 명언 만들기」 버튼 활성화**: `vite.config.ts` 빌드 시 `VITE_OPENAI_API_KEY` 또는 `OPENAI_API_KEY` 존재 여부를 읽어 `__OPENAI_KEY_CONFIGURED__`로 주입합니다. `OPENAI_API_KEY`만 있어도 버튼이 켜집니다.

`.env`를 수정한 뒤에는 **`npm run dev`를 다시 실행**해야 Vite가 값을 다시 읽습니다.

### 개발 서버

```bash
npm run dev
```

- **포트: `8861` 고정** (`strictPort: true` — 이미 사용 중이면 실행 실패)
- 접속: **http://localhost:8861/**
- `host: true`로 동일 네트워크의 다른 기기에서도 접속 가능(터미널에 표시된 Network URL 참고).

### 빌드 및 프리뷰

```bash
npm run build
npm run preview
```

프리뷰도 **8861** 포트와 동일한 **OpenAI 프록시**를 사용합니다.

## OpenAPI 호출과 CORS

브라우저에서 `https://api.openai.com`으로 직접 호출하면 CORS로 막히는 경우가 많습니다. 이 프로젝트는 **Vite 프록시**로 같은 출처 경로 **`/openai-proxy`** 를 쓰고, 개발/프리뷰 서버가 `Authorization` 헤더를 붙여 OpenAI로 전달합니다.

| 용도 | 브라우저가 호출하는 경로 |
|------|-------------------------|
| 명언 생성 | `POST /openai-proxy/v1/chat/completions` |
| TTS | `POST /openai-proxy/v1/audio/speech` |

**`dist`만 정적 호스팅**(예: GitHub Pages 단독)하면 Vite 서버가 없어 위 경로가 **404**가 되며, 명언·듣기 기능은 동작하지 않습니다.

## 배포(지인 소수 공유·터널 없음)

로컬 터널(ngrok, cloudflared 등) 없이 인터넷에 올리려면 **정적 프론트 + OpenAI 프록시**가 함께 있어야 합니다.

- **권장**: [Netlify](https://www.netlify.com/) / [Vercel](https://vercel.com/) / [Cloudflare Pages](https://pages.cloudflare.com/) 등에 **빌드 산출물**을 올리고, **서버리스 함수 또는 Worker**에서 Chat·Speech만 대리 호출. API 키는 **호스팅 대시보드의 환경 변수**에만 저장합니다.
- **GitHub Pages만**: 정적 파일은 제공 가능하나, 위 프록시가 없으면 **이 저장소의 앱 기능은 그대로는 불가**합니다. Pages를 쓰려면 별도 Worker URL 등으로 `fetch` 베이스를 바꾸는 추가 작업이 필요합니다.
- **저장소 이름으로 Pages에 올릴 때**: Vite `base`를 `'/저장소이름/'` 등 실제 경로에 맞춰야 자산 URL이 깨지지 않습니다.

## 배경 이미지

정적 파일은 **`public/img/`** 에 두며, 앱에서는 `/img/...` 로 로드합니다. 루트의 `img/`에 원본이 있을 수 있으나, 빌드·서빙 기준은 **`public/img`** 입니다.

## 디렉터리 구조 (요약)

```
src/
  App.tsx              # 레이아웃, 입력, 로딩·오류 처리
  App.css / index.css  # M3 톤·반응형·스피치 버튼
  components/
    QuoteCard.tsx       # 명언 카드(배경·듣기 버튼·메타)
    SpeechPlayButton.tsx
  lib/
    openai.ts           # Chat Completions + JSON 파싱
    tts.ts              # audio/speech·전역 재생 정리
    backgrounds.ts
    types.ts
vite.config.ts          # 포트 8861, 프록시, 키 설정 플래그 주입
public/img/           # 배경 JPG
```

## 주의 사항

- 모델이 생성한 인용은 **항상 사실과 일치한다고 보장할 수 없습니다.** 중요한 인용은 원전과 대조하세요.
- `VITE_OPENAI_API_KEY`는 빌드 결과에 포함될 수 있으므로, **공개 저장소에 커밋하지 마세요.** `.gitignore`에 `.env`가 포함되어 있습니다.

## 라이선스

교육·실습용 프로젝트입니다. 배경 사진은 Unsplash 등 출처에 따른 라이선스를 따릅니다.
