"use client"

import * as React from "react"
import { Clock, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TimePickerProps {
  time?: string // HH:mm
  onChange: (time: string) => void
  className?: string
}

export function TimePicker({ time, onChange, className }: TimePickerProps) {
  const initialTime = time || "19:00"
  const initialHour24 = parseInt(initialTime.split(":")[0])
  const initialMinute = initialTime.split(":")[1]
  
  const [ampm, setAmpm] = React.useState(initialHour24 >= 12 ? "PM" : "AM")
  const [hour, setHour] = React.useState(
    initialHour24 === 0 ? "12" : initialHour24 > 12 ? (initialHour24 - 12).toString() : initialHour24.toString()
  )
  const [minute, setMinute] = React.useState(initialMinute)

  const handleTimeChange = (type: "ampm" | "hour" | "minute", value: string) => {
    let newAmpm = ampm
    let newHour = hour
    let newMinute = minute

    if (type === "ampm") {
      newAmpm = value
      setAmpm(value)
    } else if (type === "hour") {
      newHour = value
      setHour(value)
    } else if (type === "minute") {
      newMinute = value
      setMinute(value)
    }

    let h24 = parseInt(newHour)
    if (newAmpm === "PM" && h24 < 12) h24 += 12
    if (newAmpm === "AM" && h24 === 12) h24 = 0
    
    onChange(`${h24.toString().padStart(2, '0')}:${newMinute}`)
  }

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString())
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]

  return (
    <div className={cn("grid gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal pl-9 relative h-10 rounded-xl border-border bg-background hover:bg-muted/50 transition-colors group"
            )}
          >
            <Clock className="absolute left-3 top-3 size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-foreground font-medium">
              {ampm === "AM" ? "오전" : "오후"} {hour.padStart(2, '0')}:{minute}
            </span>
            <ChevronDown className="absolute right-3 top-3.5 size-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto p-4 rounded-2xl shadow-2xl border-border bg-card overflow-hidden" align="start">
          <div className="flex flex-col bg-card min-w-[120px]">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-4 text-primary" />
              <span className="text-sm font-bold text-foreground">시간 설정</span>
            </div>
            
            <div className="flex gap-2 h-[200px]">
              {/* AM/PM */}
              <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar pb-8">
                {["AM", "PM"].map((v) => (
                  <Button
                    key={v}
                    variant={ampm === v ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-8 px-3 text-xs rounded-lg transition-all",
                      ampm === v ? "bg-primary shadow-md scale-105" : "text-muted-foreground"
                    )}
                    onClick={() => handleTimeChange("ampm", v)}
                  >
                    {v === "AM" ? "오전" : "오후"}
                  </Button>
                ))}
              </div>

              {/* Hours */}
              <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar pb-8 pr-1">
                {hours.map((v) => (
                  <Button
                    key={v}
                    variant={hour === v ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-8 w-10 text-xs rounded-lg transition-all",
                      hour === v ? "bg-primary/20 text-primary border border-primary/30 font-bold" : "text-muted-foreground"
                    )}
                    onClick={() => handleTimeChange("hour", v)}
                  >
                    {v.padStart(2, '0')}
                  </Button>
                ))}
              </div>

              {/* Minutes */}
              <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar pb-8">
                {minutes.map((v) => (
                  <Button
                    key={v}
                    variant={minute === v ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-8 w-10 text-xs rounded-lg transition-all",
                      minute === v ? "bg-primary/20 text-primary border border-primary/30 font-bold" : "text-muted-foreground"
                    )}
                    onClick={() => handleTimeChange("minute", v)}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
