"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Lock, LockOpen, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export interface Task {
  id: string
  title: string
  type: "meeting" | "personal"
  isPublic: boolean
  completed: boolean
  time?: string
}

interface TaskListProps {
  tasks: Task[]
  onToggleComplete?: (id: string) => void
  onTogglePrivacy?: (id: string) => void
  onEdit?: (task: Task) => void
  onDelete?: (id: string) => void
}

export function TaskList({ tasks, onToggleComplete, onTogglePrivacy, onEdit, onDelete }: TaskListProps) {
  return (
    <div className="space-y-2.5">
      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          일정이 없습니다...
        </p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_20px_-6px_rgba(255,255,255,0.05)] transition-all hover:shadow-[0_12px_25px_-8px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_25px_-8px_rgba(255,255,255,0.1)]",
              task.type === "meeting" 
                ? "bg-rose-500/5 dark:bg-rose-500/10 border-l-4 border-rose-500" 
                : "bg-muted/50 border-l-4 border-muted-foreground/30",
              task.completed && "opacity-60"
            )}
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={onToggleComplete ? () => onToggleComplete(task.id) : undefined}
              disabled={!onToggleComplete}
              className={cn(
                "data-[state=checked]:border-primary",
                task.type === "meeting" ? "data-[state=checked]:bg-rose-500 border-rose-500/30" : "data-[state=checked]:bg-primary"
              )}
            />
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium text-foreground truncate",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.time && <span className="text-muted-foreground font-normal mr-2">[{task.time}]</span>}
                {task.title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Edit task"
                >
                  <Pencil className="size-4" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  aria-label="Delete task"
                >
                  <Trash2 className="size-4" />
                </button>
              )}

              {onTogglePrivacy && (
                <button
                  type="button"
                  onClick={() => onTogglePrivacy(task.id)}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label={task.isPublic ? "Make private" : "Make public"}
                >
                  {task.isPublic ? (
                    <LockOpen className="size-4 scale-x-[1]" />
                  ) : (
                    <Lock className="size-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
