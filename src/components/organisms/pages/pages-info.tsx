"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { validateSlugViaApi, validateSlug, slugify } from "@/utils/pages/slugs";
import type { PageBodyInput } from "@/types/page.type";

interface PageEditorProps {
  page?: PageBodyInput;
  onChange?: (data: PageBodyInput) => void;
}

export default function PageInfo({ page, onChange }: PageEditorProps) {
  const [title, setTitle] = useState(page?.title || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [slugError, setSlugError] = useState("");
  const [isPublic, setIsPublic] = useState(page?.is_public || false);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState(page?.tags || []);
  const [newCategory, setNewCategory] = useState("");
  const [category, setCategory] = useState(page?.category || []);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized && page) {
      setTitle(page.title || "");
      setSlug(page.slug || "");
      setCategory(page.category || []);
      setIsPublic(page.is_public || false);
      setTags(page.tags || []);
      setIsInitialized(true);
    }
  }, [page, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (onChange) {
      onChange({
        ...page,
        title,
        slug,
        category,
        tags,
        isPublic,
      } as PageBodyInput);
    }
  }, [title, slug, tags, category, isPublic]);

  const handleTagsPush = (value: string) => {
    if (!value) return;
    const newTags = Array.from(new Set([...tags, value]));
    setTags(newTags);
  };

  const handleCategoryPush = (value: string) => {
    if (!value) return;
    const newCategory = Array.from(new Set([...category, value]));
    setCategory(newCategory);
  };

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
        <Label htmlFor="tags" className="text-xs pb-2">
          Tags
        </Label>
        <div className="flex gap-1 justify-between items-center">
          <Input
            required
            id="tags"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="publication"
          />
          <Button
            onClick={() => {
              handleTagsPush(newTag);
              setNewTag("");
            }}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag) => {
            return (
              <Badge variant="outline" key={tag}>
                {tag}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setTags(tags.filter((oldTag) => oldTag !== tag));
                  }}
                >
                  <X />
                </Button>
              </Badge>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="category" className="text-xs pb-2">
          Category
        </Label>
        <div className="flex gap-1 justify-between items-center">
          <Input
            required
            id="category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Books"
          />
          <Button
            onClick={() => {
              handleCategoryPush(newCategory);
              setNewCategory("");
            }}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {category.map((cat) => {
            return (
              <Badge variant="outline" key={cat}>
                {cat}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCategory(
                      category.filter((oldCategory) => oldCategory !== cat),
                    );
                  }}
                >
                  <X />
                </Button>
              </Badge>
            );
          })}
        </div>
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
