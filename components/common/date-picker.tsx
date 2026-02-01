"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { ko } from "date-fns/locale"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DatePickerProps {
  date?: string // YYYY-MM-DD
  onChange: (date: string) => void
  className?: string
}

export function DatePicker({ date, onChange, className }: DatePickerProps) {
  const selectedDate = date ? new Date(date) : new Date()

  const handleSelect = (newDate: Date | undefined) => {
    if (!newDate) return
    onChange(format(newDate, "yyyy-MM-dd"))
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal pl-9 relative h-10 rounded-xl border-none bg-background shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.05)] hover:bg-muted/50 transition-all group",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="absolute left-3 top-3 size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-foreground font-medium">
              {date ? format(selectedDate, "yyyy년 MM월 dd일", { locale: ko }) : "날짜 선택"}
            </span>
            <ChevronDown className="absolute right-3 top-3.5 size-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto p-0 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.12)] border-none bg-card overflow-hidden" align="start">
          <div className="p-4 bg-card">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              locale={ko}
              showOutsideDays
              fixedWeeks
              classNames={{
                months: "flex flex-col space-y-4",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center px-8",
                caption_label: "text-sm font-bold text-foreground",
                nav: "space-x-1 flex items-center absolute right-4 top-4",
                button_previous: cn(
                  "h-7 w-7 bg-transparent p-0 text-foreground opacity-50 hover:opacity-100 transition-opacity hover:bg-muted rounded-md"
                ),
                button_next: cn(
                  "h-7 w-7 bg-transparent p-0 text-foreground opacity-50 hover:opacity-100 transition-opacity hover:bg-muted rounded-md"
                ),
                table: "w-full border-collapse",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative",
                day: cn(
                  "h-9 w-9 p-0 pr-2 text-right font-normal aria-selected:opacity-100 hover:bg-accent rounded-xl transition-colors"
                ),
                selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold",
                today: "bg-accent/50 text-accent-foreground rounded-xl",
                outside: "text-muted-foreground opacity-[0.2]",
                disabled: "text-muted-foreground opacity-50",
              }}
              components={{
                Chevron: (props) => {
                  if (props.orientation === "left") {
                    return <ChevronLeft className="size-4" />
                  }
                  return <ChevronRight className="size-4" />
                },
              }}
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
