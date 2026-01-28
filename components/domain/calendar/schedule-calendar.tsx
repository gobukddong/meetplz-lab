"use client"

import * as React from "react"
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker"
import { format as formatDate } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils/cn"
import { Button, buttonVariants } from "@/components/ui/button"

type EventType = "meeting" | "personal"

export interface CalendarEvent {
  date: Date
  type: EventType
}

interface ScheduleCalendarProps {
  events: CalendarEvent[]
  selected?: Date
  onSelect?: (date: Date | undefined) => void
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
  className,
}: ScheduleCalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      showOutsideDays
      locale={ko}
      formatters={{
        formatCaption: (date) => formatDate(date, "yyyy.MM", { locale: ko }),
      }}
      className={cn(
        "bg-card rounded-xl border border-border p-4 w-full",
        className
      )}
      classNames={{
        root: cn("w-full", defaultClassNames.root),
        months: cn("flex flex-col w-full", defaultClassNames.months),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          // Keep < and > at far edges, aligned with caption row
          "flex items-center w-full absolute inset-x-0 top-0 justify-between px-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 text-muted-foreground hover:text-foreground",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 text-muted-foreground hover:text-foreground",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          // Center label, nav floats left/right within this row
          "relative flex items-center justify-center h-9 w-full",
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          "text-sm font-semibold text-foreground tabular-nums",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse mt-2",
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
          "bg-accent text-accent-foreground rounded-lg",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground/50",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
      }}
      components={{
        DayButton: (dayButtonProps) => (
          <CalendarDayButton {...dayButtonProps} events={events} />
          
        ),
      }}
    />
  )
}
