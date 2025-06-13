"use client";

import SubmissionsTable from "@/components/organisms/forms/submission-list";
import { useParams } from "next/navigation";

export default function AdminFormsDetail() {
  const { formNames } = useParams();
  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-100">
      <SubmissionsTable name={formNames as string} />
    </div>
  );
}
