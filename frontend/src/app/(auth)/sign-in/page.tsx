import SignInForm from "@/components/user/sign-in-form";
import { getUser } from "@/lib/lucia";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const user = await getUser();

  if (user) {
    return redirect("/dashboard");
  }

  return (
    <>
      <SignInForm />
    </>
  );
}
