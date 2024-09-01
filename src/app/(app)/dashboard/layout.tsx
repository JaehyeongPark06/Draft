import NavBar from "@/components/dashboard/navbar";
import { getUser } from "@/lib/lucia";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <section className="mb-12">
      <NavBar />
      {children}
    </section>
  );
}
