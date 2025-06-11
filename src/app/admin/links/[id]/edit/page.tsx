"use client";
import { UpdateLinkPage } from "@/components/organisms/links/link-edit";
import { useParams } from "next/navigation";

export default function AdminLinkDetail() {
  const { id } = useParams();
  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-100">
      <UpdateLinkPage linkId={id as string} />
    </div>
  );
}
