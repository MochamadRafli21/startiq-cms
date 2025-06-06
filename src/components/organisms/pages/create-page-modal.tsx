import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TemplatesSelect from "@/components/organisms/templates/select-templates";
import { useRouter } from "next/navigation";

export function CreatePageModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const onSelectTemplage = (id: number) => {
    router.push(`/pages/new?template=${id}`);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pick Template</DialogTitle>
          <DialogDescription>
            Select Your Template for new Page
          </DialogDescription>
        </DialogHeader>
        <TemplatesSelect onSelect={(id) => onSelectTemplage(id)} />
        <Link href="/pages/new">
          <Button>Create Blank Page</Button>
        </Link>
      </DialogContent>
    </Dialog>
  );
}
