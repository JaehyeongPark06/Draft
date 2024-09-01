import SignUpForm from "@/components/user/sign-up-form";
import { getUser } from "@/lib/lucia";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const user = await getUser();

  if (user) {
    return redirect("/dashboard");
  }

  return (
    <>
      <SignUpForm />
    </>
  );
}
