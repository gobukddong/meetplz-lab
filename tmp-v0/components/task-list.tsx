"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Lock, Globe } from "lucide-react"
import { cn } from "@/tmp-v0/lib/utils"

interface Task {
  id: string
  title: string
  type: "meeting" | "personal"
  isPublic: boolean
  completed: boolean
}

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (id: string) => void
  onTogglePrivacy: (id: string) => void
}

export function TaskList({ tasks, onToggleComplete, onTogglePrivacy }: TaskListProps) {
  return (
    <div className="space-y-2">
      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          No tasks for this date
        </p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 transition-all hover:bg-accent/50",
              task.completed && "opacity-60"
            )}
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium text-foreground truncate",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "size-2 rounded-full",
                  task.type === "meeting" ? "bg-primary" : "bg-muted-foreground"
                )}
              />
              <button
                type="button"
                onClick={() => onTogglePrivacy(task.id)}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  task.isPublic
                    ? "text-primary hover:bg-primary/10"
                    : "text-muted-foreground hover:bg-muted"
                )}
                aria-label={task.isPublic ? "Make private" : "Make public"}
              >
                {task.isPublic ? (
                  <Globe className="size-4" />
                ) : (
                  <Lock className="size-4" />
                )}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
