import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import AssetsList from "./assets-list";

export function AssetModal({
  children,
  onSelect,
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (state: boolean) => void;
  children: React.ReactNode;
  onSelect?: (url: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle hidden>Asset Manager</DialogTitle>
      <DialogContent className="max-w-[425px] md:max-w-7xl max-h-[80vh] overflow-y-auto">
        <AssetsList onSelect={onSelect} />
      </DialogContent>
    </Dialog>
  );
}
