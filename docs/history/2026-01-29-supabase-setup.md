# 2026-01-29: Supabase DB 스키마 및 초기 데이터 설정

## 1. 개요
프로젝트의 데이터베이스 스키마(Phase 1 MVP)를 확정하고, 개발 및 테스트를 위한 시드 데이터를 생성했습니다.
관리 효율성을 위해 기존의 분할된 마이그레이션 파일들을 하나로 통합했습니다.

## 2. 작업 내역

### 2.1 스키마 설계 (Schema)
`docs/db-schema.md`에 정의된 4개의 테이블을 구현했습니다.
- **profiles**: 사용자 정보 (Auth 연동)
- **meetings**: 모임 정보 (`status` 컬럼 추가됨)
- **participants**: 참여자 정보 (N:M 관계)
- **personal_tasks**: 개인 할 일 + 모임 일정 통합

### 2.2 시드 데이터 (Seed)
로컬 테스트를 위해 풍부한 가상 데이터를 생성했습니다.
- **User**: 5명 (김철수 ~ 정서연, 비밀번호 `password123`)
- **Meeting**: 10개 (모집중, 확정, 종료 등 다양한 상태)
- **Logic**: 모임 참여 시 `personal_tasks` 자동 생성 트리거 검증 완료

### 2.3 파일 통합 (Consolidation)
여러 개의 파일로 나뉘어 있던 마이그레이션과 시드 파일을 실행 편의성을 위해 하나로 합쳤습니다.
- **통합 파일 경로**: `supabase/migrations/20260129000000_full_schema_and_seed.sql`

---

## 3. 업데이트 가이드 (사용 방법)

이 프로젝트를 처음 세팅하거나 DB를 초기화해야 할 때 다음 순서를 따릅니다.

### 방법 A: Supabase 웹 대시보드 (추천)
1.  Supabase 프로젝트의 **SQL Editor** 메뉴로 이동합니다.
2.  `supabase/migrations/20260129000000_full_schema_and_seed.sql` 파일의 내용을 **전체 복사**합니다.
3.  SQL Editor에 붙여넣고 **Run** 버튼을 클릭합니다.
    *   *주의: 파일 상단에 `DROP TABLE ... CASCADE` 구문이 포함되어 있어, 기존 데이터가 모두 초기화됩니다.*

### 방법 B: Supabase CLI
로컬 환경에서 Docker를 사용하는 경우:
```bash
npx supabase db reset
```

### 4. 주요 확인 사항
DB 적용 후 다음 테이블에 데이터가 들어갔는지 확인하세요.
1.  `auth.users` (5 rows)
2.  `public.profiles` (5 rows)
3.  `public.meetings` (10 rows)
4.  `public.participants` (13 rows)
5.  `public.personal_tasks` (20 rows: 개인 할 일 7개 + 모임 자동 생성 13개)
