"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarPlus, MapPin, Send, X } from "lucide-react"
import { createMeeting } from "@/app/actions/meetings"
import { format } from "date-fns"

interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
}

interface CreatePostProps {
  user?: UserProfile | null
}

export function CreatePost({ user }: CreatePostProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState("") 
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [time, setTime] = useState("19:00")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !location.trim()) return
    
    setIsLoading(true)
    const formData = new FormData()
    formData.append("title", title)
    formData.append("location", location)
    formData.append("date", date)
    formData.append("time", time)
    formData.append("description", description)

    try {
        await createMeeting({}, formData) // State arg is minimal
        // Reset
        setTitle("")
        setDescription("")
        setLocation("")
        setIsExpanded(false)
    } catch (e) {
        console.error("Failed to create meeting", e)
    } finally {
        setIsLoading(false)
    }
  }

  if (!isExpanded) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setIsExpanded(true)}>
             <div className="flex gap-3 items-center text-muted-foreground">
                <Avatar className="size-8 shrink-0">
                    <AvatarImage src={user?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{user?.name?.substring(0, 2) || "?"}</AvatarFallback>
                </Avatar>
                <div className="text-sm">새 모임을 만드세요!</div>
             </div>
        </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-sm">새 모임</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(false)}>
            <X className="size-4" />
        </Button>
      </div>

      <div className="space-y-3">
          <input 
            className="w-full bg-transparent border-b border-border p-2 text-sm focus:outline-none focus:border-primary" 
            placeholder="모임 제목" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this meeting about?"
            className="w-full resize-none bg-transparent rounded-md border border-border p-2 text-sm focus:outline-none focus:border-primary min-h-[60px]"
            rows={2}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 border border-border rounded-md p-2">
               <MapPin className="size-4 text-muted-foreground" />
               <input 
                 className="w-full bg-transparent text-xs focus:outline-none" 
                 placeholder="Location"
                 value={location}
                 onChange={e => setLocation(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-2 border border-border rounded-md p-2">
               <CalendarPlus className="size-4 text-muted-foreground" />
               <input 
                 type="date"
                 className="bg-transparent text-xs focus:outline-none" 
                 value={date}
                 onChange={e => setDate(e.target.value)}
               />
               <input 
                 type="time"
                 className="bg-transparent text-xs focus:outline-none" 
                 value={time}
                 onChange={e => setTime(e.target.value)}
               />
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button 
              size="sm" 
              className="gap-1.5 bg-primary hover:bg-primary/90 h-8"
              onClick={handleSubmit}
              disabled={!title.trim() || isLoading}
            >
              {isLoading ? "Posting..." : (
                  <>
                    <Send className="size-3.5" />
                    <span>Post Meeting</span>
                  </>
              )}
            </Button>
          </div>
      </div>
    </div>
  )
}

