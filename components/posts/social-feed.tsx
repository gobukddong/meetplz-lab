"use client"

import { MeetingCard } from "@/components/domain/meetings/meeting-card"
import { CreatePost } from "@/components/domain/meetings/create-post"

const MOCK_MEETINGS = [
  {
    id: "1",
    title: "Gangnam Dinner Party",
    description: "Let's grab some Korean BBQ and catch up! Everyone is welcome.",
    date: "May 25",
    time: "19:00",
    location: "Gangnam, Seoul",
    hostName: "Sarah Chen",
    hostAvatar: "",
    hostInitials: "SC",
    timePosted: "2 hours ago",
    status: "recruiting" as const,
    likes: 12,
    comments: 5,
  },
  {
    id: "2",
    title: "Tech Startup Networking",
    description: "Monthly meetup for founders and developers in Seoul. Share your projects!",
    date: "May 26",
    time: "18:30",
    location: "Hongdae Cafe District",
    hostName: "Mike Johnson",
    hostAvatar: "",
    hostInitials: "MJ",
    timePosted: "5 hours ago",
    status: "recruiting" as const,
    likes: 24,
    comments: 8,
  },
  {
    id: "3",
    title: "Frontend Developers Meetup",
    description: "React, Vue, Svelte - let's discuss the latest trends in frontend development.",
    date: "May 27",
    time: "19:00",
    location: "WeWork Samseong",
    hostName: "Alex Rivera",
    hostAvatar: "",
    hostInitials: "AR",
    timePosted: "1 day ago",
    status: "confirmed" as const,
    likes: 45,
    comments: 12,
  },
  {
    id: "4",
    title: "Product Design Workshop",
    description: "Hands-on workshop covering Figma tips and design systems.",
    date: "May 28",
    time: "14:00",
    location: "Design Hub Itaewon",
    hostName: "Emma Wilson",
    hostAvatar: "",
    hostInitials: "EW",
    timePosted: "1 day ago",
    status: "recruiting" as const,
    likes: 18,
    comments: 3,
  },
  {
    id: "5",
    title: "Weekend Brunch Club",
    description: "Casual brunch with great food and better company.",
    date: "May 29",
    time: "11:00",
    location: "Seongsu Rooftop",
    hostName: "David Kim",
    hostAvatar: "",
    hostInitials: "DK",
    timePosted: "2 days ago",
    status: "confirmed" as const,
    likes: 32,
    comments: 7,
  },
  {
    id: "6",
    title: "AI & ML Study Group",
    description: "Weekly study session covering machine learning fundamentals.",
    date: "May 30",
    time: "20:00",
    location: "Google Campus Seoul",
    hostName: "Lisa Park",
    hostAvatar: "",
    hostInitials: "LP",
    timePosted: "3 days ago",
    status: "recruiting" as const,
    likes: 56,
    comments: 15,
  },
]

export function SocialFeed() {
  const handleJoin = (meetingId: string) => {
    // TODO: Implement join meeting logic
    // According to FLOW.md: Join → Insert participants → Create calendar task
    console.log("Joining meeting:", meetingId)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-foreground">모집 중인 모임</h2>
        <span className="text-xs text-muted-foreground">{MOCK_MEETINGS.length}개</span>
      </div>
      
      <div className="mb-4 flex-shrink-0">
        <CreatePost />
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
        <div className="space-y-3 pb-4">
          {MOCK_MEETINGS.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              id={meeting.id}
              title={meeting.title}
              description={meeting.description}
              date={meeting.date}
              time={meeting.time}
              location={meeting.location}
              hostName={meeting.hostName}
              hostAvatar={meeting.hostAvatar}
              hostInitials={meeting.hostInitials}
              timePosted={meeting.timePosted}
              status={meeting.status}
              likes={meeting.likes}
              comments={meeting.comments}
              onJoin={handleJoin}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
