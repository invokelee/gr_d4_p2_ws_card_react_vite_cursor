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

브라우저에서 `https://api.openai.com`으로 직접 호출하면 CORS로 막히는 경우가 많습니다. 이 프로젝트는 **같은 출처로만** OpenAI에 접근합니다.

| 환경 | 릴레이 방식 | 브라우저 경로 예 |
|------|-------------|-----------------|
| **로컬** `npm run dev` / `npm run preview` | Vite `server.proxy` | `POST /openai-proxy/v1/chat/completions`, `POST /openai-proxy/v1/audio/speech` |
| **Vercel** | `api/*.ts` 서버리스 함수 | `POST /api/chat-completions`, `POST /api/audio-speech` |

Vercel에서는 빌드 시 `process.env.VERCEL`이 설정되어 클라이언트 번들에 **`/api` 릴레이**가 박힙니다(`vite.config.ts`의 `define`).

**`dist`만 정적 호스팅**(GitHub Pages 단독 등)하면 위 릴레이가 없어 **명언·듣기가 동작하지 않습니다.**

## Vercel 배포(터널 없음)

이 저장소에는 **`vercel.json`** 과 **`api/chat-completions.ts`**, **`api/audio-speech.ts`** 가 포함되어 있습니다. 배포 후 프론트는 `/api/*` 로 OpenAI를 호출하고, **API 키는 서버리스 환경 변수**에서만 사용합니다.

### 1) Vercel에 프로젝트 연결

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인합니다.
2. **Add New… → Project** 에서 본 저장소 GitHub 저장소를 **Import** 합니다 (또는 CLI로 연결).

### 2) 환경 변수 설정

프로젝트 **Settings → Environment Variables** 에서 다음을 추가합니다 (**Production**과 **Preview** 모두 필요하면 동일하게 등록).

| 이름 | 필수 | 설명 |
|------|------|------|
| **`OPENAI_API_KEY`** | 예 | 서버리스 프록시가 OpenAI 호출 시 사용. **값은 클라이언트 번들에 넣히지 않습니다.** |
| `VITE_OPENAI_MODEL` | 아니오 | Chat 모델(기본 `gpt-4o-mini`). 클라이언트 빌드에 포함됩니다. |
| `VITE_OPENAI_TTS_MODEL` | 아니오 | TTS 모델(기본 `tts-1`). |
| `VITE_OPENAI_TTS_VOICE` | 아니오 | TTS 보이스(기본 `nova`). |

또한 **`OPENAI_API_KEY`는 빌드 시점에도** 읽히므로(**`vite.config`의 `loadEnv`**), **「새 명언 만들기」 버튼 활성 플래그**가 켜지려면 변수 스코프에서 **Build** 에도 포함되도록 설정합니다(Vercel UI에서 해당 환경에 체크).

공개 저장소라면 **`VITE_OPENAI_API_KEY`는 넣지 않는 것**을 권장합니다(키가 번들에 포함될 수 있음). **`OPENAI_API_KEY`만**으로 서버 호출과 버튼 활성 조건을 맞출 수 있습니다.

### 3) `OPENAI_API_KEY` 를 환경 변수로 넣기

- **대시보드**: Project → **Settings** → **Environment Variables** → 이름 `OPENAI_API_KEY`, 값에 키 입력 → **Production**, **Preview**, **Development**(로컬 빌드 연동 시)에 추가 → **Save**.
- **CLI (로컬 `.env` 값을 그대로 등록)**:

  ```bash
  cd /경로/ws_card_react_vite
  vercel login
  vercel link          # 최초 1회, 이 저장소와 같은 Vercel 프로젝트에 연결
  npm run vercel:push-key
  ```

  `scripts/vercel-push-openai-key.mjs` 가 `production` / `preview` / `development` 세 환경 모두에 같은 키를 올립니다(이미 있으면 `--force`로 덮어씀).

### 4) 배포 실행

Dashboard에서 **Deploy** 하거나, 로컬에서 [Vercel CLI](https://vercel.com/docs/cli) 사용:

```bash
npm i -g vercel
cd /경로/ws_card_react_vite
vercel login
vercel link   # 최초 1회 프로젝트 연결
vercel --prod
```

환경 변수 등록 후에는 **Redeploy** 한 번 해 두면 프록시·프론트 빌드 모두 새 값을 씁니다.

완료 후 표시되는 **`https://<프로젝트>.vercel.app`** URL로 접속해 앱을 실행합니다.

**배포 확인**: Dashboard → **Deployments** 에서 최근 빌드가 **Ready** 인지 보고, 할당된 도메인으로 브라우저에서 명언 생성·TTS를 점검합니다. `main` 등에 **push** 하면 자동으로 새 Preview/Production 배포가 돌아가도록 GitHub와 연결됩니다.

### 5) 기타

- `vercel.json`의 SPA용 **rewrite**는 `/api/*`를 제외하고 `index.html`로 넘깁니다.
- 서버리스 **최대 실행 시간**은 `maxDuration`: 60초로 두었습니다(플랜에 따라 한도가 다를 수 있음).

## Vercel과 GitHub Pages

- **서로 다른 호스팅**입니다. GitHub에 저장소를 두고 Vercel에서 **Import**해 배포했다면, 사용자에게 보이는 주소는 보통 **`*.vercel.app`**(또는 연결한 커스텀 도메인)입니다.
- **GitHub Pages** 에서 같은 앱이 자동으로 열리지는 **않습니다.** Pages를 쓰려면 `gh-pages` 브랜치·Actions 등 **별도 설정**으로 `dist`를 올려야 합니다.
- 이 프로젝트는 **서버리스 `/api/*` 프록시**가 필요하므로, **GitHub Pages만** 정적 파일로 호스팅하면 명언·TTS가 동작하지 않습니다. Pages까지 쓰려면 프록시를 **별도(예: Workers)** 에 두고 프론트의 API 주소를 맞추는 추가 작업이 필요합니다.
- **실서비스 URL은 Vercel 쪽 하나로 통일**해 두면 충분한 경우가 많습니다.

## 기타 호스팅(Netlify 등)

동일하게 **정적 빌드 + 별도의 Chat/TTS 프록시** 패턴으로 옮길 수 있습니다. GitHub Pages **단독**은 릴레이가 없어 이 앱의 API 기능만으로는 불완전합니다.

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
    openaiRelay.ts       # 로컬/ Vercel OpenAI 릴레이 URL 분기
    openai.ts            # Chat Completions + JSON 파싱
    tts.ts               # audio/speech·전역 재생 정리
    backgrounds.ts
    types.ts
api/
  chat-completions.ts   # Vercel: Chat 프록시
  audio-speech.ts       # Vercel: TTS 프록시
vercel.json             # Vercel 빌드·SPA rewrite·함수 시간
scripts/
  vercel-push-openai-key.mjs  # 로컬 .env → Vercel OPENAI_API_KEY (`npm run vercel:push-key`)
vite.config.ts          # 포트 8861, 프록시, define 주입
public/img/           # 배경 JPG
```

## 주의 사항

- 모델이 생성한 인용은 **항상 사실과 일치한다고 보장할 수 없습니다.** 중요한 인용은 원전과 대조하세요.
- `VITE_OPENAI_API_KEY`는 빌드 결과에 포함될 수 있으므로, **공개 저장소에 커밋하지 마세요.** `.gitignore`에 `.env`가 포함되어 있습니다.

## 라이선스

교육·실습용 프로젝트입니다. 배경 사진은 Unsplash 등 출처에 따른 라이선스를 따릅니다.
