"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Page } from "@/types/page.type";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

interface PageEditorProps {
  page?: Page;
  onChange?: (data: Page) => void;
}

export default function PageInfo({ page, onChange }: PageEditorProps) {
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    page?.metaDescription ?? "",
  );
  const [metaImage, setMetaImage] = useState(page?.metaImage ?? "");
  const [uploading, setUploading] = useState(false);
  const [iconImage, setIconImage] = useState(page?.iconImage ?? "");
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const handleUpdate = (updated: Partial<Page>) => {
    const updatedPage: Page = {
      ...page!,
      metaTitle,
      metaDescription,
      metaImage,
      ...updated,
    };
    onChange?.(updatedPage);
  };

  const onMetaImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
      setMetaImage(url);
      handleUpdate({ metaImage: url });
    } catch (err) {
      console.error("Image upload failed:", err);
      // Optionally show an error toast here
    } finally {
      setUploading(false);
    }
  };

  const onIconImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setUploadingIcon(true);

    try {
      const res = await fetch("/api/uploads/file", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { data } = await res.json();
      const url = data?.at(0)?.src;
      setIconImage(url);
      handleUpdate({ metaImage: url });
    } catch (err) {
      console.error("Image upload failed:", err);
      // Optionally show an error toast here
    } finally {
      setUploadingIcon(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-sm px-2 py-4 w-64">
      <div>
        <Label htmlFor="metaTitle" className="text-xs pb-2">
          Meta Title
        </Label>
        <Input
          id="metaTitle"
          value={metaTitle}
          onChange={(e) => {
            setMetaTitle(e.target.value);
            handleUpdate({ metaTitle: e.target.value });
          }}
          placeholder="Title"
        />
      </div>
      <div>
        <Label htmlFor="metaDescription" className="text-xs pb-2">
          Meta Description
        </Label>
        <Textarea
          id="metaDescription"
          value={metaDescription}
          onChange={(e) => {
            setMetaDescription(e.target.value);
            handleUpdate({ metaDescription: e.target.value });
          }}
          placeholder="Short description for SEO"
        />
      </div>
      <div>
        <Label htmlFor="metaImage" className="text-xs pb-2">
          Meta Image
        </Label>
        {metaImage && (
          <div className="mb-2">
            <Image
              src={metaImage}
              alt="Meta Image"
              width={200}
              height={100}
              className="rounded-md"
            />
          </div>
        )}
        <Input
          type="file"
          id="metaImage"
          accept="image/*"
          onChange={onMetaImageFileChange}
          disabled={uploading}
        />
        {uploading && (
          <p className="text-xs text-muted-foreground">Uploading...</p>
        )}

        {iconImage && (
          <div className="mb-2">
            <Image
              src={iconImage}
              alt="Icon Image"
              width={200}
              height={100}
              className="rounded-md"
            />
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="iconImage" className="text-xs pb-2">
          Icon Image
        </Label>
        <Input
          type="file"
          id="iconImage"
          accept="image/png, .ico"
          onChange={onIconImageFileChange}
          disabled={uploadingIcon}
        />
        {uploadingIcon && (
          <p className="text-xs text-muted-foreground">Uploading...</p>
        )}
      </div>
    </div>
  );
}
