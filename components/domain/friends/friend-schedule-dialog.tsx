"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScheduleCalendar } from "@/components/domain/calendar/schedule-calendar"
import { TaskList, type Task } from "@/components/domain/tasks/task-list"
import { getFriendTasks } from "@/lib/actions/tasks"
import { Loader2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface FriendScheduleDialogProps {
  friend: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mapTaskToUI = (dbTask: any): Task & { date: Date } => ({
  id: dbTask.id,
  title: dbTask.content,
  type: dbTask.source === 'meeting' ? 'meeting' : 'personal',
  isPublic: dbTask.is_public,
  completed: dbTask.is_completed,
  date: new Date(dbTask.due_date),
})

export function FriendScheduleDialog({ friend, open, onOpenChange }: FriendScheduleDialogProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<(Task & { date: Date })[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    if (open && friend?.id) {
      const fetchTasks = async () => {
        setIsLoading(true)
        try {
          const data = await getFriendTasks(friend.id, format(currentMonth, "yyyy-MM"))
          setTasks(data.map(mapTaskToUI))
        } catch (e) {
          console.error("Failed to fetch friend tasks", e)
        } finally {
          setIsLoading(false)
        }
      }
      fetchTasks()
    }
  }, [open, friend?.id, currentMonth])

  const calendarEvents = useMemo(() => {
    return tasks.map((task) => ({
      date: task.date,
      type: task.type,
    }))
  }, [tasks])

  const filteredTasks = useMemo(() => {
    if (!selectedDate) return []
    return tasks.filter(
      (task) => task.date.toDateString() === selectedDate.toDateString()
    )
  }, [tasks, selectedDate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-0 overflow-hidden bg-card border-border shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="size-5 text-primary" />
            <span>{friend?.name}님의 일정</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-2 space-y-6">
          <div className={cn("transition-opacity duration-200 relative", isLoading ? "opacity-70" : "opacity-100")}>
            <ScheduleCalendar
              events={calendarEvents}
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground px-1">
              {selectedDate
                ? format(selectedDate, "PPP (EEE)", { locale: ko })
                : "날짜를 선택하세요"}
            </h3>
            
            <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/5">
                <div className="p-4 pt-2 pb-6">
                    <TaskList
                        tasks={filteredTasks}
                        onToggleComplete={() => {}} // Read-only
                        onTogglePrivacy={() => {}} // Read-only
                    />
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
