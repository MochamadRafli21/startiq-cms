"use client";

import PageInfo from "@/components/organisms/pages/pages-info";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

import { Page } from "@/types/page.type";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const PageEditor = dynamic(
  () => import("@/components/organisms/pages/pages-editor"),
  {
    ssr: false,
  },
);

export default function EditPage() {
  const { id } = useParams();
  const [pageData, setPageData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/pages/${id}`)
      .then((res) => res.json())
      .then(setPageData);
  }, [id]);

  const handleSave = async () => {
    if (!pageData) return;
    setSaving(true);

    await fetch(`/api/pages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pageData),
    });

    setSaving(false);
  };

  if (!pageData) return <div>Loading page...</div>;

  const handleContentChange = (content: Record<string, any>) => {
    setPageData({
      ...pageData,
      content,
    });
  };

  const handleInfoChange = (info: Page) => {
    setPageData({
      ...pageData,
      ...info,
    });
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
