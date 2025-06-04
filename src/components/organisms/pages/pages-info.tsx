"use client";

import { useState, useEffect } from "react";
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
  const [title, setTitle] = useState(page?.title || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [slugError, setSlugError] = useState("");
  const [isPublic, setIsPublic] = useState(page?.isPublic || false);

  useEffect(() => {
    if (onChange) {
      onChange({
        ...page,
        title,
        slug,
        isPublic,
      });
    }
  }, [title, slug, isPublic]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    const generatedSlug = slugify(value);
    setSlug(generatedSlug);
    setSlugError(""); // reset error on edit
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugError("");
  };

  const handlePublicToggle = (value: boolean) => {
    setIsPublic(value);
  };

  const onValidateSlug = async () => {
    if (!slug) {
      setSlugError("Slug can't be empty");
      return;
    }

    const error = validateSlug(slug);
    if (error) {
      setSlugError(error);
      return;
    }

    const { valid, error: apiError } = await validateSlugViaApi(slug);
    if (!valid || apiError) {
      setSlugError(apiError || "Slug is already used by another page");
    } else {
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
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Page Title"
        />
      </div>

      <div>
        <Label htmlFor="slug" className="text-xs pb-2">
          Slug
        </Label>
        <Input
          required
          id="slug"
          value={slug}
          className={slugError ? "border-red-600" : ""}
          onBlur={onValidateSlug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="page-slug"
        />
        {slugError ? (
          <span className="text-xs text-red-600">{slugError}</span>
        ) : (
          <span className="text-xs text-gray-400">
            Your page will be accessible at: /{slug}
          </span>
        )}
      </div>

      <div>
        <Label htmlFor="isPublic" className="text-xs pb-2">
          Status
        </Label>
        <div className="flex items-center gap-2">
          <Switch
            id="isPublic"
            checked={isPublic}
            onCheckedChange={handlePublicToggle}
          />
          <span>Public</span>
        </div>
      </div>
    </div>
  );
}
