"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { AssetModal } from "../assets/assets-modal";
import type { PageBodyInput } from "@/types/page.type";

interface PageEditorProps {
  page?: PageBodyInput;
  onChange?: (data: PageBodyInput) => void;
}

export default function PageInfo({ page, onChange }: PageEditorProps) {
  const [metaTitle, setMetaTitle] = useState(page?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    page?.meta_description ?? "",
  );
  const [openIconModal, setOpenIconModal] = useState(false);
  const [iconImage, setIconImage] = useState(page?.icon_image ?? "");

  const [openMetaModal, setOpenMetaModal] = useState(false);
  const [metaImage, setMetaImage] = useState(page?.meta_image ?? "");

  const handleUpdate = (updated: Partial<PageBodyInput>) => {
    const updatedPage: PageBodyInput = {
      ...page!,
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_image: metaImage,
      icon_image: iconImage,
      ...updated,
    };
    onChange?.(updatedPage);
  };

  const handleMetaImageChange = (url: string) => {
    setMetaImage(url);
    handleUpdate({ meta_image: url });
    setOpenMetaModal(false);
  };

  const handleIconImageChange = (url: string) => {
    setIconImage(url);
    handleUpdate({ icon_image: url });
    setOpenIconModal(false);
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
            handleUpdate({ meta_title: e.target.value });
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
            handleUpdate({ meta_description: e.target.value });
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
        <AssetModal
          open={openMetaModal}
          onOpenChange={setOpenMetaModal}
          onSelect={handleMetaImageChange}
        >
          <Button variant="outline">Select Meta Image</Button>
        </AssetModal>

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
        <Label className="text-xs pb-2">Icon Image</Label>
        <AssetModal
          open={openIconModal}
          onOpenChange={setOpenIconModal}
          onSelect={handleIconImageChange}
        >
          <Button variant="outline">Select Icon Image</Button>
        </AssetModal>
      </div>
    </div>
  );
}
