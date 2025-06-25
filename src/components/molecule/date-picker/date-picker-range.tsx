"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerRange({
  placeholder,
  from,
  to,
  onChange,
}: {
  placeholder?: string;
  from?: Date;
  to?: Date;
  onChange?: (from?: Date, to?: Date) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {from ? from.toLocaleDateString() + " - " : placeholder}
            {to ? to.toLocaleDateString() : ""}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from, to }}
            captionLayout="dropdown"
            onSelect={(date) => {
              if (onChange) {
                onChange(date?.from, date?.to);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
