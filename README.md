# 🗓️ MeetPlz (모임플)
> **모임과 할 일을 하나로!** 생산성 대시보드와 소셜 네워킹의 결합.

MeetPlz는 파편화된 일정 관리와 모임 모집을 하나의 통합된 캘린더 대시보드에서 해결하는 서비스입니다. 디스코드에서 영감을 받은 세련된 UI와 AI 브리핑 기능을 통해 일상과 소통을 더 편리하게 관리하세요.

---

## ✨ 주요 기능

### 1. 통합 캘린더 대시보드
- **모임 & 할 일 시각화**: 내가 호스트인 모임, 참여 중인 모임, 개인적인 할 일을 하나의 캘린더에서 한눈에 확인합니다.
- **실시간 월간 이동**: 달력의 이전/다음 달 이동을 지원하며, 해당 월의 모든 일정을 즉시 불러옵니다.

### 2. 모임 관리 (Social Feed) 🤝
- **모임 모집 & 참여**: 누구나 새로운 모임을 열 수 있고, 관심 있는 모임에 즉시 '참여하기'를 눌러 합류할 수 있습니다.
- **방장 도구**: 모임 개설자는 정보를 수정하거나 삭제할 수 있는 관리 도구가 제공됩니다.
- **전용 채팅방**: 참여한 모임별로 실시간 소통이 가능한 전용 채팅방이 생성됩니다.

### 3. 디스코드 스타일 소셜 UI 🎨
- **수직 사이드 레일**: 고정된 사이드 레일을 통해 검색, 친구 목록 등에 즉각적으로 접근합니다.
- **친구 시스템**: 친구 검색, 요청, 수락 프로세스를 통해 내 인맥을 관리하고 온라인 상태를 확인하세요.
- **풀 익스팬드 사이드바**: 왼쪽에서 부드럽게 나타나는 전체 높이 사이드바 디자인으로 모바일 친화적인 경험을 제공합니다.

### 4. AI 일간 브리핑 🤖
- **Gemini & Groq 지원**: 다양한 AI 모델(Gemini 2.0, Llama 3 등)을 선택하여 오늘의 주요 일정과 모임 소식을 요약받으세요.
- **효율적인 요약**: 파편화된 정보를 AI가 분석하여 가장 중요한 일정부터 브리핑해 줍니다.

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS, Shadcn UI
- **Components**: Lucide React (Icons), Radix UI (Primitives)

### Backend & Database
- **Auth & DB**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime (Chat & Updates)
- **Logic**: Next.js Server Actions (Type-safe backend logic)

### AI Stack
- **Library**: Vercel AI SDK
- **Models**: Google Gemini 2.0 Flash, Groq (Llama 3.3 70B)

---

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone https://github.com/[your-username]/meetplz-lab.git
cd meetplz-lab
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 정보를 입력합니다:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### 4. 개발 서버 실행
```bash
npm run dev
```

---

## 📁 프로젝트 구조
- `app/`: Next.js App Router 페이지 및 서버 액션
- `components/`: 공유 UI 및 도메인별 컴포넌트 (`domain/`, `ui/`, `common/`)
- `lib/`: 유틸리티 및 Supabase 설정
- `supabase/`: 마이그레이션 파일 및 스키마 정보

---

## 📝 라이선스
MIT License. 자유롭게 사용하고 수정하세요!
