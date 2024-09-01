import { Loading } from "@/components/editor/loading";
import NavBar from "@/components/editor/navbar";
import { Room } from "@/components/editor/live/Room";
import dynamic from "next/dynamic";
import { getDocumentInfo } from "@/lib/actions/documents";

export default async function DocumentEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const documentId = params.id;
  const document = await getDocumentInfo(documentId);

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
