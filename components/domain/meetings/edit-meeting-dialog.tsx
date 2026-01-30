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
import { updateMeeting } from "@/app/actions/meetings"

interface EditMeetingDialogProps {
  meeting: {
    id: string
    title: string
    description: string
    date: string
    time: string
    location: string
  }
}

export function EditMeetingDialog({ meeting }: EditMeetingDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateStr: string) => {
    try {
      // Input date is often "YYYY. M. D."
      const parts = dateStr.split(". ").map(p => p.replace(".", "").trim())
      if (parts.length === 3) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
      }
      return dateStr
    } catch {
      return dateStr
    }
  }

  // Format time for input (HH:MM)
  const formatTimeForInput = (timeStr: string) => {
    try {
      const isPM = timeStr.includes("오후")
      const timePart = timeStr.split(" ").pop() || ""
      let [hours, minutes] = timePart.split(":").map(Number)
      if (isPM && hours !== 12) hours += 12
      if (!isPM && hours === 12) hours = 0
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    } catch {
      return timeStr
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
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
      <DialogContent className="sm:max-w-[425px] bg-[#1e1f22] text-[#dbdee1] border-white/5">
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
              className="bg-[#2b2d31] border-white/5 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea 
              id="description" 
              name="description" 
              defaultValue={meeting.description} 
              className="bg-[#2b2d31] border-white/5 focus-visible:ring-primary h-24"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">날짜</Label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                defaultValue={formatDateForInput(meeting.date)} 
                required 
                className="bg-[#2b2d31] border-white/5 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">시간</Label>
              <Input 
                id="time" 
                name="time" 
                type="time" 
                defaultValue={formatTimeForInput(meeting.time)} 
                required 
                className="bg-[#2b2d31] border-white/5 focus-visible:ring-primary"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">장소</Label>
            <Input 
              id="location" 
              name="location" 
              defaultValue={meeting.location} 
              required 
              className="bg-[#2b2d31] border-white/5 focus-visible:ring-primary"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              className="hover:bg-[#35373c]"
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
