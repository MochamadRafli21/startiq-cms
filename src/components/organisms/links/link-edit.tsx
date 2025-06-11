import { useState, useEffect } from "react";
import LinkForm from "./link-form";
import type { Link } from "@/types/link.type";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UpdateLinkPage({ linkId }: { linkId: string }) {
  const [linkData, setLinkData] = useState({} as Link);

  useEffect(() => {
    fetch(`/api/links/${linkId}`)
      .then((res) => res.json())
      .then(setLinkData);
  }, [linkId]);

  const handleLinkChange = (data: Link) => {
    setLinkData({
      ...linkData,
      ...data,
    });
  };

  const onSubmitLink = async () => {
    if (!linkData.target) {
      toast.error("Failed on saving link, target cant be empty");

      return;
    }

    const res = await fetch(`/api/links/${linkId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: linkData.title,
        tags: linkData.tags,
        target: linkData.target,
        descriptions: linkData.descriptions,
        attributes: linkData.attributes,
        banner: linkData.banner,
      }),
    });

    if (res.ok) {
      toast.success("Success on updating link");
    } else {
      toast.error("Failed on updating link");
    }
  };

  return (
    <Card className="w-full">
      <CardContent>
        <CardHeader>
          <CardTitle>Update Link</CardTitle>
          <CardDescription>Fill information for your link</CardDescription>
        </CardHeader>
        <div className="px-4">
          {linkData.title ? (
            <LinkForm link={linkData} onChange={handleLinkChange} />
          ) : (
            <span>loading...</span>
          )}
        </div>
        <CardFooter>
          <Button onClick={onSubmitLink}>Update Link</Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
