"use client"

import { useState, useEffect } from "react"
import { MeetingCard } from "@/components/domain/meetings/meeting-card"
import { CreatePost } from "@/components/domain/meetings/create-post"
import { joinMeeting, leaveMeeting } from "@/app/actions/meetings"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
}

interface SocialFeedProps {
  initialMeetings: any[]
  user: UserProfile | null
}

const mapMeetingToUI = (m: any) => ({
  id: m.id,
  title: m.title,
  description: m.description,
  date: new Date(m.meeting_at).toLocaleDateString(), // simplified
  time: new Date(m.meeting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  location: m.location,
  hostName: m.host?.name || "Unknown",
  hostAvatar: m.host?.avatar_url || "",
  hostInitials: m.host?.name ? m.host.name.substring(0, 2) : "??",
  timePosted: new Date(m.created_at).toLocaleDateString(),
  status: m.status,
  likes: 0, // Not in DB yet
  comments: m.comments ? m.comments[0]?.count : 0,
  participantCount: m.participants ? m.participants[0]?.count : 0,
  isJoined: m.isJoined
})

export function SocialFeed({ initialMeetings, user }: SocialFeedProps) {
  const [meetings, setMeetings] = useState<any[]>(initialMeetings.map(mapMeetingToUI))

  useEffect(() => {
    setMeetings(initialMeetings.map(mapMeetingToUI))
  }, [initialMeetings])

  const handleJoin = async (meetingId: string) => {
    // Optimistic Update
    setMeetings(prev => prev.map(m => 
      m.id === meetingId ? { ...m, isJoined: true, participantCount: m.participantCount + 1 } : m
    ))
    
    try {
      await joinMeeting(meetingId)
    } catch (error) {
      // Revert on error
      setMeetings(prev => prev.map(m => 
        m.id === meetingId ? { ...m, isJoined: false, participantCount: m.participantCount - 1 } : m
      ))
      console.error("Failed to join meeting:", error)
    }
  }

  const handleLeave = async (meetingId: string) => {
    // Optimistic Update
    setMeetings(prev => prev.map(m => 
      m.id === meetingId ? { ...m, isJoined: false, participantCount: m.participantCount - 1 } : m
    ))

    try {
      await leaveMeeting(meetingId)
    } catch (error) {
      // Revert on error
      setMeetings(prev => prev.map(m => 
        m.id === meetingId ? { ...m, isJoined: true, participantCount: m.participantCount + 1 } : m
      ))
      console.error("Failed to leave meeting:", error)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-foreground">모집 중인 모임</h2>
        <span className="text-xs text-muted-foreground">{meetings.length}개</span>
      </div>
      
      <div className="mb-4 flex-shrink-0">
        <CreatePost user={user} />
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
        <div className="space-y-3 pb-4">
          {meetings.map((meeting) => (
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
              isJoined={meeting.isJoined}
              onJoin={handleJoin}
              onLeave={handleLeave}
            />
          ))}
          {meetings.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              No active meetings found. Be the first to create one!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

