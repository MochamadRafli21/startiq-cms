"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { Plus, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Asset } from "@/types/asset.type";

export default function AssetsList({
  onSelect,
}: {
  onSelect?: (selectedSrc: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const loadAsset = async () => {
      const res = await fetch(`/api/assets`);
      const data = (await res.json()) as Asset[];
      setAssets(data.reverse());
    };
    loadAsset();
  }, [refetchTrigger]);

  const handleDelete = async (name?: string) => {
    if (!name) return;

    const res = await fetch(`/api/assets/?name=${name}`, {
      method: "Delete",
    });

    if (res.ok) {
      setRefetchTrigger((prev) => prev + 1);
      toast.success("Success on deleting asset");
    } else {
      toast.error("Failed on deleting asset");
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      return asset.name.includes(search) || asset.src.includes(search);
    });
  }, [assets, search]);

  const handleClickAssets = (src: string) => {
    if (onSelect) {
      onSelect(src);
    }
  };

  const onUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { data } = await res.json();
      const url = data?.at(0)?.src;
      setRefetchTrigger((prev) => prev + 1);
      handleClickAssets(url);
    } catch (err) {
      console.error("Image upload failed:", err);
      // Optionally show an error toast here
    } finally {
      setUploading(false);
    }
  };
  return (
    <Card className="w-full h-fit shadow-xl rounded-2xl">
      <CardContent>
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Assets</h1>

            <Input
              placeholder="Search assets..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              className="w-64"
            />
          </div>
          <div className="flex flex-wrap justify-evenly items-stretch gap-6">
            <Label
              htmlFor="fileUpload"
              className="w-full max-w-[290px] grow h-full"
            >
              <Card className="w-full shadow-xl rounded-2xl px-4 h-full">
                <CardContent className="flex border-primary mx-auto border-dashed border-2 bg-purple-100 hover:bg-purple-500 ease-in rounded font-semibold flex-col justify-center items-center gap-6 w-full h-full py-4">
                  <Plus size={24} />
                  <span>Upload New Image</span>
                </CardContent>
              </Card>
              <Input
                hidden
                type="file"
                id="fileUpload"
                onChange={onUploadImage}
                disabled={uploading}
                accept="image/*"
              />
            </Label>
            {filteredAssets.map((asset) => (
              <Card key={asset.name} className="w-fit shadow-xl rounded-2xl">
                <CardContent className="flex flex-col items-center gap-4 w-full h-full">
                  <div className="w-full px-4">
                    <div className="w-full flex justify-between items-center gap-2 ">
                      <span className="text-sm truncate font-medium max-w-[180px]">
                        {asset.name}
                      </span>
                      <div className="text-right">
                        <Dialog>
                          <DialogTrigger>
                            <Trash color="red" size={18} />
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>
                                Are You Sure You Want to delete this file
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
                                onClick={() => handleDelete(asset.name)}
                              >
                                Confirm
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      "object-contain my-auto" + onSelect
                        ? "hover:opacity-40 cursor-pointer"
                        : ""
                    }
                    onClick={() => handleClickAssets(asset.src)}
                  >
                    {asset.src ? (
                      <Image
                        src={asset.src}
                        alt="Asset Source"
                        width={150}
                        height={150}
                        className="rounded-md"
                      />
                    ) : (
                      <div className="w-[150px] h-[150px] rounded-lg bg-gray-300" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
