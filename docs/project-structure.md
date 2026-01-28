# meetplz 프로젝트 구조

> **생성일**: 2026-01-28  
> **Next.js 버전**: 16.1.6 (App Router)  
> **프로젝트 상태**: 초기 구조 설정 완료

---

## 📁 폴더 구조

```
meetplz/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route Group: 인증 (URL에 포함 안됨)
│   │   ├── login/
│   │   │   └── page.tsx          # Google OAuth 로그인 페이지
│   │   └── callback/
│   │       └── page.tsx          # OAuth 콜백 처리
│   │
│   ├── (dashboard)/              # Route Group: 대시보드 (인증 필요)
│   │   ├── layout.tsx            # 대시보드 레이아웃 (Split View)
│   │   └── page.tsx              # 메인 대시보드
│   │
│   ├── api/                      # API Routes
│   │   └── ai/
│   │       └── briefing/
│   │           └── route.ts      # AI Briefing API
│   │
│   ├── layout.tsx                # Root Layout
│   ├── page.tsx                  # 루트 페이지 (redirect)
│   └── globals.css               # 전역 스타일
│
├── components/
│   ├── ui/                       # shadcn/ui 공유 컴포넌트
│   │   └── .gitkeep              # shadcn 컴포넌트 설치 위치
│   │
│   └── domain/                   # 비즈니스 로직 컴포넌트
│       ├── auth/
│       │   ├── login-button.tsx
│       │   └── user-avatar.tsx
│       │
│       ├── calendar/
│       │   ├── calendar-view.tsx
│       │   ├── date-picker.tsx
│       │   └── calendar-cell.tsx
│       │
│       ├── tasks/
│       │   ├── task-list.tsx
│       │   ├── task-item.tsx
│       │   ├── task-form.tsx
│       │   └── privacy-toggle.tsx
│       │
│       ├── meetings/
│       │   ├── meeting-feed.tsx
│       │   ├── meeting-card.tsx
│       │   ├── meeting-form.tsx
│       │   └── join-button.tsx
│       │
│       └── ai-briefing/
│           ├── briefing-button.tsx
│           └── briefing-dialog.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # 클라이언트 Supabase 클라이언트
│   │   ├── server.ts              # 서버 Supabase 클라이언트
│   │   └── middleware.ts          # 미들웨어용 클라이언트
│   │
│   ├── actions/                   # Server Actions
│   │   ├── auth.ts                # 인증 관련 액션
│   │   ├── tasks.ts               # 할 일 CRUD
│   │   ├── meetings.ts            # 모임 CRUD
│   │   └── ai-briefing.ts         # AI 브리핑 생성
│   │
│   ├── utils/
│   │   ├── cn.ts                  # className 유틸 (shadcn)
│   │   ├── date.ts                # 날짜 유틸리티
│   │   └── storage.ts             # LocalStorage 유틸
│   │
│   └── constants/
│       ├── routes.ts              # 라우트 상수
│       └── config.ts              # 앱 설정
│
├── hooks/                        # 커스텀 훅
│   ├── use-auth.ts               # 인증 상태 관리
│   ├── use-tasks.ts              # 할 일 데이터 훅
│   ├── use-meetings.ts           # 모임 데이터 훅
│   ├── use-ai-briefing.ts        # AI 브리핑 훅
│   └── use-optimistic-update.ts  # Optimistic UI 훅
│
├── types/                        # TypeScript 타입 정의
│   ├── database.ts               # Supabase DB 타입 (자동 생성 예정)
│   ├── api.ts                    # API 응답 타입
│   └── index.ts                  # 공통 타입
│
├── docs/                         # 문서
│   ├── tech-stack.md             # 기술 명세서
│   ├── db-schema.md              # DB 스키마 가이드
│   └── project-structure.md      # 프로젝트 구조 (본 문서)
│
└── [기존 파일들]
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── PRD.md
    └── FLOW.md
```

---

## 🎯 설계 원칙

### 1. **Route Groups 활용**
- `(auth)`, `(dashboard)`: URL 구조와 파일 구조 분리
- 인증 필요 여부에 따른 레이아웃 분리

### 2. **컴포넌트 계층 분리**
- `components/ui/`: 재사용 가능한 순수 UI 컴포넌트
- `components/domain/`: 비즈니스 로직이 포함된 도메인 컴포넌트

### 3. **Server Actions 중앙화**
- `lib/actions/`: 모든 데이터 변경 로직 집중 관리
- RLS 정책 준수 및 에러 핸들링 통일

### 4. **타입 안정성**
- `types/`: 모든 타입 정의 중앙화
- Supabase 타입 자동 생성 활용

### 5. **재사용성 최대화**
- 커스텀 훅으로 로직 캡슐화
- 유틸리티 함수 모듈화

---

## 📋 다음 단계

### 1. 의존성 설치
```bash
# Supabase 클라이언트
pnpm add @supabase/supabase-js @supabase/ssr

# shadcn/ui 설정
npx shadcn@latest init

# 필요한 shadcn 컴포넌트 추가
npx shadcn@latest add button card calendar dialog

# 기타 라이브러리
pnpm add lucide-react framer-motion
```

### 2. 환경 변수 설정
`.env.local` 파일 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase 타입 생성
```bash
npx supabase gen types typescript --project-id <project-id> > types/database.ts
```

### 4. 데이터베이스 스키마 생성
`docs/db-schema.md`의 SQL 스크립트를 Supabase Dashboard에서 실행

### 5. 기본 구현 시작
1. `lib/supabase/` 클라이언트 설정
2. `app/(auth)/login/page.tsx` 구현
3. `app/(dashboard)/layout.tsx` 구현
4. 각 도메인 컴포넌트 순차 구현

---

## 📚 참고 문서

- [기술 명세서](./tech-stack.md)
- [데이터베이스 스키마](./db-schema.md)
- [PRD](../PRD.md)
- [FLOW](../FLOW.md)

---

**최종 업데이트**: 2026-01-28
