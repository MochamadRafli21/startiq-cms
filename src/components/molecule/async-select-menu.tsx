"use client";

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Option = {
  label: string;
  value: string;
};

interface AsyncSelectProps<T> {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  fetchUrl: string;
  mapOption?: (item: T) => Option;
  responseKey?: keyof T | string; // optional key to extract array from response (e.g., "pages")
}

export function AsyncSelect<T>({
  placeholder,
  value,
  onChange,
  fetchUrl,
  mapOption,
  responseKey,
}: AsyncSelectProps<T>) {
  const [options, setOptions] = React.useState<Option[]>([]);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const fetchOptions = async () => {
      const res = await fetch(
        `${fetchUrl}?search=${encodeURIComponent(search)}`,
      );
      const data = await res.json();

      // Default: assume data is an array, or extract by responseKey if provided
      const list: T[] =
        responseKey && data[responseKey] ? data[responseKey] : data;

      setOptions(
        list.map((item: T) =>
          mapOption
            ? mapOption(item)
            : {
                // @ts-expect-error: generic fallback for label/value
                label: item.label ?? item.title ?? "Unknown",
                // @ts-expect-error: same fallback logic
                value: item.value ?? item.id ?? "unknown",
              },
        ),
      );
    };

    const timeout = setTimeout(fetchOptions, 300);
    return () => clearTimeout(timeout);
  }, [search, fetchUrl, mapOption, responseKey]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
        </div>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
