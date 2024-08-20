import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { EllipsisVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";
import { Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useState } from "react";

interface DocumentProps {
  id: string;
  name: string;
  shared: boolean;
  lastModified: string;
  ownedBy: string;
  removeDocument: (id: string) => Promise<void>;
  renameDocument: (id: string, newName: string) => Promise<void>;
}

export default function Document({
  id,
  name,
  shared,
  lastModified,
  ownedBy,
  removeDocument,
  renameDocument,
}: DocumentProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);

  // trim if name is too long
  function trimName(name: string) {
    if (name.length > 20) {
      return name.slice(0, 20) + "...";
    }
    return name;
  }

  const handleRename = async () => {
    setIsRenaming(true);
    try {
      await renameDocument(id, newName);
    } finally {
      setIsRenaming(false);
    }
  };

  // format the date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div
      className="rounded-md p-4 flex flex-row gap-2 justify-between border border-dashed hover:bg-accent transition-all select-none cursor-pointer"
      onClick={(e) => {
        console.log("Document clicked");
      }}
    >
      <div className="flex flex-col gap-1">
        <h4 className="text-base font-medium flex flex-row items-center gap-2">
          {trimName(name)} {shared && <Users className="w-4 h-4" />}
        </h4>
        <p className="text-xs text-muted-foreground">
          Last modified: {formatDate(lastModified)}
        </p>
        <p className="text-xs text-muted-foreground">Owned by: {ownedBy}</p>
      </div>
      <Popover>
        <PopoverTrigger
          asChild
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <EllipsisVertical className="w-5 h-5" />
        </PopoverTrigger>
        <PopoverContent
          className="w-52"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex flex-col gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Rename</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Rename</DialogTitle>
                  <DialogDescription className="flex flex-row justify-center items-center gap-4 py-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="submit"
                      onClick={handleRename}
                      disabled={isRenaming}
                    >
                      {isRenaming ? (
                        <LoaderCircle className="w-5 h-5 animate-spin" />
                      ) : (
                        "Save changes"
                      )}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {ownedBy === "me" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this document from the
                      server.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => removeDocument(id)}
                      className={buttonVariants({ variant: "destructive" })}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
