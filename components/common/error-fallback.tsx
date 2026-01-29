"use client"

import Link from "next/link"
import { MessageSquareWarning } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ErrorFallbackProps {
  title?: string
  description?: string
  reset?: () => void
}

export function ErrorFallback({
  title = "원하는 정보를 불러오지 못했어요",
  description = "일시적인 문제일 수 있습니다. 잠시 후 다시 시도하거나 메인 화면으로 이동해 주세요.",
  reset,
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center justify-center rounded-lg border bg-card p-8 text-center shadow-sm">
        <div className="mb-4 rounded-full bg-muted/50 p-3">
          <MessageSquareWarning className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-xl font-bold tracking-tight">{title}</h2>
        <p className="mb-6 text-sm text-muted-foreground">{description}</p>
        <div className="flex gap-2">
          {reset && (
            <Button variant="outline" onClick={() => reset()}>
              다시 시도
            </Button>
          )}
          <Button asChild>
            <Link href="/">메인 화면으로 가기</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
