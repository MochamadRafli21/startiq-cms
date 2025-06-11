"use client";
import { LoadingPage } from "@/components/molecule/loading-page";
import { validateSlugViaApi, validateSlug } from "@/utils/pages/slugs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
const PageEditor = dynamic(
  () => import("@/components/organisms/pages/pages-editor"),
  {
    ssr: false,
  },
);
import Link from "next/link";
import PageInfo from "@/components/organisms/pages/pages-info";
import PageMeta from "@/components/organisms/pages/pages-meta";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  ChevronsLeft,
  PanelsTopLeft,
  SquareChevronDown,
  SquareChevronUp,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Page } from "@/types/page.type";
import { Template } from "@/types/template.type";

export default function NewPage() {
  const searchParams = useSearchParams();
  const [minimizeInfo, setMinimizeInfo] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [pageData, setPageData] = useState<Page>({
    title: "",
    slug: "",
    isPublic: false,
  } as Page);
  const router = useRouter();

  const templateId = searchParams.get("template");

  useEffect(() => {
    fetch(`/api/templates/${templateId}`)
      .then((res) => res.json())
      .then((template: Template) => {
        setPageData({
          ...pageData,
          content: template.content,
        });
      });
  }, [templateId]);

  const onValidateSlug = async () => {
    if (!pageData.slug) {
      setSlugError("Slug cant be empty");

      return false;
    }

    const error = validateSlug(pageData.slug);
    if (error) {
      setSlugError(error);

      return false;
    }

    const { valid, error: apiError } = await validateSlugViaApi(pageData.slug);

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
    setSaving(true);
    const isValid = await onValidateSlug();
    if (!isValid) {
      setSaving(false);
      toast.error("Failed on saving page, fix your slug.");

      return;
    }

    if (!pageData.content) {
      setSaving(false);
      toast.error("Failed on saving page, Content cant be empty");

      return;
    }

    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: pageData.title,
        slug: pageData.slug,
        tags: pageData.tags,
        isPublic: pageData.isPublic,
        content: pageData.content,
        metaTitle: pageData.metaTitle,
        metaDescription: pageData.metaDescription,
        metaImage: pageData.metaImage,
      }),
    });

    if (res.ok) {
      const page = await res.json();
      router.push(`/pages/${page.id}/edit`);
      toast.success("Success on creating page");
      setSaving(false);
    } else {
      toast.error("Failed on creating page");
      setSaving(false);
    }
  };

  const handleContentChange = (content: Record<string, any>) => {
    setPageData((prev) => {
      const updated = { ...prev, content };
      handleInfoChange(updated);
      return updated;
    });
  };

  const handleInfoChange = (info: Page) => {
    setPageData(info);
  };

  if (!pageData.content && templateId)
    return <LoadingPage isLoading={!pageData.content} />;
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
            <h6>Page Editor</h6>
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
