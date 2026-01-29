# meetplz 데이터베이스 스키마 가이드

> **문서 목적**: meetplz 프로젝트의 PostgreSQL 데이터베이스 스키마와 Row Level Security (RLS) 정책을 정의합니다. (Phase 1 MVP)

---

## 1. 데이터베이스 개요

- **플랫폼**: Supabase (PostgreSQL)
- **인증**: Supabase Auth (Google OAuth)
- **보안**: Row Level Security (RLS) 활성화
- **주요 변경사항**:
  - `meetings`: `status` 컬럼 추가
  - `personal_tasks`: `is_completed` 컬럼 추가, `source` ENUM 적용
  - `participants`: `status` ENUM 적용

---

## 2. 테이블 스키마

### 2.1 `profiles` 테이블

사용자 프로필 정보를 저장합니다.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS 정책**:
- 본인 및 전체 공개 조회 가능
- 본인만 수정 가능

---

### 2.2 `meetings` 테이블

모임 정보를 저장합니다.

```sql
CREATE TYPE meeting_status AS ENUM ('recruiting', 'confirmed', 'completed', 'cancelled');

CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  meeting_at TIMESTAMPTZ NOT NULL,
  status meeting_status NOT NULL DEFAULT 'recruiting',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Index**: `host_id`, `meeting_at`, `status`

**RLS 정책**:
- 누구나 조회 가능 (공개)
- 인증된 사용자 생성 가능
- 호스트만 수정/삭제 가능

---

### 2.3 `participants` 테이블

모임 참여자 정보를 저장합니다.

```sql
CREATE TYPE participation_status AS ENUM ('joined', 'cancelled');

CREATE TABLE participants (
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status participation_status NOT NULL DEFAULT 'joined',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (meeting_id, user_id)
);
```

**RLS 정책**:
- 누구나 조회 가능
- 본인만 참여/취소 가능

---

### 2.4 `personal_tasks` 테이블

개인 할 일 및 모임에서 자동 생성된 일정을 저장합니다.

```sql
CREATE TYPE task_source AS ENUM ('personal', 'meeting');

CREATE TABLE personal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  due_date DATE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  source task_source NOT NULL DEFAULT 'personal',
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS 정책**:
- 본인 조회 가능
- `is_public=true`인 경우 타인 조회 가능
- 본인만 생성/수정/삭제

---

## 3. 핵심 비즈니스 로직 (트리거)

1.  **모임 참여 시 자동 할 일 생성**:
    - `participants`에 INSERT 발생 시 `personal_tasks`에 `source='meeting'`으로 일정 자동 등록.
2.  **모임 취소 시 할 일 자동 삭제**:
    - `participants` 상태가 `cancelled`로 변경되면 해당 `personal_tasks` 삭제.

---

## 4. 적용 방법

1.  Supabase Dashboard > SQL Editor 접속
2.  `lib/supabase/schema.sql` 파일의 내용을 복사하여 실행
3.  성공 메시지 확인

---

**최종 업데이트**: 2026-01-29
**문서 버전**: 1.1.0 (MVP Confirmed)
