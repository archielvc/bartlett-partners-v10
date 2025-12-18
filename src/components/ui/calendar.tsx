import * as React from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0 bg-[#1A2551] text-white border border-[#1A2551] rounded-xl overflow-hidden shadow-2xl", className)}
      classNames={{
        months: "flex flex-col sm:flex-row",
        month: "space-y-0",
        caption: "flex justify-center pt-6 pb-4 relative items-center",
        caption_label: "text-lg font-['Playfair_Display'] font-medium text-white tracking-wide",
        nav: "absolute right-0 top-0 h-full flex items-center px-4 gap-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-transparent p-0 text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-full"
        ),
        nav_button_previous: "absolute left-4",
        nav_button_next: "absolute right-4",
        table: "w-full border-collapse space-y-1 p-4 block",
        head_row: "flex mb-4 px-2 justify-between",
        head_cell:
          "text-white/40 rounded-md w-9 font-['Figtree'] font-medium text-[0.7rem] uppercase tracking-widest text-center",
        row: "flex w-full mt-1 px-2 justify-between",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[#C5A059]/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-['Figtree'] font-normal aria-selected:opacity-100 hover:bg-white/10 text-white transition-all rounded-md"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-[#C5A059] aria-selected:text-white hover:aria-selected:bg-[#C5A059] hover:aria-selected:text-white rounded-l-md rounded-r-none shadow-md",
        day_range_end:
          "day-range-end aria-selected:bg-[#C5A059] aria-selected:text-white hover:aria-selected:bg-[#C5A059] hover:aria-selected:text-white rounded-r-md rounded-l-none shadow-md",
        day_selected:
          "bg-[#C5A059] text-white hover:bg-[#C5A059] hover:text-white focus:bg-[#C5A059] focus:text-white rounded-md shadow-md",
        day_today: "text-[#C5A059] font-bold bg-white/5 rounded-md border border-[#C5A059]/30",
        day_outside:
          "day-outside text-white/20 aria-selected:text-white/20 opacity-50",
        day_disabled: "text-white/20 opacity-50",
        day_range_middle:
          "aria-selected:bg-[#C5A059]/20 aria-selected:text-[#C5A059] rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };