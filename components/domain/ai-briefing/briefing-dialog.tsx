"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Brain, Cpu, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { AIProvider } from "@/lib/ai/ai"
import { cn } from "@/lib/utils/cn"
import ReactMarkdown from "react-markdown"

interface BriefingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BriefingDialog({ open, onOpenChange }: BriefingDialogProps) {
  const [provider, setProvider] = useState<AIProvider>("google")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Typewriter Effect
  useEffect(() => {
    if (response && !isTyping) {
      setIsTyping(true)
      let i = 0
      setDisplayedText("")
      
      const interval = setInterval(() => {
        if (i < response.length) {
          setDisplayedText((prev) => prev + response.charAt(i))
          i++
        } else {
          clearInterval(interval)
          setIsTyping(false)
        }
      }, 30) // 30ms per character

      return () => clearInterval(interval)
    }
  }, [response])

  const fetchBriefing = async () => {
    setIsLoading(true)
    setError(null)
    setResponse(null)
    setDisplayedText("")

    try {
      const res = await fetch("/api/ai/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch briefing")
      }

      setResponse(data.response)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setError(null)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <DialogTitle className="text-xl">AI Briefing</DialogTitle>
          </div>
          <DialogDescription>
            오늘의 일정과 할 일을 요약해 드립니다. 엔진을 선택해 보세요.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Provider Selector */}
          <div className="flex p-1 bg-muted rounded-xl gap-1">
            <button
              onClick={() => setProvider("google")}
              disabled={isLoading || isTyping}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
                provider === "google" 
                ? "bg-background text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-background/50"
              )}
            >
              <Brain className="size-4" />
              Google Gemini
            </button>
            <button
              onClick={() => setProvider("groq")}
              disabled={isLoading || isTyping}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
                provider === "groq" 
                ? "bg-background text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-background/50"
              )}
            >
              <Cpu className="size-4" />
              Groq (Llama)
            </button>
          </div>

          {/* Response Area */}
          <div className="min-h-[160px] rounded-2xl bg-muted/30 border border-border/50 p-5 relative overflow-hidden">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/50 backdrop-blur-[2px]">
                <Loader2 className="size-6 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground animate-pulse">
                  {provider === "google" ? "Gemini가 일정을 분석 중입니다..." : "Groq가 광속으로 처리 중입니다..."}
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center animate-in fade-in zoom-in duration-300">
                <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
              </div>
            ) : response ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                    strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
                    code: ({ children }) => (
                      <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-primary">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="p-3 rounded-lg bg-muted/50 overflow-x-auto mb-2 text-xs">{children}</pre>
                    ),
                  }}
                >
                  {displayedText}
                </ReactMarkdown>
                {isTyping && <span className="inline-block w-1 h-3.5 ml-1 bg-primary animate-pulse align-middle" />}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-4">
                <Sparkles className="size-10 text-primary/20 mb-3" />
                <p className="text-sm text-muted-foreground">
                  브리핑 시작 버튼을 눌러 오늘 일정을 확인하세요!
                </p>
              </div>
            )}
          </div>

          <Button 
            className="w-full h-11 gap-2 font-semibold text-base shadow-lg shadow-primary/10"
            onClick={fetchBriefing}
            disabled={isLoading || isTyping}
          >
            {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
            ) : response ? (
                <RefreshCw className="size-4" />
            ) : (
                <Sparkles className="size-4" />
            )}
            {response ? "다시 생성하기" : "브리핑 시작"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
