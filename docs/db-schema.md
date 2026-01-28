# meetplz 데이터베이스 스키마 가이드

> **문서 목적**: meetplz 프로젝트의 PostgreSQL 데이터베이스 스키마와 Row Level Security (RLS) 정책을 정의합니다.

---

## 1. 데이터베이스 개요

- **플랫폼**: Supabase (PostgreSQL)
- **인증**: Supabase Auth (Google OAuth)
- **보안**: Row Level Security (RLS) 활성화
- **확장성**: Realtime 구독 준비 (Phase 2)

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

-- 인덱스
CREATE INDEX idx_profiles_email ON profiles(email);

-- 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**RLS 정책**:
- **SELECT**: 자신의 프로필 또는 공개 프로필만 조회 가능
- **INSERT**: 인증된 사용자만 자신의 프로필 생성 가능
- **UPDATE**: 자신의 프로필만 수정 가능
- **DELETE**: 자신의 프로필만 삭제 가능

```sql
-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책 정의
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles"
  ON profiles FOR SELECT
  USING (true); -- 모든 사용자 프로필 조회 가능 (Phase 1)

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);
```

---

### 2.2 `personal_tasks` 테이블

개인 할 일 및 모임에서 자동 생성된 일정을 저장합니다.

```sql
CREATE TABLE personal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  due_date DATE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  source TEXT NOT NULL CHECK (source IN ('personal', 'meeting')),
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL, -- source='meeting'일 때만 사용
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_personal_tasks_user_id ON personal_tasks(user_id);
CREATE INDEX idx_personal_tasks_due_date ON personal_tasks(due_date);
CREATE INDEX idx_personal_tasks_is_public ON personal_tasks(is_public) WHERE is_public = true;
CREATE INDEX idx_personal_tasks_meeting_id ON personal_tasks(meeting_id) WHERE meeting_id IS NOT NULL;

-- 업데이트 시간 자동 갱신
CREATE TRIGGER update_personal_tasks_updated_at
  BEFORE UPDATE ON personal_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**RLS 정책**:
- **SELECT**: 
  - 자신의 할 일은 항상 조회 가능
  - `is_public = true`인 할 일은 모든 사용자 조회 가능
- **INSERT**: 자신의 할 일만 생성 가능
- **UPDATE**: 자신의 할 일만 수정 가능
- **DELETE**: 자신의 할 일만 삭제 가능

```sql
-- RLS 활성화
ALTER TABLE personal_tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책
CREATE POLICY "Users can view own tasks"
  ON personal_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public tasks"
  ON personal_tasks FOR SELECT
  USING (is_public = true);

-- INSERT 정책
CREATE POLICY "Users can insert own tasks"
  ON personal_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE 정책
CREATE POLICY "Users can update own tasks"
  ON personal_tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE 정책
CREATE POLICY "Users can delete own tasks"
  ON personal_tasks FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 2.3 `meetings` 테이블

모임 정보를 저장합니다.

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  meeting_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_meetings_host_id ON meetings(host_id);
CREATE INDEX idx_meetings_meeting_at ON meetings(meeting_at);
CREATE INDEX idx_meetings_created_at ON meetings(created_at DESC); -- 최신순 정렬용

-- 업데이트 시간 자동 갱신
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**RLS 정책**:
- **SELECT**: 모든 사용자가 모든 모임 조회 가능 (공개 모임)
- **INSERT**: 인증된 사용자만 모임 생성 가능
- **UPDATE**: 호스트만 수정 가능
- **DELETE**: 호스트만 삭제 가능

```sql
-- RLS 활성화
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- SELECT 정책 (모든 모임 공개)
CREATE POLICY "Anyone can view meetings"
  ON meetings FOR SELECT
  USING (true);

-- INSERT 정책
CREATE POLICY "Authenticated users can create meetings"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid() = host_id);

-- UPDATE 정책
CREATE POLICY "Hosts can update meetings"
  ON meetings FOR UPDATE
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- DELETE 정책
CREATE POLICY "Hosts can delete meetings"
  ON meetings FOR DELETE
  USING (auth.uid() = host_id);
```

---

### 2.4 `participants` 테이블

모임 참여자 정보를 저장합니다.

```sql
CREATE TABLE participants (
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'cancelled')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (meeting_id, user_id)
);

-- 인덱스
CREATE INDEX idx_participants_user_id ON participants(user_id);
CREATE INDEX idx_participants_meeting_id ON participants(meeting_id);
CREATE INDEX idx_participants_status ON participants(status);
```

**RLS 정책**:
- **SELECT**: 모든 사용자가 모든 참여 정보 조회 가능
- **INSERT**: 인증된 사용자만 자신의 참여 기록 생성 가능
- **UPDATE**: 자신의 참여 상태만 수정 가능
- **DELETE**: 자신의 참여 기록만 삭제 가능

```sql
-- RLS 활성화
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- SELECT 정책
CREATE POLICY "Anyone can view participants"
  ON participants FOR SELECT
  USING (true);

-- INSERT 정책
CREATE POLICY "Users can join meetings"
  ON participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE 정책
CREATE POLICY "Users can update own participation"
  ON participants FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE 정책
CREATE POLICY "Users can cancel participation"
  ON participants FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 3. 데이터 관계도 (ERD)

```
┌─────────────┐
│  profiles   │
│─────────────│
│ id (PK)     │
│ email       │
│ name        │
│ avatar_url  │
└──────┬──────┘
       │
       │ 1:N
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│personal_tasks│   │   meetings   │
│──────────────│   │──────────────│
│ id (PK)      │   │ id (PK)      │
│ user_id (FK) │   │ host_id (FK) │
│ content      │   │ title        │
│ due_date     │   │ meeting_at   │
│ is_public    │   │ location     │
│ source       │   └──────┬───────┘
│ meeting_id   │          │
└──────────────┘          │
                          │ 1:N
                          │
                          ▼
                  ┌──────────────┐
                  │ participants │
                  │──────────────│
                  │ meeting_id   │
                  │ user_id      │
                  │ status       │
                  │ (PK: both)   │
                  └──────────────┘
```

---

## 4. 핵심 비즈니스 로직

### 4.1 모임 참여 시 자동 할 일 생성

모임에 참여하면 `personal_tasks`에 자동으로 일정이 생성됩니다.

```sql
-- 함수: 모임 참여 시 할 일 자동 생성
CREATE OR REPLACE FUNCTION create_task_on_meeting_join()
RETURNS TRIGGER AS $$
BEGIN
  -- participants에 참여 기록이 생성되면
  -- personal_tasks에 자동으로 할 일 생성
  INSERT INTO personal_tasks (
    user_id,
    content,
    due_date,
    is_public,
    source,
    meeting_id
  )
  SELECT
    NEW.user_id,
    m.title,
    m.meeting_at::DATE,
    false, -- 기본값: 비공개
    'meeting',
    NEW.meeting_id
  FROM meetings m
  WHERE m.id = NEW.meeting_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER trigger_create_task_on_join
  AFTER INSERT ON participants
  FOR EACH ROW
  WHEN (NEW.status = 'joined')
  EXECUTE FUNCTION create_task_on_meeting_join();
```

### 4.2 모임 취소 시 할 일 삭제

모임 참여를 취소하면 관련 할 일도 삭제됩니다.

```sql
-- 함수: 모임 취소 시 할 일 삭제
CREATE OR REPLACE FUNCTION delete_task_on_meeting_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- status가 'cancelled'로 변경되면 할 일 삭제
  IF NEW.status = 'cancelled' THEN
    DELETE FROM personal_tasks
    WHERE meeting_id = NEW.meeting_id
      AND user_id = NEW.user_id
      AND source = 'meeting';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER trigger_delete_task_on_cancel
  AFTER UPDATE ON participants
  FOR EACH ROW
  WHEN (OLD.status = 'joined' AND NEW.status = 'cancelled')
  EXECUTE FUNCTION delete_task_on_meeting_cancel();
```

---

## 5. 보안 고려사항

### 5.1 RLS 정책 검증 체크리스트

- [x] 모든 테이블에 RLS 활성화
- [x] `auth.uid()`를 사용한 사용자 식별
- [x] 공개 데이터와 비공개 데이터 명확히 구분
- [x] INSERT/UPDATE 시 `WITH CHECK` 절 사용
- [x] CASCADE 삭제 정책 적절히 설정

### 5.2 데이터 무결성

- **외래 키 제약**: 모든 FK 관계에 CASCADE 또는 SET NULL 설정
- **체크 제약**: `status`, `source` 등 enum 값 검증
- **NOT NULL**: 필수 필드 명시

---

## 6. 성능 최적화

### 6.1 인덱스 전략

- **조회 패턴 기반 인덱스**:
  - `personal_tasks`: `user_id`, `due_date`, `is_public`
  - `meetings`: `meeting_at`, `created_at`
  - `participants`: `meeting_id`, `user_id`

### 6.2 쿼리 최적화 팁

```sql
-- ✅ 효율적인 쿼리: 인덱스 활용
SELECT * FROM personal_tasks
WHERE user_id = $1 AND due_date = $2;

-- ✅ 공개 할 일 조회: 인덱스 활용
SELECT * FROM personal_tasks
WHERE is_public = true AND due_date >= CURRENT_DATE;

-- ⚠️ 비효율적: 전체 스캔 가능
SELECT * FROM personal_tasks
WHERE content LIKE '%keyword%'; -- 인덱스 사용 불가
```

---

## 7. Phase 2 확장 계획

### 7.1 추가 테이블 (Phase 2)

```sql
-- 투표 기반 일정 조율
CREATE TABLE meeting_votes (
  meeting_id UUID REFERENCES meetings(id),
  user_id UUID REFERENCES profiles(id),
  preferred_time TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (meeting_id, user_id, preferred_time)
);

-- 댓글/채팅
CREATE TABLE meeting_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id),
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 알림
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.2 Realtime 구독

```sql
-- Realtime 활성화 (Phase 2)
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_comments;
```

---

## 8. 마이그레이션 가이드

### 8.1 초기 스키마 생성

1. Supabase Dashboard에서 SQL Editor 열기
2. 위의 모든 `CREATE TABLE` 문 실행
3. RLS 정책 적용
4. 트리거 및 함수 생성

### 8.2 타입 자동 생성

```bash
# Supabase CLI로 타입 생성
npx supabase gen types typescript --project-id <project-id> > types/database.ts
```

---

## 9. 참고 자료

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

**최종 업데이트**: 2026-01-28
**문서 버전**: 1.0.0
