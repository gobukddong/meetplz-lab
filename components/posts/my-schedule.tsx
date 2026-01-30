"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ScheduleCalendar } from "@/components/domain/calendar/schedule-calendar"
import { TaskList, type Task } from "@/components/domain/tasks/task-list"
import { AddTaskDialog } from "@/components/domain/tasks/add-task-dialog"
import { getMyTasks, createTask, toggleTaskCompletion, toggleTaskPrivacy } from "@/app/actions/tasks"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import { LoaderCircle, Users, ChevronDown, ChevronUp } from "lucide-react"
import { FriendSidebar } from "@/components/domain/friends/friends-sidebar"

// Helper to map DB tasks to UI tasks
const mapTaskToUI = (dbTask: any): Task & { date: Date } => ({
  id: dbTask.id,
  title: dbTask.content,
  type: dbTask.source === 'meeting' ? 'meeting' : 'personal',
  isPublic: dbTask.is_public,
  completed: dbTask.is_completed,
  date: new Date(dbTask.due_date),
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
  const [tasks, setTasks] = useState<(Task & { date: Date })[]>(
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

  const handleAddTask = async (newTask: {
    title: string
    type: "meeting" | "personal"
    isPublic: boolean
    date: Date
  }) => {
    const tempId = Date.now().toString()
    const task: Task & { date: Date } = {
      id: tempId,
      title: newTask.title,
      type: "personal",
      isPublic: newTask.isPublic,
      completed: false,
      date: newTask.date,
    }
    setTasks((prev) => [...prev, task])

    const formData = new FormData()
    formData.append("content", newTask.title)
    const dateStr = format(newTask.date, "yyyy-MM-dd")
    formData.append("date", dateStr)
    if (!newTask.isPublic) formData.append("isPrivate", "on")

    try {
        await createTask(formData)
    } catch (e) {
        setTasks((prev) => prev.filter(t => t.id !== tempId))
        console.error("Failed to create task", e)
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
        />
      </div>
      
      <div className="mt-6 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-foreground">
              {selectedDate
                ? format(selectedDate, "PPP (EEE)", { locale: ko })
                : "날짜를 선택하세요"}
            </h3>
            <AddTaskDialog selectedDate={selectedDate} onAddTask={handleAddTask} />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-red-500" />
              모임 일정
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground" />
              내 일정
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <TaskList
            tasks={filteredTasks}
            onToggleComplete={handleToggleComplete}
            onTogglePrivacy={handleTogglePrivacy}
          />
        </div>
      </div>
    </div>
  )
}

