"use client";

import { LoadingPage } from "@/components/molecule/loading-page";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const PageEditor = dynamic(
  () => import("@/components/organisms/pages/pages-editor"),
  {
    ssr: false,
  },
);

export default function PublicPage() {
  const { slug } = useParams();
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/public/${slug}`)
      .then((res) => res.json())
      .then(setPageData);
  }, [slug]);

  if (!pageData) return <LoadingPage isLoading={!pageData} />;

  return <PageEditor content={pageData.content} isPreview={true} />;
}
