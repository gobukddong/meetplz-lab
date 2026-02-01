"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, MessageCircle, Heart, Trash2, Loader2, Users } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"
import { EditMeetingDialog } from "./edit-meeting-dialog"
import { joinMeeting, leaveMeeting, deleteMeeting } from "@/lib/actions/meetings"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

export interface MeetingCardProps {
  id?: string
  title: string
  description?: string
  date: string
  time: string
  location: string
  hostName: string
  hostAvatar: string
  hostInitials: string
  timePosted: string
  status: "recruiting" | "confirmed" | "completed"
  participantCount?: number
  maxParticipants?: number
  recruitmentDeadline?: string
  isJoined?: boolean
  isHost?: boolean
  onJoin?: (id: string) => void
  onLeave?: (id: string) => void
  rawMeetingAt?: string
  rawMeetingEndAt?: string | null
}

export function MeetingCard({
  id,
  title,
  description,
  date,
  time,
  location,
  hostName,
  hostAvatar,
  hostInitials,
  timePosted,
  status,
  participantCount = 0,
  maxParticipants,
  recruitmentDeadline,
  endTime,
  isJoined,
  isHost,
  rawMeetingAt,
  rawMeetingEndAt,
  onJoin,
  onLeave,
}: MeetingCardProps & { endTime?: string | null }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isDeadlinePassed = recruitmentDeadline ? new Date(recruitmentDeadline) < new Date() : false
  const isFull = maxParticipants ? participantCount >= maxParticipants : false
  const isScheduled = rawMeetingAt ? new Date(rawMeetingAt) > new Date() : false
  const isCompleted = status === "completed" || isDeadlinePassed || (isFull && !isJoined)

  const handleAction = () => {
    if (!id) return
    if (isJoined) {
      onLeave?.(id)
    } else {
      onJoin?.(id)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    setShowDeleteConfirm(false)
    try {
      await deleteMeeting(id)
    } catch (error) {
      alert("모임 삭제 중 오류가 발생했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="group rounded-2xl bg-card p-4 shadow-[0_12px_25px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_25px_rgba(255,255,255,0.08)] transition-all hover:bg-muted/50 relative overflow-hidden cursor-pointer">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="size-10 ring-2 ring-primary/20 group-hover:scale-105 transition-transform">
          <AvatarImage src={hostAvatar || "/placeholder.svg"} alt={hostName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {hostInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{hostName}</p>
            {isHost && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/20 text-primary border-none">내 모임</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{timePosted}</p>
        </div>
        <Badge
          variant={isCompleted || isScheduled ? "secondary" : "default"}
          className={cn(
            !isCompleted && !isScheduled
              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isCompleted 
            ? "모집 완료" 
            : isScheduled 
              ? "모집 예정" 
              : status === "confirmed" 
                ? "확정" 
                : "모집 중"}
        </Badge>
      </div>

      {/* Body */}
      <div className="mt-4">
        <h3 className="font-semibold text-foreground text-base leading-tight">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Date/Time Box */}
      <div className="mt-4 rounded-xl bg-card border border-border shadow-md p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-foreground">
            <CalendarDays className="size-4 text-primary" />
            <span className="text-sm font-semibold">{date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-foreground">
            <Clock className="size-4 text-primary" />
            <span className="text-sm font-semibold">
              {time}{endTime ? ` ~ ${endTime}` : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-foreground/80 mt-2">
          <MapPin className="size-4 text-primary" />
          <span className="text-sm font-medium">{location}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isHost ? (
            <>
              <EditMeetingDialog 
                meeting={{ 
                  id: id || "", 
                  title, 
                  description: description || "", 
                  date: rawMeetingAt || "", 
                  time: rawMeetingAt || "", 
                  location,
                  maxParticipants,
                  recruitmentDeadline,
                  meeting_end_at: rawMeetingEndAt
                }} 
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1.5 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                삭제
              </Button>

              <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="sm:max-w-[400px] border-border bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">모임 삭제</DialogTitle>
                    <DialogDescription className="text-muted-foreground pt-2">
                      정말로 이 모임을 삭제하시겠습니까? 삭제된 모임은 복구할 수 없습니다.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="border-border hover:bg-muted flex-1"
                    >
                      아니오
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600 text-white flex-1"
                    >
                      예
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
             <div className="flex items-center gap-1 text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-lg">
                <Users className="size-3.5" />
                <span className="text-xs font-semibold">
                   {participantCount}{maxParticipants ? `/${maxParticipants}` : ""}명
                </span>
             </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isJoined && (
            <Link href={`/meetings/${id}/chat`}>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 border-primary/20 hover:bg-primary/5">
                <MessageCircle className="size-4" />
                채팅
              </Button>
            </Link>
          )}
          <Button
            onClick={handleAction}
            variant={isJoined ? "outline" : "default"}
            disabled={(isCompleted && !isJoined) || isScheduled}
            className={cn(
              "h-8 transition-colors",
              isJoined ? "border-primary text-primary hover:bg-primary/10" : "bg-primary hover:bg-primary/90 text-primary-foreground",
              ((isCompleted && !isJoined) || isScheduled) && "opacity-50 grayscale cursor-not-allowed"
            )}
            size="sm"
          >
            {isJoined ? "참여 취소" : isCompleted ? "모집 완료" : "참여하기"}
          </Button>
        </div>
      </div>
    </div>
  )
}
