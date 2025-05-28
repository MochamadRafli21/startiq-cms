"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Page } from "@/types/page.type";
interface PageEditorProps {
  page?: Page;
  onChange?: (data: Page) => void;
}

export default function PageInfo({ page, onChange }: PageEditorProps) {
  const [title, setTitle] = useState(page?.title);
  const [slug, setSlug] = useState(page?.slug);
  const [isPublic, setIsPublic] = useState(page?.isPublic);

  const onTitleChange = (data: string) => {
    setTitle(data);
    if (page && onChange) {
      onChange({
        ...page,
        title: data,
      });
    }
  };

  const onSlugChange = (data: string) => {
    setSlug(data);
    if (page && onChange) {
      onChange({
        ...page,
        slug: data,
      });
    }
  };

  const onIsPublicChange = (data: boolean) => {
    setIsPublic(data);
    if (page && onChange) {
      onChange({
        ...page,
        isPublic: data,
      });
    }
  };
  return (
    <div className="flex flex-col gap-4 text-sm px-2 py-4">
      <div>
        <Label htmlFor="title" className="text-xs pb-2">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Title"
        />
      </div>
      <div>
        <Label htmlFor="slug" className="text-xs pb-2">
          Slug
        </Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder="Slug"
        />
      </div>
      <div>
        <Label htmlFor="isPublic" className="text-xs pb-2">
          Status
        </Label>
        <div className="flex items-center gap-2">
          <Switch
            id="isPublic"
            checked={isPublic}
            onCheckedChange={onIsPublicChange}
          />
          <span>Public</span>
        </div>
      </div>
    </div>
  );
}
