import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { PenToolIcon, Settings, WholeWord } from "lucide-react";
import { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Card className="w-full h-fit shadow-xl rounded-2xl">
      <CardContent>
        <div className="space-y-4 w-full mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-primary">
              <Settings />
              <h1 className="text-xl font-semibold">Settings</h1>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex flex-col items-center justify-center">
            <Link
              href="/admin/settings"
              className="w-full font-medium flex items-center gap-2 py-2 px-4 hover:text-primary"
            >
              <WholeWord size={18} />
              Domain
            </Link>
            <Link
              href="/admin/settings/tutorial"
              className="w-full font-medium flex items-center gap-2 py-2 px-4 hover:text-primary"
            >
              <PenToolIcon size={18} />
              Tutorial
            </Link>
          </div>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
