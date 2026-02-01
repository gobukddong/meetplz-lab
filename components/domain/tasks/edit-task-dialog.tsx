"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Users, User, Globe, Lock, Clock } from "lucide-react"
import { DatePicker } from "@/components/common/date-picker"
import { TimePicker } from "@/components/common/time-picker"
import { format } from "date-fns"
import { Task } from "./task-list"

interface EditTaskDialogProps {
  task: Task & { date: Date; time?: string }
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditTask: (id: string, updatedTask: {
    title: string
    type: "meeting" | "personal"
    isPublic: boolean
    date: Date
    time: string
  }) => void
}

export function EditTaskDialog({ task, open, onOpenChange, onEditTask }: EditTaskDialogProps) {
  const [title, setTitle] = useState(task.title)
  const [type, setType] = useState<"meeting" | "personal">(task.type)
  const [isPublic, setIsPublic] = useState(task.isPublic)
  const [internalDate, setInternalDate] = useState<Date>(task.date)
  const [time, setTime] = useState(task.time || "19:00")

  useEffect(() => {
    if (open) {
      setTitle(task.title)
      setType(task.type)
      setIsPublic(task.isPublic)
      setInternalDate(task.date)
      setTime(task.time || "19:00")
    }
  }, [open, task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !internalDate) return
    
    onEditTask(task.id, {
      title: title.trim(),
      type,
      isPublic,
      date: internalDate,
      time,
    })
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">일정 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-sm text-foreground">일정 제목</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력해주세요..."
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-foreground">일정 종류</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "meeting" ? "default" : "outline"}
                size="sm"
                className={`flex-1 gap-1.5 ${type === "meeting" ? "bg-primary hover:bg-primary/90" : "border-border"}`}
                onClick={() => setType("meeting")}
              >
                <Users className="size-3.5" />
                모임
              </Button>
              <Button
                type="button"
                variant={type === "personal" ? "default" : "outline"}
                size="sm"
                className={`flex-1 gap-1.5 ${type === "personal" ? "bg-muted-foreground hover:bg-muted-foreground/80" : "border-border"}`}
                onClick={() => setType("personal")}
              >
                <User className="size-3.5" />
                개인
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-foreground">공개 여부</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isPublic ? "default" : "outline"}
                size="sm"
                className={`flex-1 gap-1.5 ${isPublic ? "bg-primary hover:bg-primary/90" : "border-border"}`}
                onClick={() => setIsPublic(true)}
              >
                <Globe className="size-3.5" />
                공개
              </Button>
              <Button
                type="button"
                variant={!isPublic ? "default" : "outline"}
                size="sm"
                className={`flex-1 gap-1.5 ${!isPublic ? "bg-muted-foreground hover:bg-muted-foreground/80" : "border-border"}`}
                onClick={() => setIsPublic(false)}
              >
                <Lock className="size-3.5" />
                비공개
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-foreground">날짜</Label>
            <DatePicker 
              date={format(internalDate, "yyyy-MM-dd")} 
              onChange={(dateStr) => {
                const [y, m, d] = dateStr.split("-").map(Number)
                setInternalDate(new Date(y, m - 1, d))
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-foreground">시간</Label>
            <TimePicker 
              time={time}
              onChange={setTime}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!title.trim()}
            >
              확인
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
