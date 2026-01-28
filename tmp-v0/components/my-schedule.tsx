"use client"

import { useState, useMemo } from "react"
import { ScheduleCalendar } from "./schedule-calendar"
import { TaskList } from "./task-list"
import { AddTaskDialog } from "./add-task-dialog"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  type: "meeting" | "personal"
  isPublic: boolean
  completed: boolean
  date: Date
}

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Technical Interview - Frontend",
    type: "meeting",
    isPublic: true,
    completed: false,
    date: new Date(2026, 0, 29),
  },
  {
    id: "2",
    title: "Review candidate portfolios",
    type: "personal",
    isPublic: false,
    completed: false,
    date: new Date(2026, 0, 29),
  },
  {
    id: "3",
    title: "Product Design Sync",
    type: "meeting",
    isPublic: true,
    completed: false,
    date: new Date(2026, 0, 29),
  },
  {
    id: "4",
    title: "Prepare presentation slides",
    type: "personal",
    isPublic: false,
    completed: true,
    date: new Date(2026, 0, 28),
  },
  {
    id: "5",
    title: "Engineering All-Hands",
    type: "meeting",
    isPublic: true,
    completed: false,
    date: new Date(2026, 0, 30),
  },
  {
    id: "6",
    title: "Update team documentation",
    type: "personal",
    isPublic: false,
    completed: false,
    date: new Date(2026, 0, 30),
  },
  {
    id: "7",
    title: "Sprint Planning",
    type: "meeting",
    isPublic: true,
    completed: false,
    date: new Date(2026, 0, 31),
  },
  {
    id: "8",
    title: "Code review backlog",
    type: "personal",
    isPublic: false,
    completed: false,
    date: new Date(2026, 1, 1),
  },
]

export function MySchedule() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2026, 0, 29))
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)

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

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const handleTogglePrivacy = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isPublic: !task.isPublic } : task
      )
    )
  }

  const handleAddTask = (newTask: {
    title: string
    type: "meeting" | "personal"
    isPublic: boolean
    date: Date
  }) => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      type: newTask.type,
      isPublic: newTask.isPublic,
      completed: false,
      date: newTask.date,
    }
    setTasks((prev) => [...prev, task])
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-lg font-semibold text-foreground mb-4">My Schedule</h2>
      
      <ScheduleCalendar
        events={calendarEvents}
        selected={selectedDate}
        onSelect={setSelectedDate}
      />
      
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-foreground">
              {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Select a date"}
            </h3>
            <AddTaskDialog selectedDate={selectedDate} onAddTask={handleAddTask} />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-red-500" />
              Meeting
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground" />
              Personal
            </span>
          </div>
        </div>
        
        <TaskList
          tasks={filteredTasks}
          onToggleComplete={handleToggleComplete}
          onTogglePrivacy={handleTogglePrivacy}
        />
      </div>
    </div>
  )
}
