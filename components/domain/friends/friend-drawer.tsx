"use client"

import { useState, useEffect } from "react"
import { 
  X, 
  Users, 
  MessageSquare, 
  Search,
  Plus,
  Settings,
  MoreVertical,
  Check,
  Loader2,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"
import { deleteFriend, getPendingRequests, acceptFriendRequest, getFriends } from "@/lib/actions/friends"
import { AddFriendDialog } from "./add-friend-dialog"
import { ProfileDialog } from "../auth/profile-dialog"
import { DMChatDialog } from "./dm-chat-dialog"
import { FriendScheduleDialog } from "./friend-schedule-dialog"
import { usePresence } from "@/components/providers/presence-provider"

interface FriendDrawerProps {
  user: any
  isOpen: boolean
  onClose: () => void
  onOpen?: () => void
}

export function FriendDrawer({ user, isOpen, onClose, onOpen }: FriendDrawerProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<any>(null)
  const [scheduleFriend, setScheduleFriend] = useState<any>(null)
  const [activeActionFriend, setActiveActionFriend] = useState<any>(null)
  const [activeActionIndex, setActiveActionIndex] = useState<number>(-1)
  const [friends, setFriends] = useState<any[]>([])
  const [pending, setPending] = useState<{ incoming: any[], outgoing: any[] }>({ incoming: [], outgoing: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { onlineUsers } = usePresence()

  const fetchData = async () => {
    if (!isOpen) return
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
    if (isOpen) {
      fetchData()
      setSearchQuery("") // Reset search when opening
      setActiveActionFriend(null) // Reset action panel
    }
  }, [isOpen])

  const filteredFriends = friends.filter(friend => 
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAccept = async (requestId: string) => {
    setIsProcessing(requestId)
    try {
      await acceptFriendRequest(requestId)
      await fetchData()
    } finally {
      setIsProcessing(null)
    }
  }

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveActionFriend(null)
        onClose()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

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
    <>
      {/* Overlay for better visibility */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/40 backdrop-blur-[2px] z-50 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => {
            setActiveActionFriend(null)
            onClose()
        }}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 left-0 bottom-0 w-[280px] bg-card text-card-foreground z-[60] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col border-r border-border",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Action Panel (Flyout) */}
        <div 
          className={cn(
            "absolute left-[280px] w-36 bg-white dark:bg-card border border-border shadow-[10px_0_30px_rgba(0,0,0,0.12)] dark:shadow-[10px_0_30px_rgba(0,0,0,0.3)] rounded-2xl py-2 px-1 flex flex-col gap-1 transition-all duration-300 ease-out z-[100]",
            isOpen && activeActionFriend ? "opacity-100 scale-100 translate-x-2" : "opacity-0 scale-95 -translate-x-2 pointer-events-none"
          )}
          style={{ 
            top: activeActionIndex !== -1 ? `${100 + activeActionIndex * 60}px` : "50%",
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
              onClose() // Auto close drawer
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
              onClose() // Auto close drawer
            }}
          >
            <Calendar className="size-4" />
            일정보기
          </Button>
        </div>

        {/* Header - Search Pill Style */}
        <div className="h-14 flex items-center px-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-xl w-full border border-border/50 text-muted-foreground focus-within:bg-muted focus-within:ring-1 focus-within:ring-primary/30 transition-all group">
            <Search className="size-4 shrink-0" />
            <input
              type="text"
              placeholder="친구 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xs font-medium w-full placeholder:text-muted-foreground/60 outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="p-0.5 hover:text-foreground transition-all"
              >
                <X className="size-3" />
              </button>
            )}
            {!searchQuery && (
              <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }} 
                className="p-1 rounded-lg hover:bg-background hover:text-foreground transition-all opacity-50 hover:opacity-100"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content - Vertical List */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-6">
          {/* DM Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 group">
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">친구 목록</h3>
              <button 
                type="button"
                onClick={() => {
                  setIsAddFriendOpen(true)
                  onClose()
                }}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                suppressHydrationWarning
              >
                <Plus className="size-4" />
              </button>
            </div>

            {/* Pending Requests */}
            {pending.incoming.length > 0 && (
              <div className="space-y-1">
                {pending.incoming.map((req) => (
                  <div key={req.requestId} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-primary/5 group border border-primary/10 transition-all hover:bg-primary/10">
                    <Avatar className="size-9 border-2 border-background shadow-sm">
                      <AvatarImage src={req.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{req.name?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{req.name}</p>
                      <p className="text-[10px] text-primary font-bold">친구 요청</p>
                    </div>
                    <button 
                      onClick={() => handleAccept(req.requestId)}
                      className="p-2 rounded-xl bg-background text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-border/50"
                    >
                      <Check className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Friends List */}
            <div className="space-y-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-20">
                   <Loader2 className="size-6 animate-spin text-primary" />
                   <p className="text-[10px] font-medium">친구 불러오는 중...</p>
                </div>
              ) : filteredFriends.length > 0 ? (
                filteredFriends.map((friend, index) => (
                  <div 
                    key={friend.id} 
                    onClick={() => handleFriendClick(friend, index)}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-all cursor-pointer border border-transparent",
                        activeActionFriend?.id === friend.id 
                            ? "bg-primary/10 border-primary/20 scale-[1.02]" 
                            : "hover:bg-muted/50 hover:border-border/50"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="size-9 border-2 border-background shadow-sm">
                        <AvatarImage src={friend.avatar_url} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">{friend.name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        "absolute bottom-0 right-0 size-3 border-2 border-background rounded-full shadow-sm",
                        onlineUsers[friend.id] ? "bg-emerald-500" : "bg-slate-400"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                          "text-sm font-medium transition-colors truncate",
                          activeActionFriend?.id === friend.id ? "text-primary" : "text-foreground/80 group-hover:text-foreground"
                      )}>{friend.name}</p>
                    </div>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="text-center py-12 px-6 flex flex-col items-center gap-3">
                  <p className="text-[11px] text-muted-foreground font-medium">검색 결과가 없습니다.</p>
                </div>
              ) : (
                <div className="text-center py-12 px-6 flex flex-col items-center gap-3">
                  <div className="p-3 rounded-2xl bg-muted/30 text-muted-foreground/30">
                    <Users className="size-8" />
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-medium">친구가 아직 없습니다.<br/>새로운 친구를 추가해 보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Footer - Static View */}
        <div className="p-4 bg-muted/20 border-t border-border mt-auto backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 p-1 flex-1 min-w-0">
               <div className="relative">
                  <Avatar className="size-9 border-2 border-background shadow-sm">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                      {user?.name?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className={cn(
                    "absolute bottom-0 right-0 size-3 border-2 border-background rounded-full shadow-sm",
                    onlineUsers[user?.id] ? "bg-emerald-500" : "bg-slate-400"
                  )} />
               </div>
               <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-foreground truncate leading-tight">{user?.name || "사용자"}</span>
                  <span className="text-[10px] text-muted-foreground truncate font-medium">
                    {onlineUsers[user?.id] ? "online" : "offline"}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>


      <ProfileDialog 
        user={user} 
        open={isProfileOpen} 
        onOpenChange={setIsProfileOpen} 
      />

      <AddFriendDialog
        open={isAddFriendOpen}
        onOpenChange={(open) => {
          setIsAddFriendOpen(open)
          if (!open) {
            onOpen?.()
          }
        }}
      />

      <FriendScheduleDialog
        friend={scheduleFriend}
        open={!!scheduleFriend}
        onOpenChange={(open) => {
            if (!open) {
                setScheduleFriend(null)
                onOpen?.()
            }
        }}
      />

      <DMChatDialog
        friend={selectedFriend}
        open={!!selectedFriend}
        onOpenChange={(open) => {
            if (!open) {
                setSelectedFriend(null)
                onOpen?.()
            }
        }}
        currentUserId={user?.id}
      />
    </>
  )
}
