"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LoadingPage } from "@/components/molecule/loading-page";
import type { Page } from "@/types/page.type";
const PageEditor = dynamic(
  () => import("@/components/organisms/pages/pages-editor"),
  {
    ssr: false,
  },
);

export default function PublicPageClient({ pageData }: { pageData: Page }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pageData.iconImage) {
      const link =
        document.querySelector("link[rel='icon']") ||
        document.createElement("link");
      link.setAttribute("rel", "icon");
      link.setAttribute("href", pageData.iconImage);
      link.setAttribute("type", "image/png");
      document.head.appendChild(link);
    }
  }, [pageData.iconImage]);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return <LoadingPage isLoading={true} />;

  return <PageEditor content={pageData.content} isPreview={true} />;
}
