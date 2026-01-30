"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, MessageCircle, Heart, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"
import { EditMeetingDialog } from "./edit-meeting-dialog"
import { deleteMeeting } from "@/app/actions/meetings"

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
  status: "recruiting" | "confirmed"
  likes?: number
  comments?: number
  isJoined?: boolean
  isHost?: boolean
  onJoin?: (id: string) => void
  onLeave?: (id: string) => void
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
  likes = 0,
  comments = 0,
  isJoined,
  isHost,
  onJoin,
  onLeave,
}: MeetingCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

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
    if (!confirm("정말 이 모임을 삭제하시겠습니까?")) return

    setIsDeleting(true)
    try {
      await deleteMeeting(id)
    } catch (error) {
      alert("모임 삭제 중 오류가 발생했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 relative overflow-hidden">
      {/* Background decoration for host */}
      {isHost && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-8 -mt-8 rotate-45 pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="size-10 ring-2 ring-primary/20">
          <AvatarImage src={hostAvatar || "/placeholder.svg"} alt={hostName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {hostInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{hostName}</p>
            {isHost && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/20 text-primary border-none">방장</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{timePosted}</p>
        </div>
        <Badge
          variant={status === "recruiting" ? "default" : "secondary"}
          className={cn(
            status === "recruiting"
              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
              : ""
          )}
        >
          {status === "recruiting" ? "모집 중" : "확정"}
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
      <div className="mt-4 rounded-lg bg-primary/10 border border-primary/20 p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-primary">
            <CalendarDays className="size-4" />
            <span className="text-sm font-medium">{date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <Clock className="size-4" />
            <span className="text-sm font-medium">{time}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground mt-2">
          <MapPin className="size-4" />
          <span className="text-sm">{location}</span>
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
                  date, 
                  time, 
                  location 
                }} 
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1.5 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                삭제
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 h-8 px-2",
                  liked ? "text-red-500 hover:text-red-500" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={handleLike}
              >
                <Heart className={cn("size-4", liked && "fill-current")} />
                <span className="text-xs">{likeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="size-4" />
                <span className="text-xs">{comments}</span>
              </Button>
            </>
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
            className={cn(
              "h-8 transition-colors",
              isJoined ? "border-primary text-primary hover:bg-primary/10" : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
            size="sm"
          >
            {isJoined ? "참여 취소" : "참여하기"}
          </Button>
        </div>
      </div>
    </div>
  )
}
