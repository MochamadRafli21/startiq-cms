import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Template } from "@/types/template.type";

export default function TemplatesSelect({
  onSelect,
}: {
  onSelect: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const loadTemplates = async () => {
      const res = await fetch(
        `/api/templates?search=${search}&page=${page}&limit=${limit}`,
      );
      const data = await res.json();
      setTemplates(data.templates);
    };
    loadTemplates();
  }, [search, page]);

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <div className="flex flex-row items-center gap-2">
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-64"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {templates?.map((template) => (
          <div key={template.id} className="w-full">
            <Button
              variant="outline"
              className="w-full flex justify-between rounded-lg py-2"
              onClick={() => onSelect(template?.id as number)}
            >
              <span className="font-semibold text-md">{template.title}</span>
              <span>
                {template.createdAt &&
                  new Date(template.createdAt).toLocaleDateString()}
              </span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
