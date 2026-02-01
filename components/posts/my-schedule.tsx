"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ScheduleCalendar } from "@/components/domain/calendar/schedule-calendar"
import { TaskList, type Task } from "@/components/domain/tasks/task-list"
import { AddTaskDialog } from "@/components/domain/tasks/add-task-dialog"
import { getMyTasks, createTask, updateTask, deleteTask, toggleTaskCompletion, toggleTaskPrivacy } from "@/lib/actions/tasks"
import { EditTaskDialog } from "@/components/domain/tasks/edit-task-dialog"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import { LoaderCircle, Users, ChevronDown, ChevronUp } from "lucide-react"
import { FriendSidebar } from "@/components/domain/friends/friends-sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Helper to map DB tasks to UI tasks
const mapTaskToUI = (dbTask: any): Task & { date: Date; time?: string } => ({
  id: dbTask.id,
  title: dbTask.content,
  type: dbTask.source as "meeting" | "personal",
  isPublic: dbTask.is_public,
  completed: dbTask.is_completed,
  date: new Date(dbTask.due_date),
  time: dbTask.due_time?.slice(0, 5) // HH:mm:ss -> HH:mm
})

interface MyScheduleProps {
  initialTasks: any[] // Using any for simplicity with DB types
}

export function MySchedule({ initialTasks }: MyScheduleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Local month state for instant transition
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const monthParam = searchParams.get("month")
    if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number)
      return new Date(year, month - 1, 1)
    }
    return new Date()
  })

  // Use DB data or empty
  const [tasks, setTasks] = useState<(Task & { date: Date; time?: string })[]>(
    initialTasks.map(mapTaskToUI)
  )
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)

  // Fast UI update + Async Data Sync
  const handleMonthChange = (newMonth: Date) => {
    // 1. Instant UI move
    setCurrentMonth(newMonth)
    
    // 2. Background URL update (non-blocking)
    const params = new URLSearchParams(window.location.search)
    params.set("month", format(newMonth, "yyyy-MM"))
    window.history.replaceState(null, "", `?${params.toString()}`)
  }

  // Fetch tasks when currentMonth changes (Client-side sync)
  useEffect(() => {
    const fetchTasks = async () => {
        setIsLoadingTasks(true)
        try {
            const data = await getMyTasks(format(currentMonth, "yyyy-MM"))
            setTasks(data.map(mapTaskToUI))
        } catch (e) {
            console.error("Failed to fetch tasks for month", e)
        } finally {
            setIsLoadingTasks(false)
        }
    }
    
    // Skip if it's the very first render and we already have initialTasks matching
    // (Optimization: we could compare currentMonth with initialTasks timestamps)
    fetchTasks()
  }, [currentMonth])
  
  // Resync if server revalidates (e.g. after adding a task)
  useEffect(() => {
    setTasks(initialTasks.map(mapTaskToUI))
  }, [initialTasks])

  // Default to today
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<(Task & { date: Date; time?: string }) | null>(null)

  // Delete Confirmation State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
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

  const handleToggleComplete = async (id: string) => {
    // Optimistic Update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
    const task = tasks.find(t => t.id === id)
    if (task) {
        await toggleTaskCompletion(id, !task.completed)
    }
  }

  const handleTogglePrivacy = async (id: string) => {
    // Optimistic Update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isPublic: !task.isPublic } : task
      )
    )
    const task = tasks.find(t => t.id === id)
    if (task) {
        await toggleTaskPrivacy(id, task.isPublic) // toggleTaskPrivacy logic flips it
    }
  }

  const handleAddTask = async (taskData: {
    title: string
    type: "meeting" | "personal"
    isPublic: boolean
    date: Date
    time: string
  }) => {
    const tempId = Math.random().toString(36).substring(7)
    const newTask = { ...taskData, id: tempId, completed: false }
    setTasks((prev) => [...prev, newTask])

    const formData = new FormData()
    formData.append("content", taskData.title)
    const dateStr = format(taskData.date, "yyyy-MM-dd")
    formData.append("date", dateStr)
    formData.append("time", taskData.time)
    formData.append("type", taskData.type)
    if (!taskData.isPublic) formData.append("isPrivate", "on")

    try {
        await createTask(formData)
    } catch (e) {
        setTasks((prev) => prev.filter(t => t.id !== tempId))
        console.error("Failed to create task", e)
    }
  }

  const handleEditTask = async (id: string, updatedData: {
    title: string
    type: "meeting" | "personal"
    isPublic: boolean
    date: Date
    time: string
  }) => {
    // Optimistic Update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updatedData } : task
      )
    )

    const formData = new FormData()
    formData.append("content", updatedData.title)
    const dateStr = format(updatedData.date, "yyyy-MM-dd")
    formData.append("date", dateStr)
    formData.append("time", updatedData.time)
    formData.append("type", updatedData.type)
    if (!updatedData.isPublic) formData.append("isPrivate", "on")

    try {
      await updateTask(id, formData)
    } catch (e) {
      // Revert on error (could be better if we had original data)
      console.error("Failed to update task", e)
      // Refresh to get correct server state
      const data = await getMyTasks(format(currentMonth, "yyyy-MM"))
      setTasks(data.map(mapTaskToUI))
    }
  }

  const handleDeleteTask = async () => {
    if (!taskToDelete) return

    const id = taskToDelete
    setIsDeleteConfirmOpen(false)
    setTaskToDelete(null)

    // Optimistic Update
    const originalTasks = [...tasks]
    setTasks((prev) => prev.filter((task) => task.id !== id))

    try {
      await deleteTask(id)
    } catch (e) {
      setTasks(originalTasks)
      console.error("Failed to delete task", e)
      alert("일정 삭제 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      <h2 className="text-lg font-semibold text-foreground mb-4">내 일정</h2>
      
      <div className={cn("transition-opacity duration-200 relative", isLoadingTasks ? "opacity-70" : "opacity-100")}>
        <ScheduleCalendar
          events={calendarEvents}
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentMonth}
          onMonthChange={handleMonthChange}
          headerActions={
            <AddTaskDialog selectedDate={selectedDate} onAddTask={handleAddTask} />
          }
        />
      </div>
      
      <div className="mt-6 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-3 flex-shrink-0 px-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              {selectedDate
                ? format(selectedDate, "PPP (EEE)", { locale: ko })
                : "날짜를 선택하세요"}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500/20 border border-rose-500/40" />
              모임 일정
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-muted/50 border border-muted-foreground/30" />
              내 일정
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2 pb-20">
          <TaskList
            tasks={filteredTasks}
            onToggleComplete={handleToggleComplete}
            onTogglePrivacy={handleTogglePrivacy}
            onEdit={(task) => {
              const fullTask = tasks.find(t => t.id === task.id)
              if (fullTask) {
                setEditingTask(fullTask)
                setIsEditOpen(true)
              }
            }}
            onDelete={(id) => {
              setTaskToDelete(id)
              setIsDeleteConfirmOpen(true)
            }}
          />
        </div>
      </div>
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onEditTask={handleEditTask}
        />
      )}

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">일정 삭제</DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              정말로 이 일정을 삭제하시겠습니까? 삭제된 일정은 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="border-border hover:bg-muted flex-1"
            >
              아니오
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTask}
              className="bg-red-500 hover:bg-red-600 text-white flex-1"
            >
              예
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

