"use client";
import CreatePageEditor from "@/components/organisms/pages/create-page-editor";
import { Suspense } from "react";

export default function NewPage() {
  return (
    <Suspense>
      <CreatePageEditor />
    </Suspense>
  );
}
