import { Metadata } from "next";
import { notFound } from "next/navigation";
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
      icon: pageData.iconImage || pageData.metaImage,
    },
    title: pageData.metaTitle || pageData.title,
    description: pageData.metaDescription || "",
    openGraph: {
      title: pageData.metaTitle || pageData.title,
      description: pageData.metaDescription || "",
      images: pageData.metaImage ? [{ url: pageData.metaImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: pageData.metaTitle || pageData.title,
      description: pageData.metaDescription || "",
      images: pageData.metaImage ? [pageData.metaImage] : [],
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
  return (
    <PageRenderer
      content={pageData.content}
      html={pageData.contentHtml}
      css={pageData.contentCss}
    />
  );
}
