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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Ellipsis, PenSquare, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Page } from "@/types/page.type";
import { useRouter } from "next/navigation";

export default function PagesTable() {
  const [search, setSearch] = useState("");
  const [pages, setPages] = useState<Page[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const limit = 10;
  const router = useRouter();

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
  }, [search, page, refetchTrigger]);

  const handleDelete = async (id?: number) => {
    if (!id) return;

    const res = await fetch(`/api/pages/${id}`, {
      method: "Delete",
    });

    if (res.ok) {
      setRefetchTrigger((prev) => prev + 1);
      toast.success("Success on deleting page");
    } else {
      toast.error("Failed on deleting page");
    }
  };

  const onOpenPage = (id?: number) => {
    if (!id) return;
    router.push(`/pages/${id}/edit`);
  };

  return (
    <Card className="w-full h-fit shadow-xl rounded-2xl">
      <CardContent>
        <div className="space-y-4 w-full">
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>{page.title}</TableCell>
                  <TableCell>{page.slug}</TableCell>
                  <TableCell>
                    {new Date(page.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Ellipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleDelete(page.id)}>
                          <Trash color="red" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onOpenPage(page.id)}>
                          <PenSquare color="green" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
