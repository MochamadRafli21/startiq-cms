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
import type { Form } from "@/types/form.type";
import { DatePickerRange } from "@/components/molecule/date-picker/date-picker-range";

export default function SubmissionsTable({ name }: { name?: string }) {
  const [search, setSearch] = useState("");
  const [forms, setForms] = useState<Form[]>([]);
  const [from, setFrom] = useState<Date>();
  const [to, setTo] = useState<Date>();
  const [keys, setKeys] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const loadForms = async () => {
      let queryString = `search=${search}&page=${page}&name=${name}&limit=${limit}`;
      if (from) {
        queryString += `&startDate=${from.toISOString()}`;
      }
      if (to) {
        queryString += `&endDate=${to.toISOString()}`;
      }
      const res = await fetch(`/api/forms?${queryString}`);
      const data = await res.json();
      setForms(data.forms);
      setTotal(data.total);
      const firstForm = data?.forms?.at(0);

      const allKeys = firstForm?.data ? Object.keys(firstForm.data) : [];
      setKeys(allKeys);
    };
    loadForms();
  }, [search, page, name, from, to]);

  return (
    <Card className="w-full h-fit shadow-xl rounded-2xl">
      <CardContent>
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Forms</h1>
            </div>
            <div className="flex flex-row items-center gap-2">
              <DatePickerRange
                placeholder="Filter by Created At"
                from={from}
                to={to}
                onChange={(from, to) => {
                  setFrom(from);
                  setTo(to);
                }}
              />
              <Input
                placeholder="Search forms..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-64"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form</TableHead>
                {keys.map((key, index) => (
                  <TableHead key={index}>{key}</TableHead>
                ))}
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>{form.name}</TableCell>
                  {keys.map((key, index) => (
                    <TableCell key={index}>
                      {typeof form.data?.[key] === "object" &&
                      form.data?.[key] !== null
                        ? JSON.stringify(form.data[key])
                        : String(form.data?.[key] ?? "")}
                    </TableCell>
                  ))}
                  <TableCell>
                    {form.createdAt &&
                      new Date(form.createdAt).toLocaleDateString()}
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
