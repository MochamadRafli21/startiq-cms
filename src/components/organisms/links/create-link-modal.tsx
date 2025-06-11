import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import LinkForm from "./link-form";
import type { Link } from "@/types/link.type";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CreateLinkModal({
  children,
  onAfterSubmit,
}: {
  children: React.ReactNode;
  onAfterSubmit?: () => void;
}) {
  const [linkData, setLinkData] = useState({} as Link);
  const [open, setOpen] = useState(false);

  const handleLinkChange = (data: Link) => {
    setLinkData({
      ...linkData,
      ...data,
    });
  };

  const onSubmitLink = async () => {
    if (!linkData.target) {
      toast.error("Failed on saving page, target cant be empty");

      return;
    }

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: linkData.title,
        tags: linkData.tags,
        target: linkData.target,
        descriptions: linkData.descriptions,
        banner: linkData.banner,
      }),
    });

    if (res.ok) {
      toast.success("Success on creating link");
      setOpen(false);
      if (onAfterSubmit) {
        onAfterSubmit();
      }
    } else {
      toast.error("Failed on creating link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Link</DialogTitle>
          <DialogDescription>Fill information for your link</DialogDescription>
        </DialogHeader>
        <div className="max-h-72 overflow-y-scroll">
          <LinkForm link={linkData} onChange={handleLinkChange} />
        </div>
        <DialogFooter>
          <Button onClick={onSubmitLink}>Submit Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
