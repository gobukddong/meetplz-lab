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
} from "@/app/actions/friends"
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Loader2, 
  ChevronRight,
  MoreVertical
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils/cn"

export function FriendSidebar() {
  const [friends, setFriends] = useState<any[]>([])
  const [pending, setPending] = useState<{ incoming: any[], outgoing: any[] }>({ incoming: [], outgoing: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

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

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      <div className="flex-1 overflow-y-auto p-0 space-y-6 no-scrollbar">
        {/* Pending Requests */}
        {pending.incoming.length > 0 && (
          <div className="space-y-3">
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
        <div className="space-y-3">
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
              {friends.map((friend) => (
                <div key={friend.id} className="group flex items-center justify-between gap-2 p-2 rounded-xl transition-all hover:bg-muted/50">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative">
                      <Avatar className="size-10 border border-border/50">
                        <AvatarImage src={friend.avatar_url} />
                        <AvatarFallback>{friend.name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 border-2 border-background rounded-full" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{friend.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate">{friend.email}</span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="text-sm">
                        프로필 보기
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-sm">
                        채팅하기
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-sm text-destructive focus:text-destructive"
                        onClick={() => handleDelete(friend.requestId)}
                      >
                        친구 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
    </div>
  )
}
