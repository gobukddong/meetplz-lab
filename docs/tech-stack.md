# meetplz 기술 명세서

> **문서 목적**: meetplz 프로젝트에서 사용되는 기술 스택, 라이브러리, 그리고 컴포넌트 설계 원칙을 정의합니다.

---

## 1. 기술 스택 개요

### 1.1 Frontend Framework
- **Next.js 16.1.6** (App Router)
  - Server Components 기본 사용
  - Server Actions로 데이터 변경 처리
  - Route Groups를 활용한 구조화된 라우팅

### 1.2 언어 및 타입 시스템
- **TypeScript 5.x**
  - 엄격한 타입 체크 활성화
  - Supabase 타입 자동 생성 활용

### 1.3 스타일링
- **Tailwind CSS 4.x**
  - 유틸리티 퍼스트 접근
  - 커스텀 디자인 토큰 활용
- **CSS Variables**
  - 다크모드 지원 준비 (Phase 2)

---

## 2. 주요 라이브러리

### 2.1 UI 컴포넌트
- **shadcn/ui**
  - 접근성과 커스터마이징에 최적화된 컴포넌트 라이브러리
  - `components/ui/`에 설치된 컴포넌트만 사용
  - 설치 위치: `components/ui/`

### 2.2 아이콘
- **lucide-react**
  - 일관된 아이콘 세트
  - 트리 쉐이킹 지원

### 2.3 애니메이션
- **Framer Motion**
  - Optimistic UI 전환 효과
  - AI Briefing 타자 효과
  - 페이지 전환 애니메이션

### 2.4 백엔드 서비스
- **Supabase**
  - **Auth**: Google OAuth
  - **PostgreSQL**: 메인 데이터베이스
  - **Realtime**: 실시간 업데이트 (Phase 2)
  - **Row Level Security (RLS)**: 데이터 보안

### 2.5 AI 통합
- **OpenAI API** 또는 **Gemini API**
  - AI Briefing 생성
  - Supabase Edge Functions로 래핑

---

## 3. 컴포넌트 설계 원칙

### 3.1 컴포넌트 계층 구조

```
components/
├── ui/              # 재사용 가능한 기본 UI 컴포넌트 (shadcn/ui)
└── domain/          # 비즈니스 로직이 포함된 도메인 컴포넌트
```

#### `components/ui/`
- **목적**: 순수 UI 컴포넌트, 비즈니스 로직 없음
- **특징**:
  - Props로 데이터를 받아서 표시만 함
  - 재사용 가능한 범용 컴포넌트
  - shadcn/ui 기반
- **예시**: `Button`, `Card`, `Calendar`, `Dialog`

#### `components/domain/`
- **목적**: 특정 도메인(할 일, 모임 등)에 특화된 컴포넌트
- **특징**:
  - Server Actions 또는 커스텀 훅 사용
  - 비즈니스 로직 포함
  - 도메인별로 폴더 분리
- **예시**: `TaskList`, `MeetingCard`, `BriefingDialog`

### 3.2 컴포넌트 작성 규칙

#### Server Components 우선
```typescript
// ✅ 권장: Server Component
export default async function TaskList() {
  const tasks = await getTasks();
  return <div>{/* ... */}</div>;
}

// ⚠️ 필요한 경우만: Client Component
'use client';
export function TaskForm() {
  // 폼 상태 관리 등
}
```

#### Props 타입 명시
```typescript
// ✅ 명시적 타입 정의
interface TaskItemProps {
  task: Task;
  onTogglePrivacy: (id: string) => void;
}

export function TaskItem({ task, onTogglePrivacy }: TaskItemProps) {
  // ...
}
```

#### 컴포넌트 분리 기준
- **분리하는 경우**:
  - 재사용 가능성이 높을 때
  - 복잡도가 높아 테스트가 필요할 때
  - 독립적인 상태 관리가 필요할 때

- **분리하지 않는 경우**:
  - 한 곳에서만 사용되는 단순 컴포넌트
  - 과도한 Props drilling이 발생할 때

---

## 4. 데이터 페칭 전략

### 4.1 Server Actions
- **위치**: `lib/actions/`
- **용도**: 데이터 변경 (CREATE, UPDATE, DELETE)
- **규칙**:
  - `'use server'` 디렉티브 필수
  - 에러 핸들링 포함
  - RLS 정책 준수

```typescript
// lib/actions/tasks.ts
'use server';

export async function createTask(data: CreateTaskInput) {
  const supabase = createServerClient();
  // RLS 검증
  // 데이터 삽입
  // 에러 처리
}
```

### 4.2 Server Components에서 직접 조회
- **용도**: 초기 데이터 로드
- **규칙**:
  - Server Component에서 직접 Supabase 클라이언트 사용
  - 캐싱 전략 적용

```typescript
// app/(dashboard)/page.tsx
export default async function DashboardPage() {
  const tasks = await getTasks();
  const meetings = await getMeetings();
  // ...
}
```

### 4.3 커스텀 훅 (Client Components)
- **위치**: `hooks/`
- **용도**: 클라이언트 사이드 상태 관리 및 실시간 업데이트
- **예시**: `useTasks`, `useMeetings`

---

## 5. 상태 관리

### 5.1 서버 상태
- **Server Components**: 초기 데이터
- **Server Actions**: 데이터 변경

### 5.2 클라이언트 상태
- **React Hooks**: `useState`, `useReducer`
- **커스텀 훅**: 도메인별 상태 로직 캡슐화

### 5.3 Optimistic UI
- **전략**: 모든 주요 액션에 적용
- **구현**: `hooks/use-optimistic-update.ts` 활용

```typescript
// 예시: 할 일 생성 시 즉시 UI 반영
const { mutate } = useOptimisticUpdate({
  onMutate: (newTask) => {
    // 즉시 UI 업데이트
  },
  onSuccess: () => {
    // 서버 응답 후 동기화
  },
});
```

---

## 6. 타입 관리

### 6.1 데이터베이스 타입
- **생성**: Supabase CLI로 자동 생성
- **위치**: `types/database.ts`
- **사용**: 모든 DB 쿼리에서 타입 안정성 보장

```typescript
import type { Database } from '@/types/database';

type Task = Database['public']['Tables']['personal_tasks']['Row'];
```

### 6.2 API 타입
- **위치**: `types/api.ts`
- **용도**: Server Actions 입력/출력 타입

### 6.3 공통 타입
- **위치**: `types/index.ts`
- **용도**: 앱 전반에서 사용되는 공통 타입

---

## 7. 보안 원칙

### 7.1 인증
- **Supabase Auth**: 모든 보호된 라우트에서 세션 검증
- **미들웨어**: `middleware.ts`에서 인증 체크

### 7.2 데이터 보안
- **RLS (Row Level Security)**: 모든 테이블에 정책 적용
- **서버 사이드 검증**: Client에서 받은 데이터 재검증

### 7.3 환경 변수
- **`.env.local`**: 로컬 개발용
- **`.env.example`**: 팀 공유용 (민감 정보 제외)

---

## 8. 성능 최적화

### 8.1 이미지 최적화
- **Next.js Image**: 자동 최적화 활용

### 8.2 번들 크기
- **Dynamic Import**: 필요시에만 로드
- **Tree Shaking**: 사용하지 않는 코드 제거

### 8.3 캐싱
- **AI Briefing**: LocalStorage 캐싱
- **Supabase 쿼리**: 적절한 캐싱 전략 적용

---

## 9. 개발 워크플로우

### 9.1 코드 스타일
- **ESLint**: Next.js 기본 설정 사용
- **Prettier**: (선택사항) 일관된 포맷팅

### 9.2 Git 전략
- **브랜치**: `main`, `develop`, `feature/*`
- **커밋 메시지**: Conventional Commits 권장

### 9.3 테스트 (Phase 2)
- **단위 테스트**: Jest + React Testing Library
- **E2E 테스트**: Playwright (선택사항)

---

## 10. 확장성 고려사항

### 10.1 Phase 2 준비
- **Realtime**: Supabase Realtime 구독 구조 준비
- **알림**: 알림 시스템 확장 가능한 구조
- **다크모드**: CSS Variables 기반 테마 시스템

### 10.2 모니터링 (Phase 2)
- **에러 추적**: Sentry 또는 유사 서비스
- **애널리틱스**: 사용자 행동 분석

---

## 11. 참고 자료

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**최종 업데이트**: 2026-01-28
**문서 버전**: 1.0.0
