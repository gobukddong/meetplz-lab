"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarPlus, MapPin, Send, LoaderCircle } from "lucide-react"
import { createMeeting } from "@/lib/actions/meetings"
import { format } from "date-fns"
import { cn } from "@/lib/utils/cn"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/common/date-picker"
import { TimePicker } from "@/components/common/time-picker"

interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
}

interface CreatePostProps {
  user?: UserProfile | null
}

export function CreatePost({ user }: CreatePostProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("") 
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [startTime, setStartTime] = useState("19:00")
  const [endTime, setEndTime] = useState("21:00")
  const [maxParticipants, setMaxParticipants] = useState<string>("5")
  const [isUnlimited, setIsUnlimited] = useState(false)
  const [deadline, setDeadline] = useState(format(new Date(), "yyyy-MM-dd"))
  const [isLoading, setIsLoading] = useState(false)

  const handleMaxParticipantsBlur = () => {
    if (isUnlimited) return
    const val = parseFloat(maxParticipants)
    if (isNaN(val) || val < 2 || !Number.isInteger(val)) {
      setMaxParticipants("2")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !location.trim() || !date) return
    
    setIsLoading(true)
    
    const formData = new FormData()
    formData.append("title", title)
    formData.append("location", location)
    formData.append("date", date)
    formData.append("startTime", startTime)
    formData.append("endTime", endTime)
    formData.append("description", description)
    formData.append("maxParticipants", isUnlimited ? "" : maxParticipants)
    formData.append("deadline", deadline)

    try {
        const result = await createMeeting({}, formData)
        
        if (result.message) {
          alert(result.message)
          return
        }

        // Success - Reset
        setTitle("")
        setDescription("")
        setLocation("")
        setMaxParticipants("5")
        setIsUnlimited(false)
        setDeadline(format(new Date(), "yyyy-MM-dd"))
        setOpen(false)
    } catch (e) {
        console.error("Failed to create meeting", e)
        alert("모임 등록 중 예기치 못한 오류가 발생했습니다.")
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="rounded-xl bg-card p-4 cursor-pointer shadow-[0_10px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_20px_rgba(255,255,255,0.05)] hover:bg-muted/50 transition-all group">
          <div className="flex gap-3 items-center text-muted-foreground">
            <Avatar className="size-9 shrink-0 ring-2 ring-background shadow-sm group-hover:scale-105 transition-transform">
              <AvatarImage src={user?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary/10 text-primary">{user?.name?.substring(0, 2) || "?"}</AvatarFallback>
            </Avatar>
            <div className="text-sm font-medium group-hover:text-foreground transition-colors">여기를 눌러 새 모임을 만드세요!</div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">새 모임 만들기</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">모임 제목</Label>
            <Input 
              id="title"
              placeholder="모임 제목을 입력해주세요" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="bg-background border-border shadow-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">상세 설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="모임에 대해 설명해주세요"
              className="bg-background border-border min-h-[100px] resize-none shadow-md"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">모집 시작일</Label>
              <div className="shadow-md rounded-xl">
                <DatePicker 
                  date={date}
                  onChange={setDate}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">모집 마감일</Label>
              <div className="shadow-md rounded-xl">
                <DatePicker 
                  date={deadline}
                  onChange={setDeadline}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">시작 시간</Label>
              <div className="shadow-md rounded-xl">
                <TimePicker 
                  time={startTime}
                  onChange={setStartTime}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">종료 시간</Label>
              <div className="shadow-md rounded-xl">
                <TimePicker 
                  time={endTime}
                  onChange={setEndTime}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxParticipants" className="text-sm font-medium">최대 인원</Label>
                <Button 
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUnlimited(!isUnlimited)}
                  className={cn(
                    "h-6 px-1.5 text-[10px] rounded-md transition-colors",
                    isUnlimited 
                      ? "bg-primary/20 text-primary hover:bg-primary/30" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  무제한
                </Button>
              </div>
              <Input 
                id="maxParticipants"
                type={isUnlimited ? "text" : "number"}
                min="2"
                max="100"
                value={isUnlimited ? "무제한" : maxParticipants}
                onChange={e => setMaxParticipants(e.target.value)}
                onBlur={handleMaxParticipantsBlur}
                disabled={isUnlimited}
                className={cn(
                  "bg-background border-border transition-colors shadow-md",
                  isUnlimited && "bg-muted text-muted-foreground cursor-not-allowed opacity-80"
                )}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center h-6">
                <Label htmlFor="location" className="text-sm font-medium">장소</Label>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input 
                  id="location"
                  placeholder="모임 장소"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="pl-9 bg-background border-border shadow-md"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border hover:bg-muted"
            >
              취소
            </Button>
            <Button 
              type="submit"
              className="gap-1.5 bg-primary hover:bg-primary/90"
              disabled={!title.trim() || !location.trim() || isLoading}
            >
              {isLoading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <>
                  <Send className="size-4" />
                  <span>모임 등록하기</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

