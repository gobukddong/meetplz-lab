"use client"

import * as React from "react"
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker"
import { format as formatDate, setMonth as setDateMonth, setYear as setDateYear } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils/cn"
import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type EventType = "meeting" | "personal"

export interface CalendarEvent {
  date: Date
  type: EventType
}

interface ScheduleCalendarProps {
  events: CalendarEvent[]
  selected?: Date
  month?: Date
  onSelect?: (date: Date | undefined) => void
  onMonthChange?: (month: Date) => void
  className?: string
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  events,
  ...props
}: React.ComponentProps<typeof DayButton> & { events: CalendarEvent[] }) {
  const defaultClassNames = getDefaultClassNames()
  const ref = React.useRef<HTMLButtonElement>(null)
  
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const dayEvents = events.filter(
    (event) => event.date.toDateString() === day.date.toDateString()
  )

  const hasMeeting = dayEvents.some((e) => e.type === "meeting")
  const hasPersonal = dayEvents.some((e) => e.type === "personal")

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground flex aspect-square size-auto w-full min-w-10 flex-col gap-0.5 leading-none font-normal hover:bg-accent hover:text-accent-foreground relative",
        defaultClassNames.day,
        className
      )}
      {...props}
    >
      <span className="text-sm">{day.date.getDate()}</span>
      {(hasMeeting || hasPersonal) && (
        <div className="flex gap-0.5 absolute bottom-1">
          {hasMeeting && (
            <span className="size-1.5 rounded-full bg-red-500" />
          )}
          {hasPersonal && (
            <span className="size-1.5 rounded-full bg-muted-foreground" />
          )}
        </div>
      )}
    </Button>
  )
}

export function ScheduleCalendar({
  events,
  selected,
  onSelect,
  month: currentMonth = new Date(),
  onMonthChange,
  className,
}: ScheduleCalendarProps) {
  const defaultClassNames = getDefaultClassNames()
  
  const handleTodayClick = () => {
    const today = new Date()
    if (onSelect) onSelect(today)
    if (onMonthChange) onMonthChange(today)
  }

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = setDateMonth(currentMonth, monthIndex)
    if (onMonthChange) onMonthChange(newDate)
  }

  const handleYearSelect = (year: number) => {
    const newDate = setDateYear(currentMonth, year)
    if (onMonthChange) onMonthChange(newDate)
  }

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)
  }, [])

  const months = React.useMemo(() => [
    "1월", "2월", "3월", "4월", "5월", "6월", 
    "7월", "8월", "9월", "10월", "11월", "12월"
  ], [])

  return (
    <div className={cn("bg-card rounded-xl border border-border p-4 w-full flex flex-col gap-4 relative", className)}>
      {/* Header Container */}
      <div className="flex items-center justify-between px-1 relative">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 font-bold text-base hover:bg-accent flex items-center gap-1">
                {formatDate(currentMonth, "yyyy.MM")}
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto no-scrollbar">
              <div className="flex gap-2 p-2 min-w-[200px]">
                <div className="space-y-1 flex-1">
                  <p className="text-[10px] font-medium text-muted-foreground px-2 pb-1 uppercase tracking-wider text-center">연도</p>
                  {years.map(year => (
                    <DropdownMenuItem 
                      key={year} 
                      onClick={() => handleYearSelect(year)}
                      className={cn("cursor-pointer justify-center", currentMonth.getFullYear() === year && "bg-accent")}
                    >
                      {year}년
                    </DropdownMenuItem>
                  ))}
                </div>
                <div className="space-y-1 border-l border-border pl-2 flex-1">
                  <p className="text-[10px] font-medium text-muted-foreground px-2 pb-1 uppercase tracking-wider text-center">월</p>
                  {months.map((m, i) => (
                    <DropdownMenuItem 
                      key={m} 
                      onClick={() => handleMonthSelect(i)}
                      className={cn("cursor-pointer justify-center", currentMonth.getMonth() === i && "bg-accent")}
                    >
                      {m}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-medium gap-1.5 border-border bg-transparent text-foreground hover:bg-accent"
              onClick={handleTodayClick}
            >
              <CalendarIcon className="size-3.5" />
              오늘
            </Button>
            {/* Space for DayPicker arrows */}
            <div className="w-16 h-8" />
        </div>
      </div>

      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={currentMonth}
        onMonthChange={onMonthChange}
        showOutsideDays
        locale={ko}
        classNames={{
          root: cn("w-full", defaultClassNames.root),
          months: cn("flex flex-col w-full", defaultClassNames.months),
          month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
          nav: cn(
            "flex items-center absolute right-0 top-[-44px] gap-1",
            defaultClassNames.nav
          ),
          button_previous: cn(
            buttonVariants({ variant: "ghost" }),
            "size-8 p-0 text-muted-foreground hover:text-foreground",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: "ghost" }),
            "size-8 p-0 text-muted-foreground hover:text-foreground",
            defaultClassNames.button_next
          ),
          month_caption: "hidden", // Hide original caption label
          table: "w-full border-collapse",
          weekdays: cn("flex w-full", defaultClassNames.weekdays),
          weekday: cn(
            "text-muted-foreground flex-1 font-medium text-xs text-center py-2",
            defaultClassNames.weekday
          ),
          week: cn("flex w-full mt-1", defaultClassNames.week),
          day: cn(
            "relative flex-1 p-0 text-center aspect-square",
            defaultClassNames.day
          ),
          today: cn(
            "bg-accent/50 text-accent-foreground font-bold rounded-lg",
            defaultClassNames.today
          ),
          selected: "bg-primary text-primary-foreground rounded-lg",
          outside: cn(
            "text-muted-foreground/30",
            defaultClassNames.outside
          ),
          disabled: cn(
            "text-muted-foreground opacity-50",
            defaultClassNames.disabled
          ),
        }}
        components={{
          Chevron: (props) => {
            if (props.orientation === "left") {
              return <ChevronLeft className="size-4" />
            }
            return <ChevronRight className="size-4" />
          },
          DayButton: (dayButtonProps) => (
            <CalendarDayButton {...dayButtonProps} events={events} />
          ),
        }}
      />
    </div>
  )
}
