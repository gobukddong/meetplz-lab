"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarCheck, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/domain/auth/theme-toggle"
import { ProfileDropdown } from "@/components/domain/auth/profile-dropdown"
import { BriefingButton } from "@/components/domain/ai-briefing/briefing-button"
import { FriendDrawer } from "@/components/domain/friends/friend-drawer"

interface HeaderProps {
  user: any // Typed properly in production
}

export function Header({ user }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <header className="border-b border-border bg-card/40 backdrop-blur-sm sticky top-0 z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu - Top Left */}
              <button 
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="p-2 -ml-2 rounded-xl hover:bg-muted transition-all active:scale-95"
                aria-label="메뉴 열기"
              >
                <Menu className="size-6 text-foreground" />
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <CalendarCheck className="size-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground tracking-tight hidden sm:block">meetplz</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Right side: AI Briefing, Theme Toggle, Profile */}
              <BriefingButton />
              <ThemeToggle />
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Friend Drawer - Moved outside the blurred header wrapper */}
      <FriendDrawer 
        user={user}
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onOpen={() => setIsDrawerOpen(true)}
      />
    </>
  )
}
