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
import type { Template } from "@/types/template.type";
import { useRouter } from "next/navigation";

export default function TemplatesTable() {
  const [search, setSearch] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [total, setTotal] = useState(0);
  const [template, setTemplate] = useState(1);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const limit = 10;
  const router = useRouter();

  useEffect(() => {
    const loadTemplates = async () => {
      const res = await fetch(
        `/api/templates?search=${search}&template=${template}&limit=${limit}`,
      );
      const data = await res.json();
      setTemplates(data.templates);
      setTotal(data.total);
    };
    loadTemplates();
  }, [search, template, refetchTrigger]);

  const handleDelete = async (id?: number) => {
    if (!id) return;

    const res = await fetch(`/api/templates/${id}`, {
      method: "Delete",
    });

    if (res.ok) {
      setRefetchTrigger((prev) => prev + 1);
      toast.success("Success on deleting template");
    } else {
      toast.error("Failed on deleting template");
    }
  };

  const onOpenTemplate = (id?: number) => {
    if (!id) return;
    router.push(`/templates/${id}/edit`);
  };

  return (
    <Card className="w-full h-fit shadow-xl rounded-2xl">
      <CardContent>
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Templates</h1>
            <div className="flex flex-row items-center gap-2">
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setTemplate(1);
                }}
                className="w-64"
              />
              <Link href="/templates/new">
                <Button>
                  <Plus />
                  New Template
                </Button>
              </Link>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates?.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.title}</TableCell>
                  <TableCell>
                    {template.createdAt &&
                      new Date(template.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Ellipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash color="red" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onOpenTemplate(template.id)}
                        >
                          <PenSquare color="blue" />
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
              Showing {(template - 1) * limit + 1}–
              {Math.min(template * limit, total)} of {total}
            </div>
            <div className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTemplate((p) => Math.max(1, p - 1))}
                disabled={template === 1}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTemplate((p) => p + 1)}
                disabled={template * limit >= total}
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
