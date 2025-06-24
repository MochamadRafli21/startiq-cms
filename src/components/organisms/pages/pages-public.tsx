"use client";

import dynamic from "next/dynamic";
import type { Page } from "@/types/page.type";
const PageEditor = dynamic(
  () => import("@/components/organisms/pages/pages-editor"),
  {
    ssr: false,
  },
);

export default function PublicPageClient({ pageData }: { pageData: Page }) {
  return <PageEditor content={pageData.content} isPreview={true} />;
}
