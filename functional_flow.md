# Functional Flow: Data Binding & Logic Implementation

이 문서는 UI 중심이 아닌 **데이터 흐름과 비즈니스 로직 중심**의 개발 가이드입니다. 
PRD와 FLOW.md에 명시된 요구사항을 바탕으로, **실제 코드로 구현해야 할 항목**을 상세히 나열했습니다.

## 🚀 Implementation Priority Summary (구현 순서 요약)

1.  **Phase 1: Foundation (기반)** - Auth, DB 연결, 공통 유틸리티
2.  **Phase 2: Core Logic (조회)** - 캘린더 Nav(월 이동), 할 일 조회, 모임 리스트
3.  **Phase 3: Interaction (상호작용)** - 모임 참여/개설, 할 일 관리(CRUD), 모임 취소, AI 브리핑
4.  **Phase 4: Expansion (확장)** - 실시간 채팅, 알림

---

## Phase 1: Foundation (기반 데이터 및 인증)
*가장 먼저 데이터베이스 연결과 사용자 식별 통로를 확보합니다.*

### 1-1. Supabase Client & SDK Setup
- **목표**: 서버/클라이언트/미들웨어 각각의 환경에 맞는 Supabase 인스턴스 생성.
- **Tech Spec**:
    - `lib/supabase/client.ts`: `createBrowserClient`
    - `lib/supabase/server.ts`: `createServerClient` (Cookie Store Handling)
    - `lib/supabase/middleware.ts`: Session Refresh Logic

### 1-2. Auth Logic Flow (Google OAuth)
- **목표**: 사용자를 로그인시키고 `auth.users` 테이블 세션을 확보.
- **FLOW.md Logic**: `User -> Login -> Auth -> Profile Upsert -> Session`
- **Data Flow**:
    1.  **Trigger**: 로그인 페이지 "Google Login" 버튼 클릭.
    2.  **Callback**: `app/auth/callback/route.ts` 라우트 핸들러 구현.
    3.  **Exchange**: Code -> Session 교환.
    4.  **Redirect**: 로그인 성공 시 `/my-schedule` 또는 원래 페이지로 이동.
    5.  **Middleware**: 비로그인 유저가 `/my-schedule` 접근 시 `/login`으로 강제 리다이렉트.

### 1-3. Global User Condition
- **목표**: 현재 로그인한 유저의 정보를 전역적으로 사용.
- **Data Flow**:
    1.  Root Layout (`layout.tsx`)에서 `getUser()` 호출.
    2.  Header 컴포넌트에 `user.user_metadata.avatar_url` 전달.

---

## Phase 2: Core Logic (핵심 데이터 조회)
*데이터를 가져와서 화면에 뿌려주는 'Read' 작업을 우선 완성합니다.*

### 2-1. Left Panel: My Schedule (Calendar & Tasks)
- **PRD Req**: 월 단위 캘린더 이동, 오늘 날짜 하이라이트.
- **Data Flow**:
    1.  **Navigation**: `?month=2026-01` 쿼리 파라미터 핸들링. (Next.js `searchParams`).
    2.  **Fetch**: Server Component에서 해당 월의 `personal_tasks` 조회 (`user_id` 기준).
    3.  **Filter**: `due_date` 기준으로 날짜별 그루핑.
    4.  **Render**: `Calendar` 위젯에 데이터 바인딩 & 날짜 클릭 시 선택 상태 활성화.

### 2-2. Right Panel: Open Meetings Feed
- **PRD Req**: 모집 중인 모임 최신순 정렬.
- **Data Flow**:
    1.  **Fetch**: Server Component에서 `meetings` 조회 (`status='recruiting'`).
    2.  **Render**: `MeetingCard` 리스트 렌더링.

---

## Phase 3: Interaction & Feedback (상호작용 및 상태 변경)
*Optimistic UI와 Server Actions를 활용해 사용자 입력을 처리합니다.*

### 3-0. Open Meeting Creation (모임 개설)
- **PRD Req**: 모임 생성 (제목, 날짜, 장소).
- **Data Flow**:
    1.  **Action**: `createMeeting` Server Action. (Form Data 수신).
    2.  **DB Write**: `meetings` 테이블 Insert (`host_id` = me).
    3.  **Feedback**: `revalidatePath('/meetings')`로 피드 즉시 갱신.
    4.  **UI**: 생성 성공 토스트 + 모달 닫기.

### 3-1. Join & Leave Meeting Strategy (모임 참여/취소)
- **FLOW.md Logic**: `Join Click -> DB Insert -> Trigger (Auto Task) -> UI Update`
- **Data Flow (Join)**:
    1.  **Action**: `joinMeeting(meetingId)` Server Action.
    2.  **Logic**: `participants` 테이블 Insert. (`Trigger`가 할 일 자동 생성)
    3.  **UI**: 버튼 "Joined"로 변경.
- **Data Flow (Leave/Cancel)**:
    1.  **Action**: `leaveMeeting(meetingId)` Server Action.
    2.  **Logic**: `participants` delete or status update. (`Trigger`가 할 일 자동 삭제)
    3.  **UI**: 버튼 "Join"으로 원복.

### 3-2. Task Management (CRUD & Optimistic)
- **PRD Req**: 할 일 생성/수정/삭제, 공개/비공개 토글.
- **Data Flow**:
    1.  **Create**: `createTask` Action. (UI: 리스트 즉시 추가).
    2.  **Toggle**: `toggleTaskPrivacy` Action. (UI: 아이콘 즉시 변경).
    3.  **Update**: `updateTaskContent` Action. (할 일 내용 수정).
    4.  **Delete**: `deleteTask` Action. (UI: 리스트에서 즉시 제거).

### 3-3. AI Briefing (Special Feature)
- **PRD Req**: 하루 1회 요약, 로컬 스토리지 캐싱, 타자 효과.
- **Logic Flow**:
    1.  **Click**: Header의 "AI Briefing" 버튼 클릭.
    2.  **Cache Check**: `localStorage.getItem('briefing_2026-01-29')`.
    3.  **Fetch (If miss)**: API Route 호출 -> 오늘 일정 조회 -> OpenAI/Gemini 요청.
    4.  **Save**: 응답 결과를 LocalStorage에 저장.
    5.  **Effect**: 텍스트가 한 글자씩 나오는 Typewriter 효과 적용.

---

## Phase 4: Expansion (Realtime Chat)
*채팅 기능은 Phase 2 확장이지만, 흐름상 미리 계획해 둡니다.*

### 4-1. Chat Room Entry (채팅방 진입)
- **목표**: 모임 참여 후 채팅방으로 이동.
- **Data Flow**:
    1.  **Redirect**: `joinMeeting` 성공 후 `/meetings/[id]/chat`으로 라우팅.
    2.  **Auth Check**: 해당 모임의 `participants`인지 검증 (RLS).

### 4-2. Realtime Messaging
- **목표**: 실시간 대화 송수신.
- **Data Flow**:
    1.  **Sub**: Supabase `realtime` 채널 구독 ('meeting:[id]').
    2.  **Send**: `sendMessage` Action -> `comments` 테이블 Insert.
    3.  **Receive**: `INSERT` 이벤트 수신 -> UI 메시지 리스트에 추가.

---

## Implementation Checklist

### Phase 1: Foundation (Auth & Env)
- [ ] 1-1. Environment Variables Check (`.env.local`)
- [ ] 1-2. Install Supabase SSR Packages
- [ ] 1-3. Implement `lib/supabase/client.ts`
- [ ] 1-4. Implement `lib/supabase/server.ts` (Cookie Logic)
- [ ] 1-5. Implement `lib/supabase/middleware.ts` & Root Middleware
- [ ] 1-6. Create Auth Callback Route (`app/auth/callback/route.ts`)
- [ ] 1-7. Implement Login Page UI & Logic (`signInWithOAuth`)
- [ ] 1-8. Verify User Profile Fetch in Root Layout

### Phase 2: Core Logic (Read)
- [ ] 2-1. Create `meetings` Server Action/Fetcher
- [ ] 2-2. Bind Data to `MeetingCard` Component
- [ ] 2-3. Create `personal_tasks` Server Action/Fetcher
- [ ] 2-4. Implement Calendar Navigation Logic (`?month=...`)
- [ ] 2-5. Implement Calendar View Data Binding
- [ ] 2-6. Verify RLS (Check if private tasks are hidden from others)

### Phase 3: Interaction (Write & AI)
- [ ] 3-0. Implement `createMeeting` Server Action (Publish)
- [ ] 3-1. Implement `joinMeeting` Server Action
- [ ] 3-2. Implement `leaveMeeting` (Cancel Participation) Server Action
- [ ] 3-3. Apply Optimistic UI for Join/Leave
- [ ] 3-4. Implement `createTask` Server Action
- [ ] 3-5. Implement `updateTaskContent` & `deleteTask` Server Actions
- [ ] 3-6. Implement `toggleTaskPrivacy` Server Action
- [ ] 3-7. Verify "Lock/Unlock" Icon State Logic
- [ ] 3-8. Create AI Briefing API Route (`app/api/briefing/route.ts`)
- [ ] 3-9. Implement AI Briefing UI (Cache Check + Typewriter Effect)

### Phase 4: Expansion (Chat)
- [ ] 4-1. Create Chat Room UI (`/meetings/[id]/chat`)
- [ ] 4-2. Implement `sendMessage` Server Action
- [ ] 4-3. Connect Supabase Realtime Subscription
