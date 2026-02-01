"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateNickname } from "@/lib/actions/user"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ProfileDialogProps {
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ user, open, onOpenChange }: ProfileDialogProps) {
  const [name, setName] = useState(user?.name || "")
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || name === user?.name) {
      onOpenChange(false)
      return
    }

    setIsPending(true)
    try {
      await updateNickname(name)
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      alert("별명 변경에 실패했습니다.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
            <DialogDescription>
              내 정보를 확인하고 별명을 변경할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs text-muted-foreground">이메일</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">별명</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="새로운 별명을 입력하세요"
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              저장하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
