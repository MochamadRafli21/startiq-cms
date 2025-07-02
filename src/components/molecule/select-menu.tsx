"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function SelectMenu({
  selected,
  isOpen,
  setIsOpen,
  options,
  setSelected,
}: {
  selected: { key: string; value: string };
  options: { key: string; value: string }[];
  setSelected?: (key: string) => void;
  isOpen: boolean;
  setIsOpen?: (state: boolean) => void;
}) {
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between"
        >
          {selected
            ? options.find((option) => option.key === selected.key)?.value
            : "Select data..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." className="h-9" />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.key}
                  value={option.value}
                  onSelect={(option) => {
                    if (setSelected) {
                      setSelected(option);
                    }
                    if (setIsOpen) {
                      setIsOpen(false);
                    }
                  }}
                >
                  {option.value}
                  <Check
                    className={cn(
                      "ml-auto",
                      selected.key === option.key ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
