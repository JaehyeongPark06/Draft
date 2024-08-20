import Link from "next/link";
import UserNav from "./UserNav";
import { getUser } from "@/lib/lucia";

export default async function NavBar() {
  const user = await getUser();

  if (!user) {
    return null;
  }
  return (
    <nav className="flex flex-row items-center justify-between py-4">
      <Link href="/dashboard" className="text-xl font-bold">
        Draft
      </Link>
      <UserNav user={user} />
    </nav>
  );
}
