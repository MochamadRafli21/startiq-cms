"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import type { Link } from "@/types/link.type";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

interface PageEditorProps {
  link?: Link;
  onChange?: (data: Link) => void;
}

export default function LinkForm({ link, onChange }: PageEditorProps) {
  const [title, setTitle] = useState(link?.title || "");
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState(link?.tags || []);
  const [descriptions, setDescriptions] = useState(link?.descriptions || "");
  const [target, setTarget] = useState(link?.target || "");
  const [banner, setBanner] = useState(link?.banner || "");
  const [attributes, setAttributes] = useState(link?.attributes || {});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (onChange) {
      onChange({
        ...link,
        title,
        descriptions,
        tags: (tags || []) as string[],
        attributes,
        banner,
        target,
      });
    }
  }, [title, descriptions, banner, target, tags, attributes]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  const handleTagsPush = (value: string) => {
    if (!value) return;
    const newTags = Array.from(new Set([...tags, value]));
    setTags(newTags);
  };

  const handleTargetChange = (value: string) => {
    setTarget(value);
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { data } = await res.json();
      const url = data?.at(0)?.src;
      setBanner(url);
    } catch (err) {
      console.error("Image upload failed:", err);
      // Optionally show an error toast here
    } finally {
      setUploading(false);
    }
  };

  const handleDescriptionsChange = (value: string) => {
    setDescriptions(value);
  };

  const handleAddAttribute = () => {
    setAttributes({
      ...attributes,
      Key: "Value",
    });
  };

  const handleAttributeKeyChange = (key: string, originalKey: string) => {
    setAttributes((prev) => {
      const oldValue = prev[originalKey];
      const newAttrs = { ...prev, [key]: oldValue };
      delete newAttrs[originalKey];
      return newAttrs;
    });
  };

  const handleAttributeValueChange = (value: string, originalKey: string) => {
    setAttributes((prev) => {
      const newAttrs = { ...prev, [originalKey]: value };
      return newAttrs;
    });
  };

  const handleRemoveAttributeKey = (key: string) => {
    setAttributes((prev) => {
      const newAttrs = { ...prev };
      delete newAttrs[key];
      return newAttrs;
    });
  };

  return (
    <div className="flex flex-col gap-4 text-sm px-2 py-4 w-full">
      <div>
        <Label htmlFor="title" className="text-xs pb-2">
          Title
        </Label>
        <Input
          required
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Link Title"
        />
      </div>

      <div>
        <Label htmlFor="title" className="text-xs pb-2">
          Target Url
        </Label>
        <Input
          required
          id="target"
          value={target}
          onChange={(e) => handleTargetChange(e.target.value)}
          placeholder="Link Target"
        />
      </div>

      <div>
        <Label htmlFor="descriptions" className="text-xs pb-2">
          Descriptions
        </Label>
        <Textarea
          id="descriptions"
          value={descriptions}
          onChange={(e) => handleDescriptionsChange(e.target.value)}
          placeholder="descriptions for your link"
        />
      </div>

      <div>
        <Label htmlFor="banner" className="text-xs pb-2">
          Banner
        </Label>
        {banner && (
          <div className="mb-2">
            <Image
              src={banner}
              alt="banner"
              width={200}
              height={100}
              className="rounded-md"
            />
          </div>
        )}
        <Input
          type="file"
          id="banner"
          accept="image/*"
          onChange={handleBannerChange}
          disabled={uploading}
        />
        {uploading && (
          <p className="text-xs text-muted-foreground">Uploading...</p>
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
            variant="secondary"
          >
            Add New Tag
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
      <Button
        onClick={handleAddAttribute}
        variant="secondary"
        className="w-full"
      >
        Add Attributes
      </Button>
      {Object.keys(attributes).map((attribute) => {
        return (
          <div className="flex items-center gap-2">
            <Input
              value={attribute}
              onChange={(e) =>
                handleAttributeKeyChange(e.target.value, attribute)
              }
            />
            =
            <Input
              value={attributes[`${attribute}`]}
              onChange={(e) =>
                handleAttributeValueChange(e.target.value, attribute)
              }
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                handleRemoveAttributeKey(attribute);
              }}
            >
              <X />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
