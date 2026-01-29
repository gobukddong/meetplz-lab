import { createClient } from "@/lib/supabase/server"
import { getMessages } from "@/app/actions/chat"
import { ChatRoom } from "@/components/domain/meetings/chat-room"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function ChatPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const meetingId = params.id
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch meeting details to show in header or for validation
  const { data: meeting } = await supabase
    .from("meetings")
    .select("title, status")
    .eq("id", meetingId)
    .single()

  if (!meeting) {
    redirect("/")
  }

  // Double check participation for better UX (RLS also blocks if not participant)
  const { data: participant } = await supabase
    .from("participants")
    .select("status")
    .eq("meeting_id", meetingId)
    .eq("user_id", user.id)
    .single()

  if (!participant) {
    // Optionally redirect if not joined
    // redirect("/")
  }

  const initialMessages = await getMessages(meetingId)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground line-clamp-1">{meeting.title}</h1>
          <p className="text-sm text-muted-foreground">실시간 채팅</p>
        </div>
      </div>

      <ChatRoom
        meetingId={meetingId}
        initialMessages={initialMessages}
        currentUserId={user.id}
      />
    </div>
  )
}
