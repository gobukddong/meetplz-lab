import { MySchedule } from "@/components/posts/my-schedule"
import { SocialFeed } from "@/components/posts/social-feed"
import { getMyTasks } from "@/app/actions/tasks"
import { getOpenMeetings } from "@/app/actions/meetings"
import { getUserProfile } from "@/app/actions/user"

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
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
        {/* Left Panel - My Schedule */}
        <div className="bg-card/30 rounded-2xl border border-border p-5 overflow-y-auto no-scrollbar flex flex-col min-h-0">
          <MySchedule initialTasks={tasks} />
        </div>

        {/* Right Panel - Social Feed */}
        <div className="bg-card/30 rounded-2xl border border-border p-5 flex flex-col min-h-0 overflow-hidden">
          <SocialFeed initialMeetings={meetings} user={userProfile} />
        </div>
      </div>
    </div>
  )
}

