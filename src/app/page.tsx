import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import dynamic from "next/dynamic";
const PageRenderer = dynamic(
  () => import("@/components/organisms/pages/page-renderer"),
);

const getPageData = cache(async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/public/*`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
});

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageData();
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

export default async function Page() {
  const pageData = await getPageData();
  if (!pageData) return notFound();

  return (
    <PageRenderer
      content={pageData.content}
      html={pageData.contentHtml}
      css={pageData.contentCss}
    />
  );
}
