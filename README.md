# 🗓️ MeetPlz (모임플) - The NextGen Task & Social Hub

> **"모임과 할 일을 하나로!"** - 개인의 생산성과 소셜 활동을 하나의 대시보드에서 완벽하게 통합한 올인원 플랫폼입니다.

MeetPlz는 파편화된 일정 관리와 모임 모집의 번거로움을 해결하기 위해 탄생했습니다. 세련된 Discord 스타일 UI, 실시간 채팅, 그리고 강력한 AI 브리핑 기능을 통해 당신의 일상을 혁신합니다.

---

## ✨ 핵심 기능 (Key Features)

### 1. 📅 스마트 통합 대시보드
- **통합 일정 관리**: 개인의 투두 리스트(Personal Tasks)와 참여 중인 모각(Meetings) 일정을 하나의 캘린더에서 시각화합니다.
- **실시간 데이터 바인딩**: 월별 일정 조회 및 참여 여부에 따른 동적 캘린더 업데이트를 지원합니다.

### 2. 🤝 강력한 모임 관리 시스템
- **모집 및 참여**: 누구나 새로운 모임을 열고 모집할 수 있으며, 클릭 한 번으로 참여 및 취소가 가능합니다.
- **호스트 전담 도구**: 모임 개설자(방장)에게는 정보 수정, 삭제 등 전용 관리 UI가 제공됩니다.
- **참여자 채팅방**: 모임별로 개별 실시간 채팅방이 생성되어 원활한 소통을 지원합니다.

### 3. 💬 실시간 소셜 네트워크 (Discord Style)
- **실시간 채팅**: Supabase Realtime을 활용한 실시간 메시지 송수신으로 끊김 없는 대화를 유지합니다.
- **친구 시스템**: 유저 검색, 친구 요청/수락/거절 및 온라인 상태 표시 기능으로 내 인맥을 관리하세요.
- **반응형 사이드바**: Discord의 철학을 담은 수직 사이드 레일과 풀 익스패드 사이드바를 통해 모바일과 데스크톱 모두에서 최적의 UX를 제공합니다.

### 4. 🤖 맞춤형 AI 데일리 브리핑
- **멀티 AI 모델 지원**: Google Gemini 2.0 Flash와 Groq(Llama 3.3) 중 원하는 인공지능을 선택할 수 있습니다.
- **자동 요약**: 오늘 반드시 챙겨야 할 일정과 새로 올라온 모임 소식을 AI가 핵심만 요약하여 브리핑해 줍니다.

---

## 🛠️ 기술 리더십 (Tech Stack)

### 🏗️ 아키텍처
- **Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: TypeScript
- **UI/UX**: Tailwind CSS 4, Shadcn UI, Radix UI Primitives, Lucide Icons

### ☁️ 백엔드 인프라
- **Database / Auth**: Supabase (PostgreSQL, SSR Optimized)
- **Realtime**: Supabase Broadcast & Publication (Realtime Chat)
- **Middleware**: Edge-side Auth Protection & Redirects

### 🧠 인공지능 (AI Engine)
- **Library**: Vercel AI SDK
- **Models**: Gemini-1.5-Flash, Llama-3.3-70b-versatile

---

## 🚀 시작하기 (Quick Start)

### 1. 필수 환경 변수 설정
`.env.local` 파일을 생성하고 아래의 정보를 채워주세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# AI Providers
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
```

### 2. 설치 및 실행
```bash
npm install
npm run dev
```

---

## 📁 디렉토리 구조 (Structure)

- `app/actions/`: 타입 안정성을 갖춘 비즈니스 로직 (Server Actions)
- `components/domain/`: 도메인별 핵심 기능 컴포넌트 (`meetings/`, `friends/`, `calendar/`)
- `components/ui/`: 어토믹 디자인 기반의 공용 UI 컴포넌트
- `supabase/migrations/`: 데이터베이스 스키마 및 RLS 정책 버전 관리
- `lib/`: AI 가속기 및 Supabase 클라이언트 설정

---

## 📝 라이선스 및 기여
- **License**: MIT License
- **Author**: Antigravitiy & Collaborators

더 나은 모임 문화를 만드는 **MeetPlz**와 함께하세요! 🚀💙
