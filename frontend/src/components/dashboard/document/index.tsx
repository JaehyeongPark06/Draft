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
import { Users } from "lucide-react";

interface DocumentProps {
  name: string;
  shared: boolean;
  lastUpdated: string;
  ownedBy: string;
}

export default function Document({
  name,
  shared,
  lastUpdated,
  ownedBy,
}: DocumentProps) {
  // trim if name is too long
  function trimName(name: string) {
    if (name.length > 20) {
      return name.slice(0, 20) + "...";
    }
    return name;
  }

  return (
    <div
      className="rounded-md p-4 flex flex-row gap-2 justify-between border border-dashed hover:bg-accent transition-all"
      onClick={(e) => {
        console.log("Document clicked");
      }}
    >
      <div className="flex flex-col gap-1">
        <h4 className="text-base font-medium flex flex-row items-center gap-2">
          {trimName(name)} {shared && <Users className="w-4 h-4" />}
        </h4>
        <p className="text-xs text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
        <p className="text-xs text-muted-foreground">Owned by: {ownedBy}</p>
      </div>
      <Popover>
        <PopoverTrigger asChild className="cursor-pointer">
          <EllipsisVertical className="w-5 h-5" />
        </PopoverTrigger>
        <PopoverContent className="w-52">
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
                    <Input id="name" defaultValue="pull from database" />
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="submit">Save changes</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" size="sm">
              Remove
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
