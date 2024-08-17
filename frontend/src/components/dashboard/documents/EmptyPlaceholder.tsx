import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function EmptyPlaceholder() {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <FileText className="w-10 h-10" />
        <h3 className="mt-4 text-lg font-semibold">No documents</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You have not created any documents. Create one below.
        </p>
        <Button size="sm" className="relative">
          Create Document
        </Button>
      </div>
    </div>
  );
}
