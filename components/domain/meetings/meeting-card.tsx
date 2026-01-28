"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, MessageCircle, Heart } from "lucide-react"
import { cn } from "@/lib/utils/cn"

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
  onJoin?: (id: string) => void
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
  onJoin,
}: MeetingCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const handleJoin = () => {
    if (id && onJoin) {
      onJoin(id)
    }
  }

  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="size-10 ring-2 ring-primary/20">
          <AvatarImage src={hostAvatar || "/placeholder.svg"} alt={hostName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {hostInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{hostName}</p>
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
        </div>
        <Button
          onClick={handleJoin}
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-8"
          size="sm"
        >
          참여하기
        </Button>
      </div>
    </div>
  )
}
