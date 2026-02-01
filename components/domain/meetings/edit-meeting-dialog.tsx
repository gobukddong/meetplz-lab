"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Loader2 } from "lucide-react"
import { updateMeeting } from "@/lib/actions/meetings"
import { DatePicker } from "@/components/common/date-picker"
import { TimePicker } from "@/components/common/time-picker"
import { format, isValid } from "date-fns"
import { cn } from "@/lib/utils/cn"

interface EditMeetingDialogProps {
  meeting: {
    id: string
    title: string
    description: string
    date: string
    time: string
    location: string
    maxParticipants?: number
    recruitmentDeadline?: string
    meeting_end_at?: string | null
  }
}

export function EditMeetingDialog({ meeting }: EditMeetingDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Format initial value for datetime-local (YYYY-MM-DDTHH:MM)
  const formatForInput = (dateStr: string, timeStr: string) => {
    try {
      // Date: "2024. 1. 31." -> "2024-01-31" or "1/31/2024"
      // Handle various formats from toLocaleDateString
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return ""
      return format(d, "yyyy-MM-dd")
    } catch {
      return ""
    }
  }

  const [date, setDate] = useState(() => {
    const d = new Date(meeting.date)
    return isValid(d) ? format(d, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  })
  const [startTime, setStartTime] = useState(() => {
    const d = new Date(meeting.time)
    return isValid(d) ? format(d, "HH:mm") : "19:00"
  })
  const [endTime, setEndTime] = useState(() => {
    if (meeting.meeting_end_at) {
      const d = new Date(meeting.meeting_end_at)
      if (isValid(d)) return format(d, "HH:mm")
    }
    return "21:00"
  })

  const [maxParticipants, setMaxParticipants] = useState<string>(String(meeting.maxParticipants || "5"))
  const [isUnlimited, setIsUnlimited] = useState(!meeting.maxParticipants)
  const [deadline, setDeadline] = useState(() => {
    if (meeting.recruitmentDeadline) {
      return format(new Date(meeting.recruitmentDeadline), "yyyy-MM-dd")
    }
    return format(new Date(), "yyyy-MM-dd")
  })

  const handleMaxParticipantsBlur = () => {
    if (isUnlimited) return
    const val = parseFloat(maxParticipants)
    if (isNaN(val) || val < 2 || !Number.isInteger(val)) {
      setMaxParticipants("2")
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    formData.set("date", date)
    formData.set("startTime", startTime)
    formData.set("endTime", endTime)
    formData.set("maxParticipants", isUnlimited ? "" : maxParticipants)
    formData.set("deadline", deadline)

    try {
      const result = await updateMeeting(meeting.id, formData)
      if (result.message) {
        alert(result.message)
      } else {
        alert("모임 정보가 수정되었습니다.")
        setIsOpen(false)
      }
    } catch (error) {
      alert("모임 수정 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 border-primary/20 hover:bg-primary/5">
          <Pencil className="size-4" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>모임 정보 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input 
              id="title" 
              name="title" 
              defaultValue={meeting.title} 
              required 
              className="bg-background border-border shadow-md"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">상세 설명</Label>
            <Textarea 
              id="description" 
              name="description" 
              defaultValue={meeting.description} 
              placeholder="모임에 대해 설명해주세요"
              className="bg-background border-border min-h-[100px] resize-none shadow-md"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>모집 시작일</Label>
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
              <Label>시작 시간</Label>
              <div className="shadow-md rounded-xl">
                <TimePicker 
                  time={startTime}
                  onChange={setStartTime}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>종료 시간</Label>
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
                <Label htmlFor="location">장소</Label>
              </div>
              <Input 
                id="location" 
                name="location" 
                defaultValue={meeting.location} 
                required 
                className="bg-background border-border shadow-md"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="border-border hover:bg-muted"
            >
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[80px]"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "수정 완료"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
