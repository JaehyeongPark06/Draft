"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SignIn, getGoogleOauthConsentUrl } from "@/app/(auth)/auth.action";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function SignInForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SignInSchema>) {
    const res = await SignIn(values);
    if (res.success) {
      router.push("/dashboard");
      toast.success("Signed in successfully");
    } else {
      toast.error(res.error);
    }
  }

  return (
    <section className="min-h-screen h-full flex flex-col justify-center items-center bg-main-white">
      <div className="flex flex-col md:justify-start justify-center items-center max-w-lg py-6 h-full w-full">
        <div className="w-full flex-col justify-start items-start gap-y-2 flex">
          <h1 className="text-2xl font-bold mt-6">Sign In</h1>
          <div className="text-sm">
            New to Draft?{" "}
            <Link className="text-blue-500 hover:underline" href="/sign-up">
              Sign Up
            </Link>
          </div>
        </div>
        <div className="w-full mt-8 flex flex-row justify-start items-center gap-x-3">
          <Button
            onClick={async () => {
              const res = await getGoogleOauthConsentUrl();
              if (res.url) {
                window.location.href = res.url;
              } else {
                toast.error(res.error);
              }
            }}
            variant="outline"
            className="flex flex-row justify-center items-center w-full px-2 py-2 gap-4 text-sm"
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </div>
        <div className="py-6 w-full flex flex-row justify-between items-center gap-x-2">
          <div className="h-[1px] w-full bg-border" />
          <p className="text-sm font-medium px-2">or</p>
          <div className="h-[1px] w-full bg-border" />
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col md:justify-start justify-center items-center max-w-lg h-full w-full"
          >
            <div className="flex flex-col justify-center items-start gap-y-4 w-full">
              <FormField
                control={form.control}
                name="email"
                render={({ field }: { field: any }) => (
                  <FormItem className="w-full">
                    <FormLabel htmlFor={field.id}>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Email"
                        required
                      />
                    </FormControl>
                    <FormMessage {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }: { field: any }) => (
                  <FormItem className="w-full">
                    <FormLabel htmlFor={field.id}>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Password"
                        required
                      />
                    </FormControl>
                    <FormMessage {...field} />
                  </FormItem>
                )}
              />
            </div>
            <Button
              variant="default"
              className="inline-flex items-center justify-center rounded-sm text-sm font-medium transition-colors px-4 py-2 w-full h-10 mt-8"
              type="submit"
            >
              Sign In
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      version="1.1"
      x="0px"
      y="0px"
      viewBox="0 0 48 48"
      enableBackground="new 0 0 48 48"
      height="20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      ></path>
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      ></path>
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
    </svg>
  );
}
