"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { BriefingDialog } from "./briefing-dialog"
import { useState } from "react"

export function BriefingButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <Sparkles className="size-4" />
        <span className="hidden sm:inline">AI 브리핑</span>
      </Button>
      <BriefingDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
