"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Calendar, Users, User } from "lucide-react"

export interface AddTaskDialogProps {
  selectedDate: Date | undefined
  onAddTask: (task: {
    title: string
    type: "meeting" | "personal"
    isPublic: boolean
    date: Date
  }) => void
}

export function AddTaskDialog({ selectedDate, onAddTask }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"meeting" | "personal">("meeting")
  const [isPublic, setIsPublic] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !selectedDate) return
    
    onAddTask({
      title: title.trim(),
      type,
      isPublic,
      date: selectedDate,
    })
    
    setTitle("")
    setType("meeting")
    setIsPublic(true)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 h-7 px-2 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary bg-transparent"
        >
          <Plus className="size-3.5" />
          <span>Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm text-foreground">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-foreground">Task Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "meeting" ? "default" : "outline"}
                size="sm"
                className={`flex-1 gap-1.5 ${type === "meeting" ? "bg-red-500 hover:bg-red-600" : "border-border"}`}
                onClick={() => setType("meeting")}
              >
                <Users className="size-3.5" />
                Meeting
              </Button>
              <Button
                type="button"
                variant={type === "personal" ? "default" : "outline"}
                size="sm"
                className={`flex-1 gap-1.5 ${type === "personal" ? "bg-muted-foreground hover:bg-muted-foreground/80" : "border-border"}`}
                onClick={() => setType("personal")}
              >
                <User className="size-3.5" />
                Personal
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-foreground">Visibility</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isPublic ? "default" : "outline"}
                size="sm"
                className={`flex-1 ${isPublic ? "bg-primary hover:bg-primary/90" : "border-border"}`}
                onClick={() => setIsPublic(true)}
              >
                Public
              </Button>
              <Button
                type="button"
                variant={!isPublic ? "default" : "outline"}
                size="sm"
                className={`flex-1 ${!isPublic ? "bg-muted-foreground hover:bg-muted-foreground/80" : "border-border"}`}
                onClick={() => setIsPublic(false)}
              >
                Private
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {selectedDate 
                ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
                : "Select a date first"}
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border bg-transparent"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!title.trim() || !selectedDate}
            >
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
