"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BriefingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BriefingDialog({ open, onOpenChange }: BriefingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Briefing</DialogTitle>
          <DialogDescription>
            Your daily schedule summary and motivational message
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            AI Briefing feature will be implemented here.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
