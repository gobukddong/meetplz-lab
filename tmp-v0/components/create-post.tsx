"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarPlus, MapPin, Send } from "lucide-react"

export function CreatePost() {
  const [content, setContent] = useState("")

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src="/placeholder.svg" alt="User" />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">JD</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Plan a meeting..."
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[60px]"
            rows={2}
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1.5 h-8 px-2">
                <CalendarPlus className="size-4" />
                <span className="text-xs">Add Date/Time</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1.5 h-8 px-2">
                <MapPin className="size-4" />
                <span className="text-xs">Add Location</span>
              </Button>
            </div>
            <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 h-8">
              <Send className="size-3.5" />
              <span>Post</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
