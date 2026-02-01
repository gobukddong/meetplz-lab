"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, ChevronDown } from "lucide-react"
import { ko } from "date-fns/locale"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DateTimePickerProps {
  date?: string // YYYY-MM-DD
  time?: string // HH:mm
  onChange: (value: string) => void // YYYY-MM-DDTHH:mm
  className?: string
}

export function DateTimePicker({ date, time, onChange, className }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date ? new Date(date) : new Date()
  )
  
  // Parse time (HH:mm) into AM/PM, Hour (1-12), Minute
  const initialTime = time || "19:00"
  const initialHour24 = parseInt(initialTime.split(":")[0])
  const initialMinute = initialTime.split(":")[1]
  
  const [ampm, setAmpm] = React.useState(initialHour24 >= 12 ? "PM" : "AM")
  const [hour, setHour] = React.useState(
    initialHour24 === 0 ? "12" : initialHour24 > 12 ? (initialHour24 - 12).toString() : initialHour24.toString()
  )
  const [minute, setMinute] = React.useState(initialMinute)

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return
    setSelectedDate(newDate)
    updateDateTime(newDate, ampm, hour, minute)
  }

  const updateDateTime = (d: Date, tAmpm: string, tHour: string, tMinute: string) => {
    const dateStr = format(d, "yyyy-MM-dd")
    let h24 = parseInt(tHour)
    if (tAmpm === "PM" && h24 < 12) h24 += 12
    if (tAmpm === "AM" && h24 === 12) h24 = 0
    
    const timeStr = `${h24.toString().padStart(2, '0')}:${tMinute}`
    onChange(`${dateStr}T${timeStr}`)
  }

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

    if (selectedDate) {
      updateDateTime(selectedDate, newAmpm, newHour, newMinute)
    }
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
              "w-full justify-start text-left font-normal pl-9 relative h-10 rounded-xl border-border bg-background hover:bg-muted/50 transition-colors group",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="absolute left-3 top-3 size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="flex items-center gap-2">
              {selectedDate ? (
                format(selectedDate, "yyyy년 MM월 dd일", { locale: ko })
              ) : (
                <span>날짜 선택</span>
              )}
              <span className="w-px h-3 bg-border mx-1" />
              <span className="text-foreground font-medium">
                {ampm === "AM" ? "오전" : "오후"} {hour.padStart(2, '0')}:{minute}
              </span>
            </div>
            <ChevronDown className="absolute right-3 top-3.5 size-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto p-0 rounded-2xl shadow-2xl border-border bg-card overflow-hidden" align="start">
          <div className="flex flex-col sm:flex-row bg-card">
            {/* Calendar Section */}
            <div className="p-4 border-b sm:border-b-0 sm:border-r border-border">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={ko}
                classNames={{
                    months: "flex flex-col space-y-4",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center px-8",
                    caption_label: "text-sm font-bold text-foreground",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity hover:bg-muted rounded-md"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "h-9 w-9 text-center text-sm p-0 relative",
                    day: cn(
                      "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent rounded-xl transition-colors"
                    ),
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold",
                    day_today: "bg-accent/50 text-accent-foreground border border-primary/20",
                    day_outside: "text-muted-foreground opacity-30",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_hidden: "invisible",
                }}
              />
            </div>

            {/* Time Selection Section */}
            <div className="p-4 bg-muted/20 min-w-[120px]">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="size-4 text-primary" />
                <span className="text-sm font-bold text-foreground">시간 설정</span>
              </div>
              
              <div className="flex gap-2 h-[240px]">
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
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
