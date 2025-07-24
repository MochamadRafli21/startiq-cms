import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import dynamic from "next/dynamic";
import { extractBodyContent, parseAttributes } from "@/utils/html/parser";
import { PageFullRecord } from "@/types/page.type";
const PageRenderer = dynamic(
  () => import("@/components/organisms/pages/page-renderer"),
);

const getPageData = cache(async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/public/*`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  const response: PageFullRecord = await res.json();
  return response;
});

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageData();
  if (!pageData) return { title: "Page Not Found" };
  return {
    icons: {
      icon: pageData.icon_image || pageData.meta_image || "",
    },
    title: pageData.meta_title || pageData.title,
    description: pageData.meta_description || "",
    openGraph: {
      title: pageData.meta_title || pageData.title,
      description: pageData.meta_description || "",
      images: pageData.meta_image ? [{ url: pageData.meta_image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: pageData.meta_title || pageData.title,
      description: pageData.meta_description || "",
      images: pageData.meta_image ? [pageData.meta_image] : [],
    },
  };
}

export default async function Page() {
  const pageData = await getPageData();
  if (!pageData) return notFound();
  const { attributes, inner } = extractBodyContent(pageData.html || "");
  return (
    <>
      <style>{pageData.css}</style>
      <main
        id="root"
        {...parseAttributes(attributes)}
        dangerouslySetInnerHTML={{ __html: inner }}
      />
      <PageRenderer content={pageData.content} />
    </>
  );
}
