"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { validateSlugViaApi, validateSlug, slugify } from "@/utils/pages/slugs";
import type { Page } from "@/types/page.type";

interface PageEditorProps {
  page?: Page;
  onChange?: (data: Page) => void;
}

export default function PageInfo({ page, onChange }: PageEditorProps) {
  const [title, setTitle] = useState(page?.title);
  const [slug, setSlug] = useState(page?.slug);
  const [slugError, setSlugError] = useState("");
  const [isPublic, setIsPublic] = useState(page?.isPublic);

  const onTitleChange = (data: string) => {
    setTitle(data);
    if (onChange) {
      onChange({
        ...page,
        title: data,
      });
    }

    const slugFromTitle = slugify(data);
    setSlug(slugFromTitle);
    if (onChange) {
      onChange({
        ...page,
        title: data,
        slug: slugFromTitle,
      });
    }
    onValidateSlug();
  };

  const onSlugChange = (data: string) => {
    setSlug(data);
    if (onChange) {
      onChange({
        ...page,
        title,
        slug: data,
      });
    }
  };

  const onIsPublicChange = (data: boolean) => {
    setIsPublic(data);
    if (onChange) {
      onChange({
        ...page,
        title,
        slug,
        isPublic: data,
      });
    }
  };

  const onValidateSlug = async () => {
    if (!slug) {
      setSlugError("Slug cant be empty");

      return;
    }

    const error = validateSlug(slug);

    if (error) {
      setSlugError(error);

      return;
    }

    const { valid, error: apiError } = await validateSlugViaApi(slug);

    if (!valid || apiError) {
      setSlugError(apiError || "Slug is already used by other page");

      return;
    }

    if (slugError) {
      setSlugError("");
    }
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
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Title"
        />
      </div>
      <div>
        <Label htmlFor="slug" className="text-xs pb-2">
          Slug
        </Label>
        <Input
          required
          id="slug"
          className={slugError ? "border-red-600" : ""}
          onBlur={onValidateSlug}
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder="/landing-page"
        />
        <span
          hidden={slugError.length > 0}
          className="text-xs text-wrap max-w-48 text-gray-400"
        >
          Your page will be access from : /{slug}
        </span>
        <span hidden={slugError.length === 0} className="text-xs text-red-600">
          {slugError}
        </span>
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
