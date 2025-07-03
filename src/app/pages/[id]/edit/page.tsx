"use client";

import PageInfo from "@/components/organisms/pages/pages-info";
import PageMeta from "@/components/organisms/pages/pages-meta";
import { LoadingPage } from "@/components/molecule/loading-page";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Save,
  ChevronsLeft,
  PanelsTopLeft,
  Trash,
  SquareChevronDown,
  SquareChevronUp,
} from "lucide-react";
import { validateSlugViaApi, validateSlug } from "@/utils/pages/slugs";
import { useRouter } from "next/navigation";

import { PageBodyInput, PageFullRecord } from "@/types/page.type";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ConfirmationModal } from "@/components/molecule/confirmation-modal";
import { ProjectData } from "grapesjs";

const PageEditor = dynamic(
  () => import("@/components/organisms/pages/pages-editor"),
  {
    ssr: false,
  },
);

export default function EditPage() {
  const { id } = useParams();
  const [minimizeInfo, setMinimizeInfo] = useState<boolean>(false);
  const [pageData, setPageData] = useState<PageFullRecord | null>(null);
  const [slugError, setSlugError] = useState("");
  const [saving, setSaving] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/pages/${id}`)
      .then((res) => res.json())
      .then(setPageData);
  }, [id, refetchTrigger]);

  const onValidateSlug = async () => {
    if (!pageData?.slug) {
      setSlugError("Slug cant be empty");

      return false;
    }

    const error = validateSlug(pageData.slug);

    if (error) {
      setSlugError(error);

      return false;
    }

    const { valid, error: apiError } = await validateSlugViaApi(
      pageData.slug,
      pageData.id,
    );

    if (!valid || apiError) {
      setSlugError(apiError || "Slug is already used by other page");

      return false;
    }

    if (slugError) {
      setSlugError("");
    }

    return true;
  };

  const handleSave = async () => {
    if (!pageData) return;
    setSaving(true);

    if (!pageData.content) {
      setSaving(false);
      toast.error("Failed on saving page, Content cant be empty");

      return;
    }

    const isValid = await onValidateSlug();
    if (!isValid) {
      setSaving(false);
      toast.error("Failed on saving page, fix your slug.");

      return;
    }
    const res = await fetch(`/api/pages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pageData),
    });

    if (res.ok) {
      setRefetchTrigger((prev) => prev + 1);
      toast.success("Success on updating page");
      setSaving(false);
    } else {
      toast.error("Failed on updating page");
      setSaving(false);
    }
  };

  if (!pageData) return <LoadingPage isLoading={!pageData} />;

  const handleContentChange = (
    content: ProjectData,
    html: string,
    css?: string,
  ) => {
    setPageData((prev) => {
      const updated = {
        ...prev,
        content,
        contentHtml: html,
        contentCss: css,
      } as PageFullRecord;
      handleInfoChange(updated);
      return updated;
    });
  };

  const handleInfoChange = (info: PageBodyInput) => {
    setPageData({
      ...pageData,
      ...info,
    });
  };

  const onDelete = async () => {
    const id = pageData.id;
    if (!id) return;

    const res = await fetch(`/api/pages/${id}`, {
      method: "Delete",
    });

    if (res.ok) {
      toast.success("Success on deleting page");
      router.push("/admin");
    } else {
      setRefetchTrigger((prev) => prev + 1);
      toast.error("Failed on deleting page");
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
          <div className="flex justify-center items-center gap-2 font-semibold p-4">
            <Link href="/admin">
              <Button size="sm">
                <ChevronsLeft size="sm" />
              </Button>
            </Link>
            <PanelsTopLeft />
            <h6>Page Editor</h6>
          </div>

          <Button
            hidden={!minimizeInfo}
            size="sm"
            color="primary"
            variant="ghost"
            onClick={() => setMinimizeInfo(false)}
          >
            <SquareChevronDown /> Expand Info
          </Button>
        </div>
        <div
          className="flex flex-col max-h-screen overflow-y-auto"
          hidden={minimizeInfo}
        >
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="meta">Meta</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <PageInfo page={pageData} onChange={handleInfoChange} />
            </TabsContent>
            <TabsContent value="meta">
              <PageMeta page={pageData} onChange={handleInfoChange} />
            </TabsContent>
          </Tabs>
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
          <ConfirmationModal onConfirm={() => onDelete()}>
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
          <PageEditor
            content={pageData.content}
            onContentChange={handleContentChange}
          />
        </div>
      </div>
      {saving && <LoadingPage isLoading={saving} />}
    </div>
  );
}
