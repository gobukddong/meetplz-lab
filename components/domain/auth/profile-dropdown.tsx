import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AddFriendDialog } from "@/components/domain/friends/add-friend-dialog"
import { ProfileDialog } from "./profile-dialog"
import { usePresence } from "@/components/providers/presence-provider"
import { cn } from "@/lib/utils/cn"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, Bell, HelpCircle, LogOut } from "lucide-react"

interface ProfileDropdownProps {
  user: any
}

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { onlineUsers } = usePresence()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (!user) {
    return (
      <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">
        로그인
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background relative">
          <Avatar className="size-8 ring-2 ring-primary/20 cursor-pointer hover:ring-primary/40 transition-all">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <span className={cn(
            "absolute bottom-0 right-0 size-3 border-2 border-background rounded-full shadow-sm",
            onlineUsers[user.id] ? "bg-emerald-500" : "bg-slate-400"
          )} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
            <User className="mr-2 size-4" />
            <span>프로필 수정</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 size-4" />
            <span>설정</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem>
          <HelpCircle className="mr-2 size-4" />
          <span>오류 제보하기</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 size-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <ProfileDialog 
        user={user} 
        open={isProfileOpen} 
        onOpenChange={setIsProfileOpen} 
      />
    </DropdownMenu>
  )
}
