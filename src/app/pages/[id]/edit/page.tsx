"use client";

import PageInfo from "@/components/organisms/pages/pages-info";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, ChevronsLeft, PanelsTopLeft, Trash } from "lucide-react";
import { validateSlugViaApi, validateSlug } from "@/utils/pages/slugs";
import { useRouter } from "next/navigation";

import { Page } from "@/types/page.type";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

const PageEditor = dynamic(
  () => import("@/components/organisms/pages/pages-editor"),
  {
    ssr: false,
  },
);

export default function EditPage() {
  const { id } = useParams();
  const [pageData, setPageData] = useState<any>(null);
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
    if (!pageData.slug) {
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
      <div className="flex flex-col">
        <div className="flex items-center gap-2 font-semibold p-4 border-b border-gray-200">
          <Link href="/admin">
            <Button size="icon">
              <ChevronsLeft />
            </Button>
          </Link>
          <PanelsTopLeft />
          <h6>Page Editor</h6>
        </div>
        <div className="flex gap-2">
          <PageInfo page={pageData} onChange={handleInfoChange} />
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="flex justify-end font-semibold gap-2 p-3 border-b border-l border-gray-200">
          <Button
            onClick={onDelete}
            variant={"outline"}
            size="icon"
            className="text-red-600"
          >
            <Trash />
          </Button>
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
