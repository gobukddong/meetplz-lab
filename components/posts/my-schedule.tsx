"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ScheduleCalendar } from "@/components/domain/calendar/schedule-calendar"
import { TaskList, type Task } from "@/components/domain/tasks/task-list"
import { AddTaskDialog } from "@/components/domain/tasks/add-task-dialog"
import { createTask, toggleTaskCompletion, toggleTaskPrivacy } from "@/app/actions/tasks"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

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
  const pathname = usePathname()
  
  const monthParam = searchParams.get("month")
  const currentMonth = useMemo(() => {
    if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number)
      return new Date(year, month - 1, 1)
    }
    return new Date()
  }, [monthParam])

  // Use DB data or empty
  const [tasks, setTasks] = useState<(Task & { date: Date })[]>(
    initialTasks.map(mapTaskToUI)
  )

  const handleMonthChange = (newMonth: Date) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("month", format(newMonth, "yyyy-MM"))
    router.push(`${pathname}?${params.toString()}`)
  }
  
  // Update state when initialTasks changes (server revalidation)
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
    type: "meeting" | "personal" // 'meeting' type creates are generally via joinMeeting, but manual create is personal
    isPublic: boolean
    date: Date
  }) => {
    // Optimistic Append
    const tempId = Date.now().toString()
    const task: Task & { date: Date } = {
      id: tempId,
      title: newTask.title,
      type: "personal", // user added tasks are personal
      isPublic: newTask.isPublic,
      completed: false,
      date: newTask.date,
    }
    setTasks((prev) => [...prev, task])

    const formData = new FormData()
    formData.append("content", newTask.title)
    // Format date as YYYY-MM-DD
    const dateStr = format(newTask.date, "yyyy-MM-dd")
    formData.append("date", dateStr)
    if (!newTask.isPublic) formData.append("isPrivate", "on")

    try {
        await createTask(formData)
        // Server revalidation in action happens, causing props update -> useEffect will resync with real ID
    } catch (e) {
        // Revert on error
        setTasks((prev) => prev.filter(t => t.id !== tempId))
        console.error("Failed to create task", e)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold text-foreground mb-4">내 일정</h2>
      
      <ScheduleCalendar
        events={calendarEvents}
        selected={selectedDate}
        onSelect={setSelectedDate}
        month={currentMonth}
        onMonthChange={handleMonthChange}
      />
      
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

