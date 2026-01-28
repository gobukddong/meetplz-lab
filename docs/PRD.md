# meetplz 제품 요구사항 정의서 (PRD)

> **문서 목적**
> 본 문서는 v0에서 생성된 초기 UI 코드 결과물을 기준으로, 이를 실제 서비스로 발전시키기 위한 **개발 착수용(Product-Ready) PRD**이다.
> UI 스켈레톤은 v0 결과물을 최대한 활용하되, 데이터·로직·보안·확장성 측면에서 반드시 보완해야 할 요구사항을 명확히 정의한다.

---

## 1. 서비스 개요 (Overview)

### 1.1 서비스 정의

* **서비스명**: meetplz
* **한 줄 정의**:

  > 나만의 일정은 단단하게 관리하고, 공유는 선택적으로 — 모임과 할 일을 하나의 캘린더에서 관리하는 소셜 생산성 앱

### 1.2 핵심 가치

1. **Personal First**: 개인 일정과 프라이버시를 최우선으로 설계
2. **No Friction Social**: 확정된 일정 기반의 간단한 모임 참여
3. **Visual Productivity**: 한 화면에서 오늘의 모든 맥락을 파악

### 1.3 타겟 사용자

* Notion / Todoist / Google Calendar에 익숙한 사용자
* 일정은 혼자 관리하지만, 필요할 때만 공유하고 싶은 사용자
* 가벼운 소셜 연결을 선호하는 Z세대 및 직장인

---

## 2. 기술 스택 (Tech Stack)

### 2.1 Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* lucide-react
* Framer Motion

### 2.2 Backend

* Supabase

  * Auth (OAuth)
  * PostgreSQL DB
  * Realtime
  * Row Level Security (RLS)

### 2.3 AI

* OpenAI 또는 Gemini API
* Supabase Edge Functions

---

## 3. 전체 UX 구조 (v0 결과물 기준)

### 3.1 메인 대시보드 레이아웃

* **Split View (50:50)**
* **Full Height (h-screen)**

```
┌─────────────────────────────────────────┐
│ Header: meetplz | Avatar | AI Briefing │
├───────────────┬────────────────────────┤
│ My Schedule   │ Open Meetings           │
│ (Calendar)    │ (Social Feed)           │
│               │                          │
│ Daily Tasks   │ Meeting Cards           │
└───────────────┴────────────────────────┘
```

---

## 4. 기능 요구사항 (Functional Requirements)

## 4.1 인증 (Auth)

### 기능 설명

* Google OAuth 기반 로그인
* 로그인 시 자동 프로필 생성

### 요구사항

* 로그인 성공 시 `profiles` 테이블에 사용자 정보 upsert
* 비로그인 사용자는 서비스 접근 불가 (Phase 1 기준)

---

## 4.2 My Schedule (개인 캘린더 & 할 일)

### 4.2.1 캘린더

* 월 단위 캘린더 제공
* 오늘 날짜 하이라이트
* 날짜별 상태 표시

  * 🟣 모임 있음
  * ⚪ 개인 할 일만 있음

### 4.2.2 개인 할 일 (Personal Tasks)

#### UI (v0 기준)

* 체크박스
* 텍스트 내용
* 공개/비공개 토글 (Lock / Unlock 아이콘)

#### 기능 요구사항

* 할 일 CRUD 가능
* 기본값: 비공개
* 공개 시 친구/타인 조회 가능

#### 보안 요구사항 (Critical)

* `is_public = false` → 작성자만 조회 가능
* `is_public = true` → 전체 조회 가능
* 모든 접근은 RLS로 제어

---

## 4.3 Open Meetings (모임 모집)

### 4.3.1 모임 게시글

#### UI (v0 기준)

* 카드 형태
* 제목, 날짜/시간, 장소
* Host Avatar
* Join 버튼

#### 기능 요구사항

* 모임 생성
* 확정된 날짜/시간만 허용 (Phase 1)
* 피드에서 최신/임박 순 정렬

### 4.3.2 모임 참여 (Join)

#### 핵심 로직

* Join 클릭 시:

  1. `participants` 테이블에 참여 기록 생성
  2. 개인 캘린더에 해당 일정 자동 등록 (`personal_tasks` 생성)

---

## 4.4 AI Briefing

### 기능 설명

* 하루 일정 요약 + 응원 메시지 제공

### 트리거

* Header의 "AI Briefing" 버튼 클릭
* 하루 최초 1회

### 로직

1. 오늘의 모임 + 공개 할 일 조회
2. LLM 요약 요청
3. 결과 LocalStorage 캐싱

---

## 5. 데이터 모델링 (DB Schema)

### 5.1 profiles

* id (uuid, PK)
* email
* name
* avatar_url

### 5.2 personal_tasks

* id (uuid, PK)
* user_id (FK)
* content
* due_date
* is_public (boolean)
* source (personal | meeting)

### 5.3 meetings

* id (uuid, PK)
* title
* description
* meeting_at
* location
* host_id (FK)

### 5.4 participants

* meeting_id (PK, FK)
* user_id (PK, FK)
* status (joined / cancelled)

---

## 6. 비기능 요구사항

* 모든 주요 액션은 Optimistic UI 적용
* Supabase Realtime 확장 가능 구조 유지
* v0에서 생성된 컴포넌트는 UI 레이어로만 사용
* 비즈니스 로직은 Server Action / Edge Function으로 분리

---

## 7. 범위 정의 (Scope)

### Phase 1 (MVP)

* 인증
* 캘린더 & 개인 할 일
* 모임 모집 & 참여
* AI 브리핑

### Phase 2 (확장)

* 투표 기반 일정 조율
* 실시간 채팅
* 알림
* 테마 컬러 커스터마이징

---

## 8. 성공 기준 (Success Metrics)

* 첫 로그인 후 5분 내 첫 할 일 생성
* 모임 Join → 캘린더 반영 성공률 99%
* AI 브리핑 재사용률 1일 1회 이상

---

## 9. 결론

v0에서 생성된 코드는 **UI 설계의 출발점**이며, 본 PRD는 이를 **실제 서비스로 전환하기 위한 기준 문서**이다.
이 문서에 정의된 요구사항을 충족하지 않는 구현은 PRD 미준수로 간주한다.
