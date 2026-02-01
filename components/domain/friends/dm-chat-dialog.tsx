"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { sendDirectMessage, getDirectMessages } from "@/lib/actions/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Send, Loader2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface DMChatDialogProps {
  friend: any
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
}

export function DMChatDialog({ friend, open, onOpenChange, currentUserId }: DMChatDialogProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Initial load
  useEffect(() => {
    if (open && friend) {
      loadMessages()
    }
  }, [open, friend])

  const loadMessages = async () => {
    setIsLoading(true)
    try {
      const data = await getDirectMessages(friend.id)
      setMessages(data)
    } finally {
      setIsLoading(false)
    }
  }

  // Realtime subscription
  useEffect(() => {
    if (!open || !friend) return

    const channel = supabase
      .channel(`dm_conversation`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        async (payload) => {
          const newMsg = payload.new as any
          
          // Filter: only messages for the current 1:1 conversation
          const isRelevant = (newMsg.sender_id === currentUserId && newMsg.receiver_id === friend.id) ||
                             (newMsg.sender_id === friend.id && newMsg.receiver_id === currentUserId)

          if (!isRelevant) return

          // Fetch the full message with sender profile
          const { data, error } = await (supabase as any)
            .from("direct_messages")
            .select(`
              id,
              sender_id,
              receiver_id,
              content,
              created_at,
              sender:profiles!sender_id(name, avatar_url)
            `)
            .eq("id", newMsg.id)
            .single()

          if (data && !error) {
            setMessages((prev) => {
              // Prevent duplicate messages (especially for the sender)
              if (prev.some(m => m.id === data.id)) return prev
              return [...prev, data]
            })
          }
        }
      )
      .subscribe()


    return () => {
      supabase.removeChannel(channel)
    }
  }, [open, friend, currentUserId])

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSending) return

    const messageContent = content.trim()
    setIsSending(true)
    
    // Optimistic update for immediate feedback
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      receiver_id: friend.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      sender: {
        name: "나", // Placeholder for self
        avatar_url: null
      }
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setContent("")

    try {
      await sendDirectMessage(friend.id, messageContent)
    } catch (error) {
      console.error("Failed to send DM:", error)
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter(m => m.id !== optimisticMsg.id))
      alert("메시지 전송에 실패했습니다.")
    } finally {
      setIsSending(false)
    }
  }


  if (!friend) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden flex flex-col h-[600px]">
        <DialogHeader className="p-4 border-b border-border flex flex-row items-center gap-3 space-y-0">
          <Avatar className="size-10">
            <AvatarImage src={friend.avatar_url} />
            <AvatarFallback>{friend.name?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <DialogTitle className="text-base">{friend.name}님과의 대화</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 p-4 overflow-y-auto no-scrollbar" ref={scrollRef}>
          <div className="flex flex-col">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <MessageSquare className="size-10 opacity-20" />
                <p className="text-sm">첫 메시지를 보내보세요!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = msg.sender_id === currentUserId
                const prevMsg = messages[idx - 1]
                const nextMsg = messages[idx + 1]
                
                // Grouping logic
                const isSameMinuteAsPrev = prevMsg && (() => {
                  const currentM = new Date(msg.created_at).getMinutes()
                  const currentH = new Date(msg.created_at).getHours()
                  const prevM = new Date(prevMsg.created_at).getMinutes()
                  const prevH = new Date(prevMsg.created_at).getHours()
                  return currentM === prevM && currentH === prevH && msg.sender_id === prevMsg.sender_id
                })()

                const showTime = !nextMsg || (() => {
                  const currentM = new Date(msg.created_at).getMinutes()
                  const currentH = new Date(msg.created_at).getHours()
                  const nextM = new Date(nextMsg.created_at).getMinutes()
                  const nextH = new Date(nextMsg.created_at).getHours()
                  const sameTime = currentM === nextM && currentH === nextH
                  const sameSender = msg.sender_id === nextMsg.sender_id
                  return !(sameTime && sameSender)
                })()

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2 w-full",
                      isMine ? "justify-end" : "justify-start",
                      isSameMinuteAsPrev ? "mt-1" : "mt-4"
                    )}
                  >
                    {!isMine && (
                      <div className="w-8 shrink-0">
                        {!isSameMinuteAsPrev && (
                          <Avatar className="size-8">
                            <AvatarImage src={msg.sender?.avatar_url} />
                            <AvatarFallback className="text-[10px]">
                              {msg.sender?.name?.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )}
                    <div className={cn(
                      "flex flex-col gap-1 max-w-[70%]",
                      isMine ? "items-end" : "items-start"
                    )}>
                      <div
                        className={cn(
                          "px-3 py-2 rounded-2xl text-sm shadow-sm",
                          isMine
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted text-foreground rounded-tl-none"
                        )}
                      >
                        {msg.content}
                      </div>
                      {showTime && (
                        <span className="text-[10px] text-muted-foreground px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-card">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="메시지를 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button size="icon" type="submit" disabled={!content.trim() || isSending}>
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
