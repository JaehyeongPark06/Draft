"use client";

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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  appearance: z.enum(["light", "dark", "system"]),
});

interface ConfirmationDialogProps {
  buttonText: string;
  description: string;
  onConfirm: () => void;
}

const ConfirmationDialog = ({
  buttonText,
  description,
  onConfirm,
}: ConfirmationDialogProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="destructive">{buttonText}</Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className={buttonVariants({ variant: "destructive" })}
        >
          Continue
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

type ClientSettingsFormProps = {
  initialData: {
    userId: string;
    name: string;
    email: string;
  };
};

export function ClientSettingsForm({ initialData }: ClientSettingsFormProps) {
  const { setTheme } = useTheme();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      ...initialData,
      appearance: (useTheme().theme as "light" | "dark" | "system") || "system",
    },
  });
  const currentTheme = useTheme().theme;

  async function onSubmit(data: z.infer<typeof accountFormSchema>) {
    // check if there are any changes that need to query the server
    if (data.name === initialData.name && data.appearance === currentTheme) {
      toast.info("No changes detected.");
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch("/api/settings/name", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newName: data.name,
        }),
      });

      setTheme(data.appearance);
      router.refresh();
      toast.success("Account updated.");
    } catch (error) {
      toast.error("An error occurred while updating the account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteAccount() {
    setIsDeleting(true);

    try {
      const response = await fetch("/api/settings/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: initialData.userId,
        }),
      });
      const data = await response.json();

      if (data.error) {
        console.error("Error deleting account:", data.error);
        toast.error("Failed to delete account.");
      } else {
        toast.success("Account deleted successfully.");
        router.push("/");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function clearDocuments() {
    // check if user owns any documents
    const response = await fetch("/api/settings/count-docs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.error) {
      console.error("Error clearing documents:", data.error);
      toast.error("Failed to clear documents.");
      return;
    }

    if (data.count === 0) {
      toast.info("No documents to delete.");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/settings/clear", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: initialData.userId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("Error clearing documents:", data.error);
        toast.error("Failed to clear documents.");
      } else {
        toast.success("Documents cleared successfully.");
      }
    } catch (error) {
      console.error("Error clearing documents:", error);
      toast.error("Failed to clear documents.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your name"
                  {...field}
                  className="w-[400px]"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="appearance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appearance</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Set the theme for the app.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        <div className="flex flex-col m:flex-row gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle className="w-5 h-5 animate-spin" />
            ) : (
              "Update account"
            )}
          </Button>
          <ConfirmationDialog
            buttonText="Clear Documents"
            description="This will permanently delete all your documents from the server."
            onConfirm={clearDocuments}
          />
          <ConfirmationDialog
            buttonText="Delete Account"
            description="This will permanently delete your account from the server."
            onConfirm={deleteAccount}
          />
        </div>
      </form>
    </Form>
  );
}
