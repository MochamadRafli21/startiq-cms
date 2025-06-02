"use client";

import { LoadingPage } from "@/components/molecule/loading-page";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const PageEditor = dynamic(
  () => import("@/components/organisms/pages/pages-editor"),
  {
    ssr: false,
  },
);

export default function RootPublicPage() {
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/public/*`)
      .then((res) => res.json())
      .then(setPageData);
  }, []);

  if (!pageData) return <LoadingPage isLoading={!pageData} />;

  return <PageEditor content={pageData.content} isPreview={true} />;
}
