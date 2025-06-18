import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AsyncSelect } from "@/components/molecule/async-select-menu";
import { useState } from "react";
import type { Page } from "@/types/page.type";
import { toast } from "sonner";

export function CreateDomainModal({
  children,
  onAfterSubmit,
}: {
  children: React.ReactNode;
  onAfterSubmit?: () => void;
}) {
  const [domain, setDomain] = useState("");
  const [pageId, setPageId] = useState("");

  const onSelectPage = (id: string) => {
    setPageId(id);
  };

  const handleDomainChange = (value: string) => {
    setDomain(value);
  };

  const handleSubmit = async () => {
    if (!domain || !pageId) {
      toast.error("Please Fill ALl Required Fields");
    }

    const res = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: domain,
        defaultPageId: pageId,
      }),
    });

    if (res.ok) {
      toast.success("Success Registering Domain");
      if (onAfterSubmit) {
        onAfterSubmit();
      }
    } else {
      toast.error("Failed Registering Domain");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pick Template</DialogTitle>
          <DialogDescription>
            Select Your Template for new Domain
          </DialogDescription>
        </DialogHeader>
        <Label htmlFor="domain" className="text-xs pb-2">
          Domain
        </Label>
        <Input
          required
          id="domain"
          value={domain}
          onChange={(e) => handleDomainChange(e.target.value)}
          placeholder="Page Title"
        />

        <Label htmlFor="page" className="text-xs pb-2">
          Default Page
        </Label>
        <AsyncSelect<Page>
          value={pageId}
          placeholder="Select Page.."
          onChange={onSelectPage}
          fetchUrl="/api/pages"
          responseKey="pages" // response shape: { pages: [...] }
          mapOption={(page: Page) => ({
            label: page.title || "",
            value: page.id?.toString() as string,
          })}
        />
        <Button onClick={handleSubmit}>Submit Domain</Button>
      </DialogContent>
    </Dialog>
  );
}
