"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function FormNamesList() {
  const [search, setSearch] = useState("");
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    const loadLinks = async () => {
      const res = await fetch(`/api/forms/names`);
      const data = await res.json();
      setNames(data.forms);
    };
    loadLinks();
  }, [search]);

  return (
    <Card className="w-full h-fit shadow-xl rounded-2xl">
      <CardContent>
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Forms</h1>
            <div className="flex flex-row items-center gap-2">
              <Input
                placeholder="Search forms..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="w-64"
              />
            </div>
          </div>
          <div className="flex w-full flex-col justify-evenly items-start gap-2">
            {names.map((name) => (
              <Link
                href={`/admin/forms/${name}`}
                className="flex flex-col px-4 py-2 w-full shadow-xl border border-gray-200 hover:bg-gray-300 transition-colors ease-in rounded-md"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
