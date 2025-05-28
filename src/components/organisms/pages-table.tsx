"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Page } from "@/types/page.type";

export default function PagesTable() {
  const [search, setSearch] = useState("");
  const [pages, setPages] = useState<Page[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const loadPages = async () => {
      const res = await fetch(
        `/api/pages?search=${search}&page=${page}&limit=${limit}`,
      );
      const data = await res.json();
      setPages(data.pages);
      setTotal(data.total);
    };
    loadPages();
  }, [search, page]);

  return (
    <Card className="w-full h-fit shadow-xl rounded-2xl">
      <CardContent>
        <div className="space-y-4 w-full min-h-48">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Pages</h1>
            <div className="flex flex-row items-center gap-2">
              <Input
                placeholder="Search pages..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-64"
              />
              <Link href="/pages/new">
                <Button>
                  <Plus />
                  New Page
                </Button>
              </Link>
            </div>
          </div>

          <Table className="min-h-64">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>{page.title}</TableCell>
                  <TableCell>{page.slug}</TableCell>
                  <TableCell className="text-right">
                    {new Date(page.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)}{" "}
              of {total}
            </div>
            <div className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= total}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
