# meetplz

> **나만의 일정은 단단하게 관리하고, 공유는 선택적으로 — 모임과 할 일을 하나의 캘린더에서 관리하는 소셜 생산성 앱**

---

## 1. 개요 (Overview)

`meetplz`는 개인의 프라이버시를 최우선으로 생각하면서도, 필요할 때 가볍게 모임을 만들고 참여할 수 있는 소셜 캘린더 서비스입니다. Notion, Todoist, Google Calendar의 장점을 결합하여 한 화면에서 오늘의 모든 맥락을 파악할 수 있도록 설계되었습니다.

### 핵심 가치
- **Personal First**: 개인 일정과 프라이버시를 최우선으로 설계된 보안 환경.
- **No Friction Social**: 확정된 일정 기반의 간단한 모임 참여 및 소셜 피드.
- **Visual Productivity**: Split View를 통한 개인 할 일과 소셜 모임의 통합 관리.

---

## 2. 주요 기능 (Key Features)

### 📅 개인 관리 (My Schedule)
- **캘린더**: 월 단위 일정 확인 및 오늘 날짜 하이라이트.
- **할 일 관리 (Tasks)**: 체크박스 기반의 할 일 CRUD 및 공개/비공개 선택.
- **자동 동기화**: 참여한 모임이 내 캘린더에 자동으로 할 일로 등록됩니다.

### 🤝 소셜 모임 (Open Meetings)
- **모임 피드**: 현재 모집 중인 모임을 최신순/임박순으로 확인.
- **모임 생성**: 제목, 날짜/시간, 장소 정보를 포함한 모임 개설.
- **참여 시스템**: 한 번의 클릭으로 모임 참여 및 취소.

### ✨ AI 기능 (AI Briefing)
- **일정 브리핑**: 오늘의 모임과 공개된 할 일을 요약하여 브리핑 제공.
- **맞춤 메시지**: 하루를 시작하는 응원 메시지와 일정 요약.
- **캐싱 최적화**: LocalStorage를 활용한 빠른 응답 속도.

---

## 3. 기술 스택 (Tech Stack)

### Frontend
- **Framework**: Next.js 16.1.6 (App Router)
- **Styling**: Tailwind CSS 4.x, shadcn/ui
- **Animation**: Framer Motion
- **Icons**: Lucide React

### Backend & AI
- **Backend/DB**: Supabase (PostgreSQL, Realtime, RLS)
- **Authentication**: Supabase Auth (Google OAuth 2.0)
- **AI**: Google Generative AI (Gemini) / Groq API

---

## 4. 프로젝트 구조 (Project Structure)

```text
meetplz-lab/
├── app/                  # Next.js App Router (Auth, Dashboard, API)
├── components/           # UI Components
│   ├── ui/               # shadcn/ui (Atomic Components)
│   └── domain/           # Business Logic Components (Tasks, Meetings, etc.)
├── lib/                  # Core Utilities & Logic
│   ├── actions/          # Server Actions (Data Mutations)
│   ├── supabase/         # Supabase Clients (Server, Client, Middleware)
│   └── utils/            # Shared Helper Functions
├── hooks/                # Custom React Hooks
├── types/                # TypeScript Definitions (Database, API)
├── docs/                 # Detailed Documentation & Specification
└── public/               # Static Assets
```

---

## 5. 시작하기 (Getting Started)

### 사전 준비 사항
- [Node.js](https://nodejs.org/) (v18+)
- [PNPM](https://pnpm.io/) (패키지 매니저)
- [Supabase Account](https://supabase.com/)

### 설치 및 실행
1. 저장소 클론 및 디렉토리 이동:
   ```bash
   git clone <repository-url>
   cd meetplz-lab
   ```

2. 의존성 설치:
   ```bash
   pnpm install
   ```

3. 환경 변수 설정 (`.env.local`)

4. 개발 서버 실행:
   ```bash
   pnpm dev
   ```

---

## 6. 보안 및 설계 원칙

- **Row Level Security (RLS)**: 모든 DB 테이블은 Supabase RLS를 통해 보호됩니다. 비공개 할 일은 작성자 본인 외에 절대 조회할 수 없습니다.
- **Server Components First**: 성능 최적화를 위해 기본적으로 서버 컴포넌트를 사용하며, 필요한 인터랙션만 클라이언트 컴포넌트로 분리합니다.
- **Optimistic UI**: 할 일 체크, 모임 참여 등의 액션은 사용자 경험을 위해 즉시 UI에 반영된 후 서버와 동기화됩니다.

---

## 7. 상세 문서 리스트

더 자세한 사양은 `docs/` 폴더 내의 문서들을 참고하세요.
- [제품 요구사항 정의서 (PRD)](./docs/PRD.md)
- [기술 명세서 (Tech Stack)](./docs/tech-stack.md)
- [데이터베이스 스키마 가이드](./docs/db-schema.md)
- [프로젝트 구조 상세](./docs/project-structure.md)
- [서비스 흐름도 (FLOW)](./docs/FLOW.md)
- [기능별 로직 가이드](./docs/functional_flow.md)

---

**최종 업데이트**: 2026-02-01
**Contact**: Your Name / Organization
