import Image from "next/image";
import Link from "next/link";
import ShareButton from "./ShareButton";
import SharedUsers from "./SharedUsers";
import UserNav from "@/components/dashboard/navbar/UserNavClient";
import { getDocumentInfo } from "@/lib/actions/documents";
import { getUser } from "@/lib/lucia";

interface NavBarProps {
  documentId: string;
}

export default async function NavBar({ documentId }: NavBarProps) {
  const user = await getUser();
  const document = await getDocumentInfo(documentId);

  if (!user) {
    return null;
  }

  const isOwner = document.owner.id === user.id;

  return (
    <nav className="flex flex-row items-center justify-between gap-4 py-4">
      <Link href="/dashboard">
        <Image src="/logo.webp" alt="Logo" width={32} height={32} />
      </Link>
      <div className="flex flex-row gap-4 justify-center items-center">
        <SharedUsers />
        <ShareButton documentId={documentId} isOwner={isOwner} />
        <UserNav user={user} />
      </div>
    </nav>
  );
}
