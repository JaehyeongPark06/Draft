"use server";

import { notFound, redirect } from "next/navigation";

import { Loading } from "@/components/editor/loading";
import NavBar from "@/components/editor/navbar";
import { Room } from "@/components/editor/live/Room";
import dynamic from "next/dynamic";
import { getDocumentInfo } from "@/lib/actions/documents";
import { getUser } from "@/lib/lucia";

export default async function DocumentEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  const documentId = params.id;
  const document = await getDocumentInfo(documentId);

  // if document not shared and user not owner
  if (document.owner.id !== user.id && !document.shared) {
    return notFound();
  }

  // if not shared with the user, find user id
  if (
    document.usersShared.some((sharedUser) => sharedUser.User.id === user.id)
  ) {
    return notFound();
  }

  const CollaborativeEditor = dynamic(
    () => import("@/components/editor").then((mod) => mod.CollaborativeEditor),
    {
      ssr: false,
      loading: () => <Loading />,
    }
  );

  return (
    <>
      <Room roomId={documentId}>
        <NavBar documentId={documentId} />
        <CollaborativeEditor
          documentId={documentId}
          initialTitle={document.name}
        />
      </Room>
    </>
  );
}
