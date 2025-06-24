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
  const VPS_IP = process.env.NEXT_PUBLIC_IP || "123.123.123.123"; // fallback for safety

  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [pageId, setPageId] = useState("");
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const onSelectPage = (id: string) => {
    setPageId(id);
  };

  const handleDomainChange = (value: string) => {
    setDomain(value);
  };

  const handleSubmit = async () => {
    if (!domain) {
      toast.error("Please Fill All Required Fields");
    }
    setIsSubmitLoading(true);
    const res = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: domain,
        defaultPageId: pageId || null,
      }),
    });

    if (res.ok) {
      toast.success("Success Registering Domain");
      if (onAfterSubmit) {
        setOpen(false);
        onAfterSubmit();
      }
    } else {
      toast.error("Failed Registering Domain");
    }
    setIsSubmitLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register New Domain</DialogTitle>
          <DialogDescription>
            Registering New Domain for you pages
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-scroll max-h-48">
          <p>
            Update your DNS settings in your domain registrar (e.g. GoDaddy,
            Namecheap) with the following:
          </p>

          <div className="mt-4">
            <p className="font-semibold mb-1">Required A Record:</p>
            <div className="overflow-auto">
              <table className="w-full text-left text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Value</th>
                    <th className="p-2 border">TTL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border">A</td>
                    <td className="p-2 border">@</td>
                    <td className="p-2 border">{VPS_IP}</td>
                    <td className="p-2 border">Auto</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 font-semibold">Optional CNAME for www:</p>
            <div className="overflow-auto">
              <table className="w-full text-left text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Value</th>
                    <th className="p-2 border">TTL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border">CNAME</td>
                    <td className="p-2 border">www</td>
                    <td className="p-2 border">yourdomain.com</td>
                    <td className="p-2 border">Auto</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
        <Button disabled={isSubmitLoading} onClick={handleSubmit}>
          Submit Domain
        </Button>
      </DialogContent>
    </Dialog>
  );
}
