"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { CreateLinkModal } from "./create-link-modal";
import { Badge } from "@/components/ui/badge";
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
import type { Link } from "@/types/link.type";
import { useRouter } from "next/navigation";

export default function LinksList() {
  const [search, setSearch] = useState("");
  const [links, setLinks] = useState<Link[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const limit = 10;
  const router = useRouter();

  useEffect(() => {
    const loadLinks = async () => {
      const res = await fetch(
        `/api/links?search=${search}&page=${page}&limit=${limit}`,
      );
      const data = await res.json();
      setLinks(data.links);
      setTotal(data.total);
    };
    loadLinks();
  }, [search, page, refetchTrigger]);

  const handleDelete = async (id?: number) => {
    if (!id) return;

    const res = await fetch(`/api/links/${id}`, {
      method: "Delete",
    });

    if (res.ok) {
      setRefetchTrigger((prev) => prev + 1);
      toast.success("Success on deleting link");
    } else {
      toast.error("Failed on deleting link");
    }
  };

  const onOpenPage = (id?: number) => {
    if (!id) return;
    router.push(`/admin/links/${id}/edit`);
  };

  return (
    <Card className="w-full h-fit shadow-xl rounded-2xl">
      <CardContent>
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Links</h1>
            <div className="flex flex-row items-center gap-2">
              <Input
                placeholder="Search links..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-64"
              />
              <CreateLinkModal
                onAfterSubmit={() => setRefetchTrigger(refetchTrigger + 1)}
              >
                <Button>
                  <Plus />
                  New Link
                </Button>
              </CreateLinkModal>
            </div>
          </div>
          <div className="flex flex-wrap justify-evenly items-start gap-6">
            {links.map((link) => (
              <Card
                key={link.id}
                className="w-full h-fit shadow-xl rounded-2xl"
              >
                <CardContent className="flex gap-4 w-full">
                  <div>
                    {link.banner ? (
                      <Image
                        src={link.banner}
                        alt="Link Banner"
                        width={150}
                        height={150}
                        className="rounded-md"
                      />
                    ) : (
                      <div className="w-[150px] h-[150px] rounded-lg bg-gray-300" />
                    )}
                  </div>
                  <div className="w-full  px-4">
                    <div className="w-full flex justify-between items-center gap-2 ">
                      <span className="font-semibold">{link.title}</span>
                      <div className="text-right">
                        <Dialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Ellipsis />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DialogTrigger asChild>
                                <DropdownMenuItem>
                                  <Trash color="red" />
                                  Delete
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DropdownMenuItem
                                onClick={() => onOpenPage(link.id)}
                              >
                                <PenSquare color="blue" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>
                                Are You Sure You Want to delete this link
                              </DialogTitle>
                              <DialogDescription>
                                If you do this actions there wont be moving
                                back!
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(link.id)}
                              >
                                Confirm
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <div className="mt-2">
                      {link.tags?.map((tag) => {
                        return (
                          <Badge variant="outline" key={tag}>
                            {tag}
                          </Badge>
                        );
                      })}
                    </div>

                    <div className="min-h-8 max-w-full">
                      <p className="truncate text-wrap text-ellipsis">
                        {link.descriptions}
                      </p>
                    </div>
                    <div className="w-full flex justify-end mt-4">
                      <span className="text-xs text-gray-400 text-right">
                        {link.createdAt &&
                          new Date(link.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
