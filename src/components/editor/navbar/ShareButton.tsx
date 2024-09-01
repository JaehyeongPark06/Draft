"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import { Share } from "lucide-react";
import { X } from "lucide-react";
import { removeSharedUser } from "@/lib/actions/documents";
import { shareDocument } from "@/lib/actions/documents";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const shareSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

type ShareFormValues = z.infer<typeof shareSchema>;

interface ShareButtonProps {
  documentId: string;
  isOwner: boolean;
}

export default function ShareButton({ documentId, isOwner }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [sharedEmails, setSharedEmails] = useState<string[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);

  const form = useForm<ShareFormValues>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleShareDocument = async (values: ShareFormValues) => {
    setIsSharing(true);

    try {
      const updatedSharedUsers = await shareDocument(documentId, values.email);
      setSharedEmails(updatedSharedUsers);
      toast.success("Document shared successfully.");
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to share document."
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleRemoveSharedUser = async (email: string) => {
    try {
      const updatedSharedUsers = await removeSharedUser(documentId, email);
      setSharedEmails(updatedSharedUsers);
      toast.success("User removed successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove user."
      );
    }
  };

  useEffect(() => {
    async function fetchInitialSharedUsers() {
      setIsLoadingEmails(true);
      try {
        const initialSharedUsers = await shareDocument(documentId, "");
        setSharedEmails(initialSharedUsers);
      } catch (error) {
        console.error("Error fetching initial shared users:", error);
      } finally {
        setIsLoadingEmails(false);
      }
    }
    fetchInitialSharedUsers();
  }, [documentId]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Enter the email of the user you want to share this document with.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleShareDocument)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                variant="default"
                disabled={!isOwner || isSharing}
              >
                {isSharing ? (
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                ) : (
                  "Share"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <DialogTitle>Shared With</DialogTitle>
        <div className="flex flex-wrap text-xs gap-2">
          {isLoadingEmails ? (
            <LoaderCircle className="w-5 h-5 animate-spin" />
          ) : sharedEmails.length > 0 ? (
            sharedEmails.map((email, index) => (
              <div
                key={index}
                className="flex items-center rounded-lg px-2 py-1 bg-accent"
              >
                <span>{email}</span>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveSharedUser(email)}
                    className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No users shared yet</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
