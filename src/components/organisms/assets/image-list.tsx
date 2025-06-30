"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Asset } from "@/types/asset.type";

export default function AssetsList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const loadAsset = async () => {
      const res = await fetch(`/api/assets`);
      const data = await res.json();
      setAssets(data);
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

  return (
    <Card className="w-full h-fit shadow-xl rounded-2xl">
      <CardContent>
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Assets</h1>
          </div>
          <div className="flex flex-wrap justify-evenly items-start gap-6">
            {assets.map((asset) => (
              <Card
                key={asset.name}
                className="w-fit h-fit shadow-xl rounded-2xl"
              >
                <CardContent className="flex flex-col items-center gap-4 w-full">
                  <div className="w-full  px-4">
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
                  <div className="object-contain grow">
                    {asset.src ? (
                      <Image
                        src={asset.src}
                        alt="Asseet Source"
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
