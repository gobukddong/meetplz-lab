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
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"
import { getFriends, getPendingRequests, acceptFriendRequest, deleteFriend } from "@/app/actions/friends"
import { AddFriendDialog } from "./add-friend-dialog"

interface FriendDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function FriendDrawer({ isOpen, onClose }: FriendDrawerProps) {
  const [friends, setFriends] = useState<any[]>([])
  const [pending, setPending] = useState<{ incoming: any[], outgoing: any[] }>({ incoming: [], outgoing: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

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
    if (isOpen) fetchData()
  }, [isOpen])

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
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  return (
    <>
      {/* Overlay for better visibility */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/40 backdrop-blur-[2px] z-50 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 left-0 bottom-0 w-[280px] bg-[#2b2d31] text-[#dbdee1] z-50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col border-r border-black/20",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header - Search Pill Style */}
        <div className="h-12 flex items-center px-3 bg-[#2b2d31] border-b border-black/10">
          <div className="flex items-center gap-2 bg-[#1e1f22] px-3 py-1.5 rounded-lg w-full shadow-inner text-[#949ba4] cursor-text transition-all hover:bg-[#1a1b1e]">
            <Search className="size-4" />
            <span className="font-bold text-xs">검색</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }} 
              className="ml-auto p-0.5 hover:text-white transition-all opacity-50 hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content - Full Height Vertical List */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-2 space-y-4 bg-[#2b2d31]">
          {/* Main Navigation Items */}
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-[#3f4147] text-white transition-all shadow-sm">
              <Users className="size-6 text-[#dbdee1]" />
              <span className="font-bold text-sm">친구</span>
            </button>
          </div>

          {/* DM Section */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between px-2 mb-2 group">
              <h3 className="text-[11px] font-bold text-[#949ba4] uppercase tracking-wider group-hover:text-[#dbdee1] transition-colors">다이렉트 메시지</h3>
              <AddFriendDialog 
                trigger={
                  <button className="p-0.5 text-[#949ba4] hover:text-[#dbdee1] transition-colors">
                    <Plus className="size-4" />
                  </button>
                } 
              />
            </div>

            {/* Pending Requests */}
            {pending.incoming.length > 0 && (
              <div className="mb-4 space-y-1">
                {pending.incoming.map((req) => (
                  <div key={req.requestId} className="flex items-center gap-3 px-2 py-2 rounded-xl bg-[#5865f2]/10 group border border-[#5865f2]/20 shadow-inner">
                    <Avatar className="size-8">
                      <AvatarImage src={req.avatar_url} />
                      <AvatarFallback className="bg-[#5865f2] text-white text-[10px]">{req.name?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{req.name}</p>
                      <p className="text-[10px] text-[#5865f2] font-bold">친구 요청</p>
                    </div>
                    <button 
                      onClick={() => handleAccept(req.requestId)}
                      className="p-1.5 rounded-full bg-[#1e1f22] text-[#23a559] hover:bg-[#23a559] hover:text-white transition-all shadow-sm"
                    >
                      <Check className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Friends List - Vertical & High Polish */}
            <div className="space-y-0.5">
              {isLoading ? (
                <div className="flex justify-center py-10 opacity-30">
                   <Loader2 className="size-6 animate-spin" />
                </div>
              ) : friends.length > 0 ? (
                friends.map((friend) => (
                  <div key={friend.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#35373c] group transition-all cursor-pointer">
                    <div className="relative shrink-0">
                      <Avatar className="size-8 border border-white/5">
                        <AvatarImage src={friend.avatar_url} />
                        <AvatarFallback className="bg-[#35373c] text-[#949ba4] text-xs font-bold">{friend.name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-[-1px] right-[-1px] size-3 bg-[#23a559] border-[2.5px] border-[#2b2d31] rounded-full shadow-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#949ba4] group-hover:text-[#dbdee1] truncate transition-colors">{friend.name}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <p className="text-[11px] text-[#949ba4] leading-relaxed">친구가 아직 없습니다.<br/>새로운 친구를 추가해 보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Footer - Desktop Style but in Drawer */}
        <div className="h-16 bg-[#232428] px-3 flex items-center gap-2 mt-auto border-t border-black/10">
          <div className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#3f4147] flex-1 min-w-0 cursor-pointer group transition-all">
             <div className="relative">
                <Avatar className="size-8 border border-white/5">
                  <AvatarFallback className="bg-[#5865f2] text-white font-bold text-xs">MF</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-[-1px] right-[-1px] size-3 bg-[#23a559] border-[2.5px] border-[#232428] rounded-full" />
             </div>
             <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate leading-tight">사용자</span>
                <span className="text-[10px] text-[#b5bac1] truncate font-medium">온라인</span>
             </div>
          </div>
          <div className="flex items-center">
             <button className="p-2 rounded-lg hover:bg-[#3f4147] text-[#b5bac1] hover:text-[#dbdee1] transition-all">
                <Settings className="size-4.5" />
             </button>
          </div>
        </div>
      </div>
    </>
  )
}
