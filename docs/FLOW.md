# meetplz 서비스 흐름도

# 사용자 여정 및 로직 흐름 (Sequence Diagram)

sequenceDiagram
    actor User
    participant Browser
    participant UI as Next.js UI (v0)
    participant Auth as Supabase Auth
    participant API as Server Actions / API Routes
    participant DB as Supabase DB
    participant RT as Supabase Realtime
    participant AI as LLM API

    %% =========================
    %% App Load & Auth
    %% =========================
    User ->> Browser: 서비스 접속
    Browser ->> UI: App Router 진입
    UI ->> Auth: 세션 확인

    alt 세션 없음
        Auth -->> UI: No Session
        UI -->> Browser: Google Login 표시
        User ->> Browser: 로그인 클릭
        Browser ->> Auth: OAuth
        Auth -->> UI: Access Token + Profile
        UI ->> DB: profiles upsert
    else 세션 있음
        Auth -->> UI: Valid Session
    end

    UI -->> Browser: Header + Split View 렌더링
    note right of UI: Header (Avatar, AI Briefing)\nLeft: My Schedule\nRight: Open Meetings

    %% =========================
    %% Left Panel – Calendar & Tasks
    %% =========================
    User ->> UI: 날짜 선택
    UI ->> API: fetchTasks(date)
    API ->> DB: SELECT personal_tasks\n(user_id = me OR is_public = true)
    DB -->> UI: Task List

    User ->> UI: 할 일 생성
    UI ->> API: createTask(content, date, is_public)
    API ->> DB: INSERT personal_tasks
    UI -->> User: Optimistic UI 반영

    User ->> UI: Lock / Unlock 토글
    UI ->> API: updateTaskPrivacy(task_id)
    API ->> DB: UPDATE is_public

    %% =========================
    %% Right Panel – Meetings Feed
    %% =========================
    UI ->> API: fetchMeetings()
    API ->> DB: SELECT meetings ORDER BY date
    DB -->> UI: Meeting Cards 렌더링

    User ->> UI: 모임 생성
    UI ->> API: createMeeting()
    API ->> DB: INSERT meetings
    DB -->> UI: 피드 즉시 반영

    %% =========================
    %% Join Meeting
    %% =========================
    User ->> UI: Join 클릭
    UI ->> API: joinMeeting(meeting_id)

    API ->> DB: INSERT participants
    note right of DB: 중복 참여 방지 (PK)

    API ->> DB: INSERT personal_tasks
    note right of DB: 모임 → 캘린더 자동 등록

    DB -->> UI: Join Success
    UI -->> User: 버튼 상태 Joined

    %% =========================
    %% Phase 2 – Voting (확장)
    %% =========================
    User ->> UI: 후보 시간 투표
    UI ->> API: submitVote()
    API ->> DB: UPDATE participants.vote_data
    API ->> DB: 랭킹 계산 (DB Function)

    %% =========================
    %% Realtime (Comments / Chat)
    %% =========================
    User ->> UI: 댓글 입력
    UI ->> DB: INSERT comments
    DB ->> RT: change event
    RT -->> UI: 실시간 댓글 반영

    %% =========================
    %% AI Briefing
    %% =========================
    User ->> UI: AI Briefing 클릭
    UI ->> Browser: LocalStorage 확인

    alt 오늘 브리핑 있음
        Browser -->> UI: Cached Briefing
    else 없음
        UI ->> API: getBriefing()
        API ->> DB: 오늘 일정 + 공개 할 일 조회
        API ->> AI: 요약 요청
        AI -->> API: Summary
        API -->> UI: Briefing Result
        UI ->> Browser: LocalStorage 저장
    end

    UI -->> User: 타자 효과로 브리핑 출력


# 서비스 아키텍처 및 페이지 구조 (Flowchart)
flowchart TD
    Start([User Visit])

    %% Auth
    Start --> AuthCheck{Logged In?}
    AuthCheck -- No --> GoogleLogin[Google OAuth Login]
    GoogleLogin --> ProfileUpsert[Upsert Profile]
    ProfileUpsert --> Dashboard

    AuthCheck -- Yes --> Dashboard

    %% Main Dashboard
    Dashboard["Main Dashboard\nSplit View"]

    Dashboard --> Header
    Dashboard --> LeftPanel
    Dashboard --> RightPanel

    %% Header
    Header["Header\nAvatar + AI Briefing"]
    Header --> AIClick{AI Briefing Click?}
    AIClick -- Yes --> AICache{Cached Today?}
    AICache -- Yes --> ShowBriefing[Show Cached Briefing]
    AICache -- No --> FetchTodayData[Fetch Today Data]
    FetchTodayData --> LLMCall[LLM Summary Request]
    LLMCall --> SaveCache[Save to LocalStorage]
    SaveCache --> ShowBriefing

    %% Left Panel
    LeftPanel["My Schedule"]

    LeftPanel --> Calendar[Calendar]
    Calendar --> SelectDate[Select Date]
    SelectDate --> FetchTasks[Fetch Tasks\nOwner or Public]
    FetchTasks --> TaskList[Daily Tasks]

    TaskList --> AddTask[Add Task]
    AddTask --> SaveTask[Insert personal_tasks]

    TaskList --> TogglePrivacy[Toggle Public or Private]
    TogglePrivacy --> UpdatePrivacy[Update is_public]

    %% Right Panel
    RightPanel["Open Meetings Feed"]

    RightPanel --> FetchMeetings[Fetch Meetings]
    FetchMeetings --> MeetingCards[Meeting Cards]

    MeetingCards --> CreateMeeting[Create Meeting]
    CreateMeeting --> SaveMeeting[Insert meetings]

    MeetingCards --> JoinMeeting[Join Meeting]
    JoinMeeting --> InsertParticipant[Insert participants]
    InsertParticipant --> AutoTask[Create Calendar Task]
    AutoTask --> Calendar

    %% Phase 2 Expansion
    MeetingCards --> Vote[Vote Time Slots]
    Vote --> SaveVote[Update vote_data]
    SaveVote --> RankCalc[Recalculate Ranking]

    MeetingCards --> Comment[Write Comment]
    Comment --> SaveComment[Insert comments]
    SaveComment --> RealtimeUpdate[Realtime Broadcast]
    RealtimeUpdate --> MeetingCards
