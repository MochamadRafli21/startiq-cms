"use client";

import { useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
const PageEditor = dynamic(
  () => import("@/components/organisms/pages-editor"),
  {
    ssr: false,
  },
);
import PageInfo from "@/components/organisms/pages-info";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

import { useRouter } from "next/navigation";
import { Page } from "@/types/page.type";

export default function NewPage() {
  const [saving, setSaving] = useState(false);
  const [pageData, setPageData] = useState<Page>({
    title: "",
    slug: "",
    isPublic: false,
  } as Page);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);

    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: pageData.title,
        slug: pageData.slug,
        tags: [],
        isPublic: pageData.isPublic,
        content: pageData.content,
      }),
    });

    if (res.ok) {
      const page = await res.json();
      router.push(`/pages/${page.id}/edit`);
      toast.success("Success on creating page");
    } else {
      toast.error("Failed on creating page");
    }
  };

  const handleContentChange = (content: Record<string, any>) => {
    setPageData({
      ...pageData,
      content,
    });
  };

  const handleInfoChange = (info: Page) => {
    setPageData(info);
  };

  return (
    <div className="flex w-full">
      <div className="flex flex-col">
        <div className="font-semibold p-4 border-b border-gray-200">
          <h6>Page Editor</h6>
        </div>
        <PageInfo page={pageData} onChange={handleInfoChange} />
      </div>
      <div className="flex flex-col w-full">
        <div className="flex justify-end font-semibold p-3 border-b border-l border-gray-200">
          <Button onClick={handleSave} size={"sm"}>
            <Save />
            Save
          </Button>
        </div>
        <PageEditor
          content={pageData.content}
          onContentChange={handleContentChange}
        />
      </div>
      {saving && (
        <div className="bg-gray-700 opacity-70 absolute z-[99] w-full min-h-screen">
          <p className="text-slate-500 mt-2">Saving...</p>
        </div>
      )}
    </div>
  );
}
