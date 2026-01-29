# Implementation Roadmap

This roadmap outlines the step-by-step plan to implement Supabase integration, Google OAuth, and core logic for the `meetplz` project.

## Phase 1: Environment & Type Setup

Before writing logic, ensure the environment and types are ready.

- [ ] **1.1. Environment Variables**
    - Verify `.env.local` contains:
        ```bash
        NEXT_PUBLIC_SUPABASE_URL=...
        NEXT_PUBLIC_SUPABASE_ANON_KEY=...
        ```
- [ ] **1.2. Install Dependencies**
    - Ensure `@supabase/ssr` and `@supabase/supabase-js` are installed.
    - Command: `npm install @supabase/supabase-js @supabase/ssr`
- [ ] **1.3. Generate Database Types**
    - Generate strict TypeScript types from the applied schema.
    - Command: `npx supabase gen types typescript --project-id <your-project-id> > types/database.ts`
    - *Note: For local dev, use `npx supabase gen types typescript --local > types/database.ts`*

## Phase 2: Supabase Client & Middleware Implementation

Implement the foundational code in `lib/supabase/` to handle sessions securely using Cookies.

- [ ] **2.1. Browser Client (`lib/supabase/client.ts`)**
    - Implement `createClient` using `createBrowserClient`.
    - Usage: For client-side components (Client Components).
- [ ] **2.2. Server Client (`lib/supabase/server.ts`)**
    - Implement `createClient` using `createServerClient`.
    - **Crucial**: Implement `cookieStore` handling (get, set, remove) for Next.js App Router.
    - Usage: For Server Components, Server Actions, and Route Handlers.
- [ ] **2.3. Middleware (`lib/supabase/middleware.ts` & root `middleware.ts`)**
    - Create a separate `updateSession` function in `lib/supabase/middleware.ts` to refresh tokens.
    - Update root `middleware.ts` to call `updateSession`.
    - **Logic**: 
        - If user is NOT authenticated and tries to access protected routes (e.g., `/my-schedule`), redirect to `/login`.
        - If user IS authenticated and tries to access `/login`, redirect to `/my-schedule`.

## Phase 3: Authentication (Google OAuth)

Implement the full OAuth flow.

- [ ] **3.1. Auth Callback Route (`app/auth/callback/route.ts`)**
    - **Action**: Create a new API Route Handler (NOT a page).
    - **Logic**: 
        1. Receive `code` from URL query params.
        2. Exchange `code` for `session` using `supabase.auth.exchangeCodeForSession(code)`.
        3. Redirect user to the original origin (or `/my-schedule`).
- [ ] **3.2. Login Page Logic (`app/(auth)/login/page.tsx`)**
    - **UI**: Add a "Sign in with Google" button.
    - **Action**: Implement `signInWithGoogle` function.
    - **Logic**:
        - Call `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: ... } })`.
        - `redirectTo` should point to `${origin}/auth/callback`.

## Phase 4: Core Features Implementation

Connect the Database Schema to the UI using Server Components and Server Actions.

### 4.1. User Profile
- [ ] **Fetch Profile**: In `layout.tsx` or top-level component.
    - Use `createClient` (Server) -> `supabase.auth.getUser()`.
    - Fetch detailed profile from `profiles` table using the ID.

### 4.2. Meetings (Open Meetings)
- [ ] **List Meetings**:
    - Use `createClient` (Server) -> `from('meetings').select('*').eq('status', 'recruiting')`.
    - Render `MeetingCard` components.
- [ ] **Meeting Details & Join**:
    - **Read**: Fetch single meeting by ID.
    - **Action**: Create Server Action `joinMeeting(meetingId)`.
        - Logic: `insert` into `participants` table.
        - *Bonus*: The DB trigger `create_task_on_meeting_join` will auto-create the task. No extra code needed!

### 4.3. My Schedule (Personal Tasks)
- [ ] **Fetch Tasks**:
    - Use `createClient` (Server).
    - Query: `from('personal_tasks').select('*').order('due_date')`.
    - RLS will automatically filter to show only **my** tasks.
- [ ] **Toggle Completion**:
    - Action: `toggleTask(taskId, isCompleted)`.
    - Query: `update('personal_tasks').set({ is_completed: ... }).eq('id', taskId)`.

## Phase 5: Verification & Polish

- [ ] **5.1. Test Triggers**: Join a meeting and verify it appears in "My Schedule".
- [ ] **5.2. Test RLS**: Try to access another user's private task (should fail/return empty).
- [ ] **5.3. Final Styling**: Polish UI states (loading, empty states).
