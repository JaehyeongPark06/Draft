import { FileText, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyPlaceholder({
  onCreate,
}: {
  onCreate: () => Promise<void>;
}) {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <FileText className="w-10 h-10" />
        <h3 className="mt-4 text-lg font-semibold">No documents</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You have not created any documents. Create one below.
        </p>
        <Button size="sm" className="relative" onClick={onCreate}>
          Create Document
        </Button>
      </div>
    </div>
  );
}

export function SearchPlaceholder() {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <Search className="w-10 h-10" />
        <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          No documents matched your search. Try different keywords.
        </p>
      </div>
    </div>
  );
}

export function SharedPlaceholder() {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <Users className="w-10 h-10" />
        <h3 className="mt-4 text-lg font-semibold">No shared documents</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          No documents have been shared with you.
        </p>
      </div>
    </div>
  );
}
