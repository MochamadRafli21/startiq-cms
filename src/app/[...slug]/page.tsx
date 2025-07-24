import { Metadata } from "next";
import { notFound } from "next/navigation";
import { extractBodyContent, parseAttributes } from "@/utils/html/parser";
import PageRenderer from "@/components/organisms/pages/page-renderer";

async function getPageData(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/public/slug?slug=${slug}`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const fullSlug = resolvedParams.slug?.join("/") ?? "";
  const pageData = await getPageData(fullSlug);
  if (!pageData) return { title: "Page Not Found" };
  return {
    icons: {
      icon: pageData.icon_image || pageData.meta_image,
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
      description: pageData.meta_dscription || "",
      images: pageData.meta_image ? [pageData.meta_image] : [],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const resolvedParams = await params;
  const fullSlug = resolvedParams.slug?.join("/") ?? "";
  const pageData = await getPageData(fullSlug);
  if (!pageData) return notFound();
  const { attributes, inner } = extractBodyContent(pageData.html);
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
