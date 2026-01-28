import { AvatarFallback } from "@/components/ui/avatar"
import { AvatarImage } from "@/components/ui/avatar"
import { Avatar } from "@/components/ui/avatar"
import { MySchedule } from "@/tmp-v0/components/my-schedule"
import { SocialFeed } from "@/tmp-v0/components/social-feed"
import { CalendarCheck } from "lucide-react"
import { ThemeToggle } from "@/tmp-v0/components/theme-toggle"
import { ProfileDropdown } from "@/tmp-v0/components/profile-dropdown"

export default function Dashboard() {
  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <CalendarCheck className="size-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">meetplz</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Panel - My Schedule */}
          <div className="bg-card/30 rounded-2xl border border-border p-5 overflow-y-auto no-scrollbar flex flex-col min-h-0">
            <MySchedule />
          </div>

          {/* Right Panel - Social Feed */}
          <div className="bg-card/30 rounded-2xl border border-border p-5 flex flex-col min-h-0 overflow-hidden">
            <SocialFeed />
          </div>
        </div>
      </main>
    </div>
  )
}
