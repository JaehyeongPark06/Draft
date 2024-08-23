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
import {
  clearDocuments,
  deleteAccount,
  updateName,
} from "@/lib/actions/settings";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
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
  isLoading: boolean;
}

const ConfirmationDialog = ({
  buttonText,
  description,
  onConfirm,
  isLoading,
}: ConfirmationDialogProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        className="flex flex-row justify-center items-center"
        variant="destructive"
        disabled={isLoading}
      >
        {isLoading ? (
          <LoaderCircle className="w-5 h-5 animate-spin" />
        ) : (
          buttonText
        )}
      </Button>
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
  const [isClearing, setIsClearing] = useState(false);
  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      ...initialData,
      appearance: (useTheme().theme as "light" | "dark" | "system") || "system",
    },
  });
  const currentTheme = useTheme().theme;

  async function onSubmit(data: z.infer<typeof accountFormSchema>) {
    if (data.name === initialData.name && data.appearance === currentTheme) {
      toast.info("No changes detected.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateName(data.name);
      setTheme(data.appearance);
      router.refresh();
      toast.success("Account updated.");
    } catch (error) {
      toast.error("An error occurred while updating the account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClearDocuments() {
    setIsClearing(true);

    try {
      const result = await clearDocuments();

      if (result.success) {
        toast.success("Documents cleared successfully.");
      } else {
        toast.info("No documents to delete.");
      }
    } catch (error) {
      console.error("Error clearing documents:", error);
      toast.error("Failed to clear documents.");
    } finally {
      setIsClearing(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);

    try {
      await deleteAccount();
      toast.success("Account deleted successfully.");
      router.push("/sign-up");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account.");
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
            onConfirm={handleClearDocuments}
            isLoading={isClearing}
          />
          <ConfirmationDialog
            buttonText="Delete Account"
            description="This will permanently delete your account and all owned documents from the server."
            onConfirm={handleDeleteAccount}
            isLoading={isDeleting}
          />
        </div>
      </form>
    </Form>
  );
}
