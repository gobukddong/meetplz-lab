## 2026-01-28 초기 셋업/빌드 안정화 기록

### 1) 설치 날짜 및 작업자
- **날짜**: 2026-01-28
- **작업자**: 시니어 개발자(사용자) & AI 파트너

### 2) 설치된 라이브러리 목록 (pnpm add)
오늘 빌드 과정에서 UI(v0/shadcn 스타일) 및 유틸 의존성이 누락되어 아래 패키지들을 추가했습니다.

- **UI/컴포넌트 (Radix UI)**  
  - `@radix-ui/react-avatar`
  - `@radix-ui/react-checkbox`
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-label`
  - `@radix-ui/react-slot`
- **스타일 유틸/클래스 조합**
  - `class-variance-authority`
  - `clsx`
  - `tailwind-merge`
- **아이콘/테마**
  - `lucide-react`
  - `next-themes`
- **날짜/캘린더**
  - `date-fns`
  - `react-day-picker`
- **관측/분석**
  - `@vercel/analytics`

### 3) 각 라이브러리를 설치한 이유
- **Radix UI (`@radix-ui/*`)**: v0/shadcn 스타일의 UI 컴포넌트 구현(avatar, dialog, dropdown 등)에 필요.
- **`class-variance-authority`**: shadcn 패턴에서 variant 기반 클래스 조합을 위해 필요.
- **`clsx` + `tailwind-merge`**: `cn()` 유틸 구현 및 tailwind 클래스 충돌 병합을 위해 필요.
- **`lucide-react`**: 아이콘 컴포넌트 사용(헤더/버튼/상태 표시 등).
- **`next-themes`**: 다크모드 토글 및 테마 상태 관리(`ThemeProvider`, `useTheme`)에 필요.
- **`date-fns`**: 날짜 포맷팅(일정/캘린더 UI) 용도.
- **`react-day-picker`**: 캘린더 UI 컴포넌트 기반.
- **`@vercel/analytics`**: v0 결과물과의 정합성/관측 기능 유지용(선택적).

### 4) 발생했던 에러와 해결 과정 요약
- **(A) `middleware.ts` export 누락**
  - 증상: “Middleware is missing expected function export name”
  - 조치: `middleware.ts`에 최소 `export function middleware()`를 추가해 빌드 차단 해제.

- **(B) 다수 모듈 미설치**
  - 증상: Radix UI, `clsx`, `tailwind-merge`, `lucide-react`, `next-themes`, `react-day-picker`, `date-fns` 등 “Module not found”
  - 조치: 소스 import 스캔 후 누락 의존성 일괄 설치(`pnpm add ...`).

- **(C) pnpm store 위치 불일치**
  - 증상: `ERR_PNPM_UNEXPECTED_STORE`
  - 조치: `pnpm install`로 `node_modules` 재생성. (CI 환경 변수 설정으로 non-TTY 제거 플로우 처리)

- **(D) `next` 실행 불가**
  - 증상: `'next'은(는) ... 프로그램이 아닙니다.`
  - 원인: 설치가 중단되어 `node_modules/.bin/next`가 생성되지 않음
  - 조치: 설치 완료 후 재시도.

- **(E) App Router 파일이 “not a module”**
  - 증상: `page.tsx`/`route.ts`가 주석만 있어 타입체크에서 “is not a module”
  - 조치: 최소 `export default` 페이지/레이아웃 및 `export async function GET()`를 추가.

- **(F) tmp-v0 관련 빌드 차단 이슈**
  - 증상: tmp-v0 내부의 경로/유틸 import 불일치로 타입 에러 연쇄
  - 조치: tmp-v0는 백업용으로 정의하고 **빌드/타입체크 대상에서 제외**하도록 `tsconfig.json` exclude 및 Tailwind 스캔 대상에서 제거, Cursor 규칙에 “tmp-v0 import 금지”를 추가.

- **(G) `tw-animate-css` import로 CSS 빌드 실패**
  - 증상: `app/globals.css`에서 `tw-animate-css`를 resolve 하지 못함
  - 조치: 패키지 설치 대신, 우선 `@import "tw-animate-css"`를 제거하여 빌드 차단 해제.

