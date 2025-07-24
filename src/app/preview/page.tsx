import { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicPageClient from "@/components/organisms/pages/pages-public";

async function getPageData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/public/*`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageData();
  if (!pageData) return { title: "Page Not Found" };

  return {
    icons: {
      icon: pageData.icon_image,
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

  return <PublicPageClient pageData={pageData} />;
}
