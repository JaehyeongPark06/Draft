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
  try {
    const document = await getDocumentInfo(documentId);

    if (!document) {
      notFound();
    }

    // if document not shared and user not owner
    if (document.owner.id !== user.id && !document.shared) {
      notFound();
    }

    // if not shared with the user, find user id
    if (
      document.usersShared.find((userShared) => userShared.userId === user.id)
    ) {
      notFound();
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Failed to fetch document."
    ) {
      notFound();
    }
    throw error;
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
          initialTitle={document.title}
        />
      </Room>
    </>
  );
}
