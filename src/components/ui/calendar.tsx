"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 bg-white",
        "rounded-xl border border-gray-100",
        "shadow-lg shadow-gray-100/50",
        "backdrop-blur-sm",
        className
      )}
      classNames={{
        // Layout
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        
        // Header
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-gray-800",
        
        // Navigation
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0",
          "text-gray-500",
          "hover:text-emerald-700",
          "hover:bg-emerald-50/50",
          "rounded-lg",
          "transition-all duration-200",
          "border border-transparent hover:border-emerald-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        
        // Table
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: cn(
          "text-gray-500 font-medium",
          "rounded-md w-9 text-[0.8rem]"
        ),
        
        // Rows & Cells
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-range-end)]:rounded-r-full",
          "[&:has([aria-selected].day-outside)]:bg-emerald-50/30",
          "[&:has([aria-selected])]:bg-emerald-50/50",
          "first:[&:has([aria-selected])]:rounded-l-full",
          "last:[&:has([aria-selected])]:rounded-r-full",
          "focus-within:relative focus-within:z-20"
        ),
        
        // Days
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal",
          "text-gray-700",
          "hover:bg-emerald-50/70",
          "hover:text-emerald-800",
          "rounded-full",
          "transition-all duration-200",
          "aria-selected:opacity-100",
          "active:scale-95"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-gradient-to-br from-emerald-500 to-emerald-600",
          "text-white",
          "hover:from-emerald-600 hover:to-emerald-700",
          "shadow-sm shadow-emerald-200",
          "rounded-full",
          "font-medium"
        ),
        day_today: cn(
          "border-2 border-emerald-400",
          "text-emerald-800",
          "font-semibold",
          "bg-emerald-50/30"
        ),
        day_outside: cn(
          "text-gray-400",
          "opacity-70",
          "aria-selected:bg-emerald-50/30",
          "aria-selected:text-gray-400",
          "aria-selected:opacity-50"
        ),
        day_disabled: cn(
          "text-gray-300",
          "cursor-not-allowed",
          "hover:bg-transparent hover:text-gray-300"
        ),
        day_range_middle: cn(
          "aria-selected:bg-emerald-100/40",
          "aria-selected:text-emerald-800",
          "rounded-none"
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeft className="h-4 w-4" {...props} />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRight className="h-4 w-4" {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }