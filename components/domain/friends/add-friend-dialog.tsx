"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { searchUsers, sendFriendRequest } from "@/app/actions/friends"
import { UserPlus, Search, Loader2, Check, Clock } from "lucide-react"

interface AddFriendDialogProps {
  trigger?: React.ReactNode
}

export function AddFriendDialog({ trigger }: AddFriendDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const data = await searchUsers(query)
      setResults(data)
    } finally {
      setIsSearching(false)
    }
  }

  const handleRequest = async (friendId: string) => {
    setIsLoading(true)
    try {
      await sendFriendRequest(friendId)
      // Update local state to show pending
      setResults(prev => prev.map(r => r.id === friendId ? { ...r, status: "pending", isOutgoing: true } : r))
    } catch (error) {
      console.error("Failed to send request:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="size-4" />
          <span>친구 추가</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>친구 찾기</DialogTitle>
          <DialogDescription>
            이름이나 이메일로 친구를 검색해 보세요.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSearch} className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="이름 또는 이메일..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={isSearching}>
            {isSearching ? <Loader2 className="size-4 animate-spin" /> : "검색"}
          </Button>
        </form>

        <div className="mt-6 space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {results.length > 0 ? (
            results.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 border border-border/50">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.name?.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                
                {user.status === "accepted" ? (
                  <Button variant="ghost" size="sm" disabled className="gap-1.5 text-primary">
                    <Check className="size-3.5" />
                    <span>친구</span>
                  </Button>
                ) : user.status === "pending" ? (
                  <Button variant="secondary" size="sm" disabled className="gap-1.5">
                    <Clock className="size-3.5" />
                    <span>{user.isOutgoing ? "요청됨" : "확인 대기"}</span>
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handleRequest(user.id)}
                    disabled={isLoading}
                  >
                    추가
                  </Button>
                )}
              </div>
            ))
          ) : query && !isSearching ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-xs">함께 일정을 관리할 친구를 찾아보세요!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
