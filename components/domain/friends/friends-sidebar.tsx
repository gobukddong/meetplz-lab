"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  getFriends, 
  getPendingRequests, 
  acceptFriendRequest, 
  deleteFriend 
} from "@/lib/actions/friends"
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Loader2, 
  ChevronRight,
  MoreVertical,
  Calendar,
  MessageSquare
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DMChatDialog } from "./dm-chat-dialog"
import { FriendScheduleDialog } from "./friend-schedule-dialog"
import { cn } from "@/lib/utils/cn"
import { usePresence } from "@/components/providers/presence-provider"

interface FriendSidebarProps {
  user: any
}

export function FriendSidebar({ user }: FriendSidebarProps) {
  const [selectedFriend, setSelectedFriend] = useState<any>(null)
  const [scheduleFriend, setScheduleFriend] = useState<any>(null)
  const [activeActionFriend, setActiveActionFriend] = useState<any>(null)
  const [activeActionIndex, setActiveActionIndex] = useState<number>(-1)
  const [friends, setFriends] = useState<any[]>([])
  const [pending, setPending] = useState<{ incoming: any[], outgoing: any[] }>({ incoming: [], outgoing: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const { onlineUsers } = usePresence()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [friendList, pendingReqs] = await Promise.all([
        getFriends(),
        getPendingRequests()
      ])
      setFriends(friendList)
      setPending(pendingReqs)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAccept = async (requestId: string) => {
    setIsProcessing(requestId)
    try {
      await acceptFriendRequest(requestId)
      await fetchData()
    } finally {
      setIsProcessing(null)
    }
  }

  const handleDelete = async (requestId: string) => {
    setIsProcessing(requestId)
    try {
      await deleteFriend(requestId)
      await fetchData()
    } finally {
      setIsProcessing(null)
    }
  }

  const handleFriendClick = (friend: any, index: number) => {
    if (activeActionFriend?.id === friend.id) {
        setActiveActionFriend(null)
        setActiveActionIndex(-1)
    } else {
        setActiveActionFriend(friend)
        setActiveActionIndex(index)
    }
  }

  return (
    <div className="flex flex-col h-full bg-transparent overflow-visible relative">
      <div className="flex-1 overflow-y-auto p-0 space-y-6 no-scrollbar overflow-x-visible">
        {/* Action Panel (Flyout - Appears to the LEFT) */}
        <div 
          className={cn(
            "absolute right-[calc(100%+12px)] w-36 bg-white dark:bg-card border border-border shadow-[-10px_0_30px_rgba(0,0,0,0.12)] dark:shadow-[-10px_0_30px_rgba(0,0,0,0.3)] rounded-2xl py-2 px-1 flex flex-col gap-1 transition-all duration-300 ease-out z-[100]",
            activeActionFriend ? "opacity-100 scale-100 -translate-x-2" : "opacity-0 scale-95 translate-x-2 pointer-events-none"
          )}
          style={{ 
            top: activeActionIndex !== -1 ? `${140 + activeActionIndex * 60}px` : "50%",
          }}
        >
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-1.5 truncate border-b border-border/50 mb-1">
            {activeActionFriend?.name}
          </p>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2.5 h-10 text-[13px] font-medium hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
            onClick={() => {
              setSelectedFriend(activeActionFriend)
              setActiveActionFriend(null)
            }}
          >
            <MessageSquare className="size-4" />
            채팅하기
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2.5 h-10 text-[13px] font-medium hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
            onClick={() => {
              setScheduleFriend(activeActionFriend)
              setActiveActionFriend(null)
            }}
          >
            <Calendar className="size-4" />
            일정보기
          </Button>
        </div>

        {/* Pending Requests */}
        {pending.incoming.length > 0 && (
          <div className="space-y-3 px-1">
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
              친구 요청 ({pending.incoming.length})
            </h4>
            <div className="space-y-2">
              {pending.incoming.map((req) => (
                <div key={req.requestId} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-primary/5 border border-primary/10 transition-all hover:bg-primary/10">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Avatar className="size-8 border border-white/10">
                      <AvatarImage src={req.avatar_url} />
                      <AvatarFallback className="text-[10px]">{req.name?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate">{req.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="size-7 text-primary hover:bg-primary/20"
                      onClick={() => handleAccept(req.requestId)}
                      disabled={!!isProcessing}
                    >
                      {isProcessing === req.requestId ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-4" />}
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(req.requestId)}
                      disabled={!!isProcessing}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friend List */}
        <div className="space-y-3 px-1">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
            친구 ({friends.length})
          </h4>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-50">
              <Loader2 className="size-5 animate-spin text-primary" />
              <p className="text-[10px]">목록을 불러오는 중...</p>
            </div>
          ) : friends.length > 0 ? (
            <div className="space-y-1">
              {friends.map((friend, index) => (
                <div 
                    key={friend.id} 
                    className={cn(
                        "group flex items-center justify-between gap-2 p-2 rounded-xl transition-all cursor-pointer border border-transparent",
                        activeActionFriend?.id === friend.id 
                            ? "bg-primary/10 border-primary/20 scale-[1.02]" 
                            : "hover:bg-muted/50 hover:border-border/50"
                    )}
                    onClick={() => handleFriendClick(friend, index)}
                >
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                      <div className="relative">
                        <Avatar className="size-10 border border-border/50">
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback>{friend.name?.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className={cn(
                          "absolute bottom-0 right-0 size-2.5 border-2 border-background rounded-full",
                          onlineUsers[friend.id] ? "bg-emerald-500" : "bg-slate-400"
                        )} />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className={cn(
                            "text-sm font-medium truncate transition-colors",
                            activeActionFriend?.id === friend.id ? "text-primary" : "text-foreground/80 group-hover:text-foreground"
                        )}>{friend.name}</span>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <div className="p-3 rounded-full bg-muted/50 text-muted-foreground/50">
                <UserPlus className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">아직 친구가 없습니다.</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">상단 버튼으로 친구를 찾아보세요!</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Info or Invite */}
      <div className="p-4 bg-muted/10 border-t border-border/50">
        <Button variant="outline" className="w-full h-9 text-xs gap-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all">
          <ChevronRight className="size-3 text-muted-foreground" />
          모임에 친구 초대하기
        </Button>
      </div>

      <FriendScheduleDialog
        friend={scheduleFriend}
        open={!!scheduleFriend}
        onOpenChange={(open) => !open && setScheduleFriend(null)}
      />

      <DMChatDialog
        friend={selectedFriend}
        open={!!selectedFriend}
        onOpenChange={(open) => !open && setSelectedFriend(null)}
        currentUserId={user?.id}
      />
    </div>
  )
}
