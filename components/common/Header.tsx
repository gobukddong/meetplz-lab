"use client"

import Link from "next/link"
import { CalendarCheck } from "lucide-react"
import { ThemeToggle } from "@/components/domain/auth/theme-toggle"
import { ProfileDropdown } from "@/components/domain/auth/profile-dropdown"
import { BriefingButton } from "@/components/domain/ai-briefing/briefing-button"

export function Header() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <CalendarCheck className="size-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">meetplz</span>
          </Link>

          {/* Right side: AI Briefing, Theme Toggle, Profile */}
          <div className="flex items-center gap-2">
            <BriefingButton />
            <ThemeToggle />
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  )
}
