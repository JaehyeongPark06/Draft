import Image from "next/image";
import Link from "next/link";
import UserNav from "./UserNavClient";
import { getUser } from "@/lib/lucia";

export default async function NavBar() {
  const user = await getUser();

  if (!user) {
    return null;
  }
  return (
    <nav className="flex flex-row items-center justify-between gap-4 py-4">
      <Link href="/dashboard">
        <Image src="/logo.webp" alt="Logo" width={32} height={32} />
      </Link>
      <UserNav user={user} />
    </nav>
  );
}
