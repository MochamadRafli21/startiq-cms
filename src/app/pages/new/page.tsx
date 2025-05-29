"use client";
import { LoadingPage } from "@/components/molecule/loading-page";
import { validateSlugViaApi, validateSlug } from "@/utils/pages/slugs";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Save, ChevronsLeft, PanelsTopLeft } from "lucide-react";

import { useRouter } from "next/navigation";
import { Page } from "@/types/page.type";

export default function NewPage() {
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [pageData, setPageData] = useState<Page>({
    title: "",
    slug: "",
    isPublic: false,
  } as Page);
  const router = useRouter();

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
      setSaving(false);
    } else {
      toast.error("Failed on creating page");
      setSaving(false);
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
        <div className="flex gap-2 font-semibold items-center p-4 border-b border-gray-200">
          <Link href="/admin">
            <Button size="icon">
              <ChevronsLeft />
            </Button>
          </Link>
          <PanelsTopLeft />
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
      {saving && <LoadingPage isLoading={saving} />}
    </div>
  );
}
