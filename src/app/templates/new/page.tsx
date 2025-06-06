"use client";
import { LoadingPage } from "@/components/molecule/loading-page";
import { useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
const TemplateEditor = dynamic(
  () => import("@/components/organisms/pages/pages-editor"),
  {
    ssr: false,
  },
);
import Link from "next/link";
import TemplateInfo from "@/components/organisms/templates/templates-info";
import { Button } from "@/components/ui/button";
import {
  Save,
  ChevronsLeft,
  PanelsTopLeft,
  SquareChevronDown,
  SquareChevronUp,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { Template } from "@/types/template.type";

export default function NewTemplate() {
  const [minimizeInfo, setMinimizeInfo] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [templateData, setTemplateData] = useState<Template>({
    title: "",
  } as Template);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);

    if (!templateData.content) {
      setSaving(false);
      toast.error("Failed on saving template, Content cant be empty");

      return;
    }

    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: templateData.title,
        content: templateData.content,
      }),
    });

    if (res.ok) {
      const template = await res.json();
      router.push(`/templates/${template.id}/edit`);
      toast.success("Success on creating template");
      setSaving(false);
    } else {
      toast.error("Failed on creating template");
      setSaving(false);
    }
  };

  const handleContentChange = (content: Record<string, any>) => {
    setTemplateData((prev) => {
      const updated = { ...prev, content };
      handleInfoChange(updated);
      return updated;
    });
  };

  const handleInfoChange = (info: Template) => {
    setTemplateData(info);
  };

  return (
    <div className="flex w-full">
      <div
        className={
          minimizeInfo ? "absolute flex flex-col" : "relative flex flex-col"
        }
      >
        <div className="flex flex-col border-b border-gray-200">
          <div className="flex items-center gap-2 font-semibold p-4">
            <Link href="/admin">
              <Button size="sm">
                <ChevronsLeft size="sm" />
              </Button>
            </Link>
            <PanelsTopLeft />
            <h6>Template Editor</h6>
          </div>

          <Button
            hidden={!minimizeInfo}
            size="sm"
            className="absolute bottom-[-24] rounded-none z-[1000] w-full py-1 px-1 flex flex-row items-center justify-center"
            onClick={() => setMinimizeInfo(false)}
          >
            <SquareChevronDown /> Expand Info
          </Button>
        </div>
        <div className="flex flex-col" hidden={minimizeInfo}>
          <TemplateInfo template={templateData} onChange={handleInfoChange} />
          <div className="w-full mt-4">
            <Button
              variant="ghost"
              className="w-full py-3 px-2 flex flex-row items-center justify-center"
              onClick={() => setMinimizeInfo(true)}
            >
              <SquareChevronUp /> Minimize Info
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="flex justify-end font-semibold p-3 border-b border-l border-gray-200">
          <Button onClick={handleSave} size={"sm"}>
            <Save />
            Save
          </Button>
        </div>
        <div
          className={
            minimizeInfo
              ? "w-full min-h-screen hover:absolute hover:z-[1001] hover:bottom-[-48]"
              : "w-full min-h-screen"
          }
        >
          <TemplateEditor
            content={templateData.content}
            onContentChange={handleContentChange}
          />
        </div>
      </div>
      {saving && <LoadingPage isLoading={saving} />}
    </div>
  );
}
