"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Template } from "@/types/template.type";

interface TemplateEditorProps {
  template?: Template;
  onChange?: (data: Template) => void;
}

export default function TemplateInfo({
  template,
  onChange,
}: TemplateEditorProps) {
  const [title, setTitle] = useState(template?.title || "");

  useEffect(() => {
    if (onChange) {
      onChange({
        ...template,
        title,
      });
    }
  }, [title]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  return (
    <div className="flex flex-col gap-4 text-sm px-2 py-4 w-64">
      <div>
        <Label htmlFor="title" className="text-xs pb-2">
          Title
        </Label>
        <Input
          required
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Template Title"
        />
      </div>
    </div>
  );
}
