"use client";

import TemplateInfo from "@/components/organisms/templates/templates-info";
import { LoadingPage } from "@/components/molecule/loading-page";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Save,
  ChevronsLeft,
  PanelsTopLeft,
  Trash,
  SquareChevronDown,
  SquareChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Template } from "@/types/template.type";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ConfirmationModal } from "@/components/molecule/confirmation-modal";

const TemplateEditor = dynamic(
  () => import("@/components/organisms/pages/pages-editor"),
  {
    ssr: false,
  },
);

export default function EditTemplate() {
  const { id } = useParams();
  const [minimizeInfo, setMinimizeInfo] = useState<boolean>(false);
  const [templateData, setTemplateData] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/templates/${id}`)
      .then((res) => res.json())
      .then(setTemplateData);
  }, [id, refetchTrigger]);

  const handleSave = async () => {
    if (!templateData) return;
    setSaving(true);

    if (!templateData.content) {
      setSaving(false);
      toast.error("Failed on saving template, Content cant be empty");

      return;
    }

    const res = await fetch(`/api/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateData),
    });

    if (res.ok) {
      setRefetchTrigger((prev) => prev + 1);
      toast.success("Success on updating template");
      setSaving(false);
    } else {
      toast.error("Failed on updating template");
      setSaving(false);
    }
  };

  if (!templateData) return <LoadingPage isLoading={!templateData} />;

  const handleContentChange = (content: Record<string, object>) => {
    setTemplateData((prev: Template | null) => {
      const updated = { ...prev, content };
      handleInfoChange(updated);
      return updated;
    });
  };

  const handleInfoChange = (info: Template) => {
    setTemplateData({
      ...templateData,
      ...info,
    });
  };

  const onDelete = async () => {
    const id = templateData.id;
    if (!id) return;

    const res = await fetch(`/api/templates/${id}`, {
      method: "Delete",
    });

    if (res.ok) {
      toast.success("Success on deleting template");
      router.push("/admin/templates");
    } else {
      setRefetchTrigger((prev) => prev + 1);
      toast.error("Failed on deleting template");
    }
  };

  return (
    <div className="flex w-full">
      <div
        className={
          minimizeInfo ? "absolute flex flex-col" : "relative flex flex-col"
        }
      >
        <div className="flex items-center border-b border-gray-200">
          <div className="flex items-center gap-2 font-semibold p-4">
            <Link href="/admin/templates">
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
            variant="ghost"
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
        <div className="flex justify-end font-semibold gap-2 p-3 border-b border-l border-gray-200">
          <ConfirmationModal onConfirm={onDelete}>
            <Button variant={"outline"} size="icon" className="text-red-600">
              <Trash />
            </Button>
          </ConfirmationModal>
          <Button onClick={handleSave} size={"sm"}>
            <Save />
            Save
          </Button>
        </div>
        <div className={"w-full min-h-screen"}>
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
