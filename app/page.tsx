import { MySchedule } from "@/components/posts/my-schedule"
import { SocialFeed } from "@/components/posts/social-feed"
import { FriendSidebar } from "@/components/domain/friends/friends-sidebar"
import { getMyTasks } from "@/lib/actions/tasks"
import { getOpenMeetings } from "@/lib/actions/meetings"
import { getUserProfile } from "@/lib/actions/user"

export default async function Home(props: {
  searchParams: Promise<{ month?: string }>
}) {
  const searchParams = await props.searchParams
  const month = searchParams.month

  const [tasks, meetings, userProfile] = await Promise.all([
    getMyTasks(month),
    getOpenMeetings(),
    getUserProfile(),
  ])

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden no-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
        {/* Left Panel - My Schedule */}
        <div className="bg-card/40 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_25px_50px_-15px_rgba(255,255,255,0.12)] p-5 pb-10 overflow-y-visible no-scrollbar flex flex-col min-h-0">
          <MySchedule initialTasks={tasks} />
        </div>

        {/* Right Panel - Social Feed */}
        <div className="bg-card/40 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_25px_50px_-15px_rgba(255,255,255,0.12)] p-5 pb-10 flex flex-col min-h-0 overflow-visible relative">
          <SocialFeed initialMeetings={meetings} user={userProfile} />
          <div className="absolute top-5 right-5 bottom-5 left-[calc(100%+24px)] hidden xl:block w-80">
             <FriendSidebar user={userProfile} />
          </div>
        </div>
      </div>
    </div>
  )
}
