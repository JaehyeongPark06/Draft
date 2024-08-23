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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EllipsisVertical, FilePen, Share, Trash2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import { Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const shareSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

const renameSchema = z.object({
  // no whitespace in beginning
  name: z
    .string()
    .trim()
    .min(1, { message: "Document name cannot be empty" })
    .regex(/^[^\s].*$/, {
      message: "Document name cannot start with whitespace",
    }),
});

type ShareFormValues = z.infer<typeof shareSchema>;
type RenameFormValues = z.infer<typeof renameSchema>;

interface DocumentProps {
  id: string;
  name: string;
  shared: boolean;
  lastModified: string;
  ownedBy: string;
  isOwner: boolean;
  removeDocument: (id: string) => Promise<void>;
  renameDocument: (id: string, newName: string) => Promise<void>;
  shareDocument: (id: string, email: string) => Promise<void>;
}

export default function Document({
  id,
  name,
  shared,
  lastModified,
  ownedBy,
  isOwner,
  removeDocument,
  renameDocument,
  shareDocument,
}: DocumentProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const shareForm = useForm<ShareFormValues>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      email: "",
    },
  });

  const renameForm = useForm<RenameFormValues>({
    resolver: zodResolver(renameSchema),
    defaultValues: {
      name: name,
    },
  });

  function trimName(name: string) {
    if (name.length > 20) {
      return name.slice(0, 20) + "...";
    }
    return name;
  }

  async function handleRemove() {
    setIsRemoving(true);
    try {
      await removeDocument(id);
    } finally {
      setIsRemoving(false);
    }
  }

  async function handleRename(values: RenameFormValues) {
    setIsRenaming(true);
    try {
      await renameDocument(id, values.name);
      renameForm.reset({ name: values.name });
    } finally {
      setIsRenaming(false);
    }
  }

  async function handleShare(values: ShareFormValues) {
    setIsSharing(true);
    try {
      await shareDocument(id, values.email);
      shareForm.reset();
    } finally {
      setIsSharing(false);
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="rounded-md p-4 flex flex-row gap-2 justify-between border border-dashed hover:bg-accent transition-all select-none cursor-pointer">
      <div className="flex flex-col gap-1">
        <h4 className="text-base font-medium flex flex-row items-center gap-2">
          {trimName(name)} {shared && <Users className="w-4 h-4" />}
        </h4>
        <p className="text-xs text-muted-foreground">
          Last modified: {formatDate(lastModified)}
        </p>
        <p className="text-xs text-muted-foreground">
          {isOwner ? "Owned by: me" : `Owned by: ${ownedBy}`}
        </p>
      </div>
      <Popover>
        <PopoverTrigger asChild className="cursor-pointer">
          <EllipsisVertical className="w-5 h-5" />
        </PopoverTrigger>
        <PopoverContent className="w-52">
          <div className="flex flex-col gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  {isRenaming ? (
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <FilePen className="w-4 h-4 mr-2" />
                      Rename
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Rename Document</DialogTitle>
                  <DialogDescription>
                    Enter a new name for your document.
                  </DialogDescription>
                </DialogHeader>
                <Form {...renameForm}>
                  <form
                    onSubmit={renameForm.handleSubmit(handleRename)}
                    className="space-y-8"
                  >
                    <FormField
                      control={renameForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isRenaming}>
                        {isRenaming ? (
                          <LoaderCircle className="w-5 h-5 animate-spin" />
                        ) : (
                          "Save changes"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            {isOwner && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">
                    {isSharing ? (
                      <LoaderCircle className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Share Document</DialogTitle>
                    <DialogDescription>
                      Enter the email of the user you want to share this
                      document with.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...shareForm}>
                    <form
                      onSubmit={shareForm.handleSubmit(handleShare)}
                      className="space-y-8"
                    >
                      <FormField
                        control={shareForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="user@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={isSharing}>
                          {isSharing ? (
                            <LoaderCircle className="w-5 h-5 animate-spin" />
                          ) : (
                            "Share"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    {isRemoving ? (
                      <LoaderCircle className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </>
                    )}
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
                      onClick={handleRemove}
                      className={
                        buttonVariants({ variant: "destructive" }) +
                        " flex justify-center items-center"
                      }
                    >
                      {isRemoving ? (
                        <LoaderCircle className="w-5 h-5 animate-spin" />
                      ) : (
                        "Continue"
                      )}
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
