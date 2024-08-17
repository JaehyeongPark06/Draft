import Link from "next/link";
import UserNav from "./UserNavServer";

export default function NavBar() {
  return (
    <nav className="flex flex-row items-center justify-between py-4">
      <Link href="/dashboard" className="text-xl font-semibold">
        Draft
      </Link>
      <UserNav />
    </nav>
  );
}
