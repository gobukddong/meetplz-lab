-- Consolidated Migration: Schema + Seed Data
-- 20260129000000_full_schema_and_seed.sql

-- ==========================================
-- SECTION 0: CLEANUP (Reset)
-- ==========================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
DROP TRIGGER IF EXISTS update_personal_tasks_updated_at ON personal_tasks;
DROP TRIGGER IF EXISTS trigger_create_task_on_join ON participants;
DROP TRIGGER IF EXISTS trigger_delete_task_on_cancel ON participants;

DROP TABLE IF EXISTS personal_tasks CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS task_source CASCADE;
DROP TYPE IF EXISTS participation_status CASCADE;
DROP TYPE IF EXISTS meeting_status CASCADE;

-- ==========================================
-- SECTION 1: SCHEMA DEFINITION (Migrations 00-05)
-- ==========================================

-- 1. Helper Function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Enums
CREATE TYPE meeting_status AS ENUM ('recruiting', 'confirmed', 'completed', 'cancelled');
CREATE TYPE participation_status AS ENUM ('joined', 'cancelled');
CREATE TYPE task_source AS ENUM ('personal', 'meeting');

-- 3. Tables

-- 3.1 Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_profiles_email ON profiles(email);

-- 3.2 Meetings
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

CREATE TRIGGER update_meetings_updated_at 
BEFORE UPDATE ON meetings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_meetings_host_id ON meetings(host_id);
CREATE INDEX idx_meetings_meeting_at ON meetings(meeting_at);
CREATE INDEX idx_meetings_status ON meetings(status);

-- 3.3 Participants
CREATE TABLE participants (
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status participation_status NOT NULL DEFAULT 'joined',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (meeting_id, user_id)
);

CREATE INDEX idx_participants_meeting_id ON participants(meeting_id);
CREATE INDEX idx_participants_user_id ON participants(user_id);

-- 3.4 Personal Tasks
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

CREATE TRIGGER update_personal_tasks_updated_at 
BEFORE UPDATE ON personal_tasks 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_personal_tasks_user_id ON personal_tasks(user_id);
CREATE INDEX idx_personal_tasks_due_date ON personal_tasks(due_date);
CREATE INDEX idx_personal_tasks_is_public ON personal_tasks(is_public) WHERE is_public = true;

-- 4. Logic Triggers

-- Auto-Create Task on Join
CREATE OR REPLACE FUNCTION create_task_on_meeting_join()
RETURNS TRIGGER AS $$
BEGIN
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
    false,
    'meeting',
    NEW.meeting_id
  FROM meetings m
  WHERE m.id = NEW.meeting_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_task_on_join
  AFTER INSERT ON participants
  FOR EACH ROW
  WHEN (NEW.status = 'joined')
  EXECUTE FUNCTION create_task_on_meeting_join();

-- Auto-Delete Task on Cancel
CREATE OR REPLACE FUNCTION delete_task_on_meeting_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' THEN
    DELETE FROM personal_tasks
    WHERE meeting_id = NEW.meeting_id
      AND user_id = NEW.user_id
      AND source = 'meeting';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_delete_task_on_cancel
  AFTER UPDATE ON participants
  FOR EACH ROW
  WHEN (OLD.status = 'joined' AND NEW.status = 'cancelled')
  EXECUTE FUNCTION delete_task_on_meeting_cancel();

-- 5. RLS Policies

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Meetings RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view meetings" ON meetings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create meetings" ON meetings FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update meetings" ON meetings FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete meetings" ON meetings FOR DELETE USING (auth.uid() = host_id);

-- Participants RLS
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Users can join meetings" ON participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can cancel participation" ON participants FOR DELETE USING (auth.uid() = user_id);

-- Personal Tasks RLS
ALTER TABLE personal_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks" ON personal_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public tasks" ON personal_tasks FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own tasks" ON personal_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON personal_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON personal_tasks FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- SECTION 2: SEED DATA
-- ==========================================

DO $$
DECLARE
  v_user1 UUID := '11111111-1111-1111-1111-111111111111';
  v_user2 UUID := '22222222-2222-2222-2222-222222222222';
  v_user3 UUID := '33333333-3333-3333-3333-333333333333';
  v_user4 UUID := '44444444-4444-4444-4444-444444444444';
  v_user5 UUID := '55555555-5555-5555-5555-555555555555';
  
  v_meeting1 UUID := gen_random_uuid();
  v_meeting2 UUID := gen_random_uuid();
  v_meeting3 UUID := gen_random_uuid();
  v_meeting4 UUID := gen_random_uuid();
  v_meeting5 UUID := gen_random_uuid();
  v_meeting6 UUID := gen_random_uuid();
  v_meeting7 UUID := gen_random_uuid();
  v_meeting8 UUID := gen_random_uuid();
  v_meeting9 UUID := gen_random_uuid();
  v_meeting10 UUID := gen_random_uuid();

BEGIN
  -- 1. Insert into auth.users
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    ('00000000-0000-0000-0000-000000000000', v_user1, 'authenticated', 'authenticated', 'chulsu@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"김철수"}', NOW(), NOW(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', v_user2, 'authenticated', 'authenticated', 'younghee@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"이영희"}', NOW(), NOW(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', v_user3, 'authenticated', 'authenticated', 'jimin@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"박지민"}', NOW(), NOW(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', v_user4, 'authenticated', 'authenticated', 'minjun@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"최민준"}', NOW(), NOW(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', v_user5, 'authenticated', 'authenticated', 'seo-yeon@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"정서연"}', NOW(), NOW(), '', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Insert into profiles
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES
    (v_user1, 'chulsu@test.com', '김철수', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'),
    (v_user2, 'younghee@test.com', '이영희', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka'),
    (v_user3, 'jimin@test.com', '박지민', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jimin'),
    (v_user4, 'minjun@test.com', '최민준', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minjun'),
    (v_user5, 'seo-yeon@test.com', '정서연', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seoyeon')
  ON CONFLICT (id) DO NOTHING;

  -- 3. Insert Meetings
  INSERT INTO public.meetings (id, host_id, title, description, location, meeting_at, status)
  VALUES
    (v_meeting1, v_user1, '주말 강남역 코딩 스터디', 'Next.js 15 버전 같이 공부하실 분 구합니다. 초보자 환영!', '강남역 11번 출구 할리스', NOW() + INTERVAL '2 days', 'recruiting'),
    (v_meeting2, v_user2, '한강 러닝 크루 모집', '가볍게 5km 뛰고 치맥 하실 분?', '여의도 한강공원', NOW() + INTERVAL '1 day', 'recruiting'),
    (v_meeting3, v_user3, '판교 점심 커피챗', '판교 직장인들끼리 점심에 가볍게 인사 나눠요.', '아브뉴프랑 스벅', NOW() + INTERVAL '5 hours', 'recruiting'),
    (v_meeting4, v_user1, '홍대 맛집 탐방대', '새로 오픈한 일식집 같이 가실 분 선착순 3명', '홍대입구역 3번 출구', NOW() + INTERVAL '3 days', 'recruiting'),
    (v_meeting5, v_user4, '사이드 프로젝트 기획 회의', '기획안 마무리 단계입니다. 필참 부탁드려요.', '온라인 (Zoom)', NOW() + INTERVAL '1 week', 'confirmed'),
    (v_meeting6, v_user5, '토요일 아침 독서 모임', '각자 읽은 책 소개하는 시간입니다.', '광화문 교보문고', NOW() + INTERVAL '4 days', 'confirmed'),
    (v_meeting7, v_user2, '주말 등산 - 관악산', '정상 찍고 막걸리 한 잔!', '서울대입구역', NOW() + INTERVAL '12 hours', 'confirmed'),
    (v_meeting8, v_user3, '지난주 회고 미팅', '지난주 스프린트 리뷰 진행했습니다.', '사무실', NOW() - INTERVAL '3 days', 'completed'),
    (v_meeting9, v_user4, '급벙 - 영화 보러 가실 분', '파묘 보러 가실 분 구해요', '용산 CGV', NOW() - INTERVAL '1 day', 'completed'),
    (v_meeting10, v_user5, '비 오는 날 파전 번개', '비가 와서 취소되었습니다 ㅠㅠ', '회기역 파전골목', NOW() - INTERVAL '2 days', 'cancelled')
  ON CONFLICT (id) DO NOTHING;

  -- 4. Insert Participants
  INSERT INTO public.participants (meeting_id, user_id, status) VALUES (v_meeting1, v_user1, 'joined');
  INSERT INTO public.participants (meeting_id, user_id, status) VALUES (v_meeting1, v_user2, 'joined');
  INSERT INTO public.participants (meeting_id, user_id, status) VALUES (v_meeting2, v_user2, 'joined');
  INSERT INTO public.participants (meeting_id, user_id, status) VALUES (v_meeting3, v_user4, 'joined');
  INSERT INTO public.participants (meeting_id, user_id, status) VALUES (v_meeting3, v_user3, 'joined');
  INSERT INTO public.participants (meeting_id, user_id, status) VALUES (v_meeting3, v_user1, 'joined');
  INSERT INTO public.participants (meeting_id, user_id, status) VALUES (v_meeting3, v_user5, 'joined');
  INSERT INTO public.participants (meeting_id, user_id, status) VALUES (v_meeting5, v_user4, 'joined');
  INSERT INTO public.participants (meeting_id, user_id, status) VALUES (v_meeting5, v_user1, 'joined');
  INSERT INTO public.participants (meeting_id, user_id, status) VALUES (v_meeting5, v_user2, 'joined');
  INSERT INTO public.participants (meeting_id, user_id, status) VALUES (v_meeting5, v_user3, 'joined');
  INSERT INTO public.participants (meeting_id, user_id, status) VALUES (v_meeting6, v_user5, 'joined');
  INSERT INTO public.participants (meeting_id, user_id, status) VALUES (v_meeting6, v_user2, 'joined');

  -- 5. Insert Personal Tasks
  INSERT INTO public.personal_tasks (user_id, content, due_date, is_public, source, is_completed)
  VALUES
    (v_user1, '개인 운동하기', CURRENT_DATE, false, 'personal', false),
    (v_user1, '장보기 (우유, 계란)', CURRENT_DATE + 1, false, 'personal', false),
    (v_user1, '블로그 글 쓰기', CURRENT_DATE, true, 'personal', true),
    (v_user2, '치과 예약', CURRENT_DATE + 3, false, 'personal', false),
    (v_user2, '영어 단어 암기', CURRENT_DATE, true, 'personal', false),
    (v_user3, '프로젝트 리팩토링', CURRENT_DATE, true, 'personal', true),
    (v_user3, '어머니 생신 선물 사기', CURRENT_DATE + 2, false, 'personal', false);

END $$;
