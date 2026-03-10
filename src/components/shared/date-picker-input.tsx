"use client";

import { useCallback, useRef, useState } from "react";
import { IconCalendar } from "@tabler/icons-react";
import { format, isValid, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface DatePickerInputProps {
  /** Controlled value - Date object or date string (yyyy-MM-dd, dd/MM/yyyy) */
  value?: Date | string;
  /** Called when date changes - provides Date and formatted string */
  onChange?: (date: Date | undefined, dateString: string) => void;
  /** Default value for uncontrolled mode */
  defaultValue?: Date | string;
  /** Form field name - renders hidden input for FormData */
  name?: string;
  /** Output format for hidden input & string callback (default: "yyyy-MM-dd") */
  outputFormat?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DISPLAY_FORMAT = "dd/MM/yyyy";
const DEFAULT_OUTPUT_FORMAT = "yyyy-MM-dd";

// =============================================================================
// HELPERS
// =============================================================================

function toDate(value: Date | string | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return isValid(value) ? value : undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;

  // Try yyyy-MM-dd (ISO / native date input)
  let parsed = parse(value, "yyyy-MM-dd", new Date());
  if (isValid(parsed)) return parsed;

  // Try dd/MM/yyyy (display format)
  parsed = parse(value, "dd/MM/yyyy", new Date());
  if (isValid(parsed)) return parsed;

  return undefined;
}

function formatDisplay(date: Date | undefined): string {
  if (!date || !isValid(date)) return "";
  return format(date, DISPLAY_FORMAT);
}

function formatOutput(date: Date | undefined, outputFmt: string): string {
  if (!date || !isValid(date)) return "";
  return format(date, outputFmt);
}

function parseDateFromInput(value: string): Date | undefined {
  if (!value.trim()) return undefined;

  const parsed = parse(value, DISPLAY_FORMAT, new Date());
  if (isValid(parsed)) {
    const year = parsed.getFullYear();
    if (year < 2000 || year > 2999) return undefined;
    return parsed;
  }

  return undefined;
}

function getMaxDayInMonth(month: number, year?: number): number {
  if ([1, 3, 5, 7, 8, 10, 12].includes(month)) return 31;
  if ([4, 6, 9, 11].includes(month)) return 30;

  if (month === 2) {
    if (year) {
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      return isLeapYear ? 29 : 28;
    }
    return 29;
  }

  return 31;
}

function formatInputValue(value: string): string {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length === 0) return "";

  let formatted = "";
  let day = "";
  let month = "";
  let year = "";

  if (numbers.length >= 1) {
    day = numbers.slice(0, 2);

    if (parseInt(day[0]) > 3) {
      day = "0" + day[0];
    }

    if (day.length === 2) {
      const dayNum = parseInt(day);
      if (dayNum === 0) {
        day = "01";
      } else if (dayNum > 31) {
        day = "31";
      }
    }

    formatted = day;
  }

  if (numbers.length >= 3) {
    month = numbers.slice(2, 4);

    if (parseInt(month[0]) > 1) {
      month = "0" + month[0];
    }

    if (month.length === 2) {
      const monthNum = parseInt(month);
      if (monthNum === 0) {
        month = "01";
      } else if (monthNum > 12) {
        month = "12";
      }

      if (day.length === 2) {
        const dayNum = parseInt(day);
        const monthNumFinal = parseInt(month);
        const maxDay = getMaxDayInMonth(monthNumFinal);

        if (dayNum > maxDay) {
          day = maxDay.toString().padStart(2, "0");
        }
      }
    }

    formatted = day + "/" + month;
  }

  if (numbers.length >= 5) {
    const yearPart = numbers.slice(4, 8);
    if (yearPart[0] === "2") {
      year = yearPart;

      if (year.length === 4 && month.length === 2 && day.length === 2) {
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        const maxDay = getMaxDayInMonth(monthNum, yearNum);

        if (dayNum > maxDay) {
          day = maxDay.toString().padStart(2, "0");
          formatted = day + "/" + month;
        }
      }

      formatted += "/" + year;
    }
  }

  return formatted;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DatePickerInput({
  value: valueProp,
  onChange,
  defaultValue,
  name,
  outputFormat = DEFAULT_OUTPUT_FORMAT,
  placeholder = "dd/mm/yyyy",
  className,
  id,
  disabled,
}: DatePickerInputProps) {
  const isControlled = valueProp !== undefined;
  const initialDate = toDate(isControlled ? valueProp : defaultValue);

  const [internalDate, setInternalDate] = useState<Date | undefined>(initialDate);
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState(() => formatDisplay(initialDate));
  const [prevValueProp, setPrevValueProp] = useState(valueProp);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync display text when controlled value changes externally (adjust state during render)
  if (isControlled && valueProp !== prevValueProp) {
    setPrevValueProp(valueProp);
    setInputText(formatDisplay(toDate(valueProp)));
  }

  // The actual date (controlled or internal)
  const date = isControlled ? toDate(valueProp) : internalDate;

  const handleDateChange = useCallback(
    (newDate: Date | undefined) => {
      if (!isControlled) {
        setInternalDate(newDate);
      }
      onChange?.(newDate, formatOutput(newDate, outputFormat));
    },
    [isControlled, onChange, outputFormat],
  );

  const handleInputChange = useCallback(
    (rawValue: string) => {
      const formatted = formatInputValue(rawValue);
      setInputText(formatted);

      if (formatted.length === 10) {
        const parsedDate = parseDateFromInput(formatted);
        if (parsedDate) handleDateChange(parsedDate);
      } else if (formatted.trim() === "") {
        handleDateChange(undefined);
      }
    },
    [handleDateChange],
  );

  const handleCalendarSelect = useCallback(
    (selectedDate: Date | undefined) => {
      handleDateChange(selectedDate);
      setInputText(formatDisplay(selectedDate));
      setOpen(false);
    },
    [handleDateChange],
  );

  const hiddenValue = formatOutput(date, outputFormat);

  return (
    <Popover open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
      <div className={cn("flex w-full items-stretch", className)}>
        {name && <input type="hidden" name={name} value={hiddenValue} />}
        <Input
          ref={inputRef}
          id={id}
          value={inputText}
          placeholder={placeholder}
          maxLength={10}
          disabled={disabled}
          className="flex-1 rounded-r-none border-r-0 bg-background px-2 text-sm focus-visible:border-input focus-visible:ring-0"
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              disabled={disabled}
              className="h-auto w-9 shrink-0 rounded-l-none border-l focus-visible:border-input focus-visible:ring-0"
              aria-label="Mở lịch"
            >
              <IconCalendar className="size-4" />
            </Button>
          }
        />
      </div>
      <PopoverContent className="w-auto overflow-hidden p-0" align="end" sideOffset={10}>
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          numberOfMonths={2}
          captionLayout="dropdown"
          onSelect={handleCalendarSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
