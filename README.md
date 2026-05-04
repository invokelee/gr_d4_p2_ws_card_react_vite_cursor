# 한국인 명언 카드 (GPT)

OpenAI Chat Completions API로 **한국 태생 유명인**의 명언을 생성하고, 카드 UI로 보여 주는 **React + Vite** 웹앱입니다.

## 기능

- 한글 명언과 그 아래 **영문 번역**
- 인물 **이름**, **업적(한글 요약)**, **생존 연도** 표시
- 명언의 분위기에 맞춰 **배경 이미지 5종** 중 하나 선택 (`backgroundIndex` 1–5)
- 선택 입력: **주제 키워드**로 생성 방향 힌트
- UI: **Material Design 3** 스타일의 토큰·적응형 레이아웃(컴팩트/미디엄/익스팬디드 구간), 다크 톤·틸 악센트([XELA Robotics technology](https://xelarobotics.com/technology/) 페이지 느낌 참고)

## 기술 스택

- React 19, TypeScript
- Vite 5
- OpenAI API: `gpt-4o-mini` 기본(환경 변수로 변경 가능), `response_format: json_object`

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
| `VITE_OPENAI_API_KEY` | 둘 중 하나 | 클라이언트에도 노출됨. |
| `OPENAI_API_KEY` | 둘 중 하나 | 브라우저에는 안 보이고, **Vite 개발/프리뷰 서버**가 프록시 요청 시만 사용. |
| `VITE_OPENAI_MODEL` | 아니오 | 기본값 `gpt-4o-mini` |

`.env`를 수정한 뒤에는 **`npm run dev`를 다시 실행**해야 Vite가 값을 다시 읽습니다.

### 개발 서버

```bash
npm run dev
```

- **포트: `8861` 고정** (`strictPort: true` — 포트가 이미 쓰이면 실행이 실패합니다.)
- 접속: **http://localhost:8861/**
- `host: true`로 동일 네트워크의 다른 기기에서도 접속 가능(터미널에 표시된 Network URL 참고).

### 빌드 및 프리뷰

```bash
npm run build
npm run preview
```

프리뷰도 **8861** 포트와 동일한 **OpenAI 프록시** 설정을 사용합니다.

## OpenAPI 호출과 CORS

브라우저에서 `https://api.openai.com`으로 직접 호출하면 CORS로 막히는 경우가 많습니다. 이 프로젝트는 **Vite 프록시**로 같은 출처 경로 `/openai-proxy`를 쓰고, 서버가 `Authorization` 헤더를 붙여 OpenAI로 전달합니다.

- **개발(`npm run dev`)** 및 **`npm run preview`**: 위 방식으로 동작합니다.
- **`dist`만 정적 호스팅**할 때는 Vite 서버가 없으므로 `/openai-proxy`가 없어 API 호출이 실패합니다. 공개 배포 시에는 백엔드·서버리스 등으로 프록시를 두는 구성이 필요합니다.

## 배경 이미지

정적 파일은 `public/img/`에 두며, 앱에서는 `/img/...` 경로로 로드합니다. 원본은 프로젝트 루트의 `img/`에도 복사본이 있을 수 있습니다. 실제 서빙은 **`public/img`** 기준입니다.

## 디렉터리 구조 (요약)

```
src/
  App.tsx              # 레이아웃, 입력, 로딩·오류 처리
  App.css / index.css  # M3 톤·반응형
  components/
    QuoteCard.tsx      # 명언 카드 UI
  lib/
    openai.ts          # Chat Completions + JSON 파싱
    backgrounds.ts     # backgroundIndex → 이미지 URL
    types.ts           # QuoteCardData
vite.config.ts         # 포트 8861, OpenAI 프록시, 키 설정 플래그 주입
public/img/            # 배경 JPG
```

## 주의 사항

- 모델이 생성한 인용은 **항상 사실과 일치한다고 보장할 수 없습니다.** 중요한 인용은 원전과 대조하세요.
- `VITE_OPENAI_API_KEY`는 빌드 결과에 포함될 수 있으므로, **공개 저장소에 커밋하지 마세요.** `.gitignore`에 `.env`가 포함되어 있습니다.

## 라이선스

교육·실습용 프로젝트입니다. 배경 사진은 Unsplash 등 출처에 따른 라이선스를 따릅니다.
