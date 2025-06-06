"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogClose,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { CreatePageModal } from "./create-page-modal";
import { ConfirmationModal } from "@/components/molecule/confirmation-modal";
import { toast } from "sonner";
import { Ellipsis, Eye, PenSquare, Trash, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

  const handlePublish = async (id?: number) => {
    if (!id) return;

    const page = pages.find((page) => page.id === id);
    if (!page) return;

    const res = await fetch(`/api/pages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...page,
        isPublic: true,
      }),
    });

    if (res.ok) {
      setRefetchTrigger((prev) => prev + 1);
      toast.success("Success on Publishing page");
    } else {
      toast.error("Failed on Publishing page");
    }
  };

  const openPreview = (id?: number) => {
    const page = pages.find((page) => page.id === id);
    if (!page) return;

    router.push(`/preview/${page.slug}`);
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
              <CreatePageModal>
                <Button>
                  <Plus />
                  New Page
                </Button>
              </CreatePageModal>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Publish Status</TableHead>
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
                    {page.isPublic ? (
                      <Badge className="bg-green-200 text-green-800">
                        Publish
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-200 text-yellow-600">
                        Not Publish
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {page.createdAt &&
                      new Date(page.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Ellipsis />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {page.isPublic ? (
                            <DropdownMenuItem
                              onClick={() => openPreview(page.id)}
                            >
                              <Eye color="green" />
                              Open Preview
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handlePublish(page.id)}
                            >
                              <Upload color="green" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          <DialogTrigger asChild>
                            <DropdownMenuItem>
                              <Trash color="red" />
                              Delete
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DropdownMenuItem onClick={() => onOpenPage(page.id)}>
                            <PenSquare color="blue" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>
                            Are You Sure You Want to delete this page
                          </DialogTitle>
                          <DialogDescription>
                            If you do this actions there wont be moving back!
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(page.id)}
                          >
                            Confirm
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
