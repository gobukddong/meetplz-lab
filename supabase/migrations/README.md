# Supabase Migrations

이 폴더는 데이터베이스 스키마 변경 사항을 관리하는 마이그레이션 파일들을 포함하고 있습니다.

## 파일 구조

- `20260129000000_create_profiles.sql`: 사용자 프로필 테이블 생성
- `20260129000001_create_meetings.sql`: 모임 테이블 및 Enum 생성
- `20260129000002_create_participants.sql`: 참여자 테이블 생성
- `20260129000003_create_personal_tasks.sql`: 개인 할 일 테이블 및 Enum 생성
- `20260129000004_create_logic_triggers.sql`: 모임 참여 시 할 일 자동 생성 트리거
- `20260129000005_setup_rls_policies.sql`: Row Level Security (RLS) 정책 설정

## 적용 방법

### 1. Supabase Dashboard (SQL Editor) 사용 시
파일 번호가 낮은 순서대로 (`00` -> `05`) SQL Editor에 복사하여 실행하세요.

### 2. Supabase CLI 사용 시
```bash
# 로컬 개발 환경에 마이그레이션 적용
npx supabase migration up
```
