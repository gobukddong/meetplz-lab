"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { sendMessage } from "@/app/actions/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Send } from "lucide-react"

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  user: {
    name: string | null
    avatar_url: string | null
  }
}

interface ChatRoomProps {
  meetingId: string
  initialMessages: any[]
  currentUserId: string
}

export function ChatRoom({ meetingId, initialMessages, currentUserId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    // Scroll to bottom on load and new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`meeting:${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `meeting_id=eq.${meetingId}`,
        },
        async (payload) => {
          // Fetch the user profile for the new message
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", payload.new.user_id)
            .single()

          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            user_id: payload.new.user_id,
            user: profile || { name: "Unknown", avatar_url: "" },
          }

          setMessages((prev) => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [meetingId, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    setIsLoading(true)
    try {
      await sendMessage(meetingId, inputValue)
      setInputValue("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border border-border rounded-xl bg-card overflow-hidden">
      <div className="p-4 border-b border-border bg-card/50 flex justify-between items-center">
        <h3 className="font-semibold text-foreground">채팅방</h3>
        <span className="text-xs text-muted-foreground">{messages.length}개의 메시지</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => {
            const isMe = msg.user_id === currentUserId
            const displayName = msg.user.name || "Unknown"
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {!isMe && (
                  <Avatar className="size-8">
                    <AvatarImage src={msg.user.avatar_url || undefined} />
                    <AvatarFallback>{displayName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  {!isMe && (
                    <span className="text-xs text-muted-foreground mb-1 ml-1">
                      {displayName}
                    </span>
                  )}
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm max-w-[240px] break-words ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {format(new Date(msg.created_at), "HH:mm", { locale: ko })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-border bg-card/50 flex gap-2">
        <Input
          placeholder="메시지를 입력하세요..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  )
}
