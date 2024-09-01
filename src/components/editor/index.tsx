"use client";

import "@blocknote/mantine/style.css";

import * as Y from "yjs";

import { useEffect, useState } from "react";
import { useRoom, useSelf } from "@liveblocks/react/suspense";

import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { DocumentTitle } from "./DocumentTitle";
import { EditorThemeToggle } from "./EditorTheme";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { updateDocument } from "@/lib/actions/documents";
import { uploadFiles } from "@/utils/uploadthing";
import { useCreateBlockNote } from "@blocknote/react";

type CollaborativeEditorProps = {
  documentId: string;
  initialTitle: string;
};

export function CollaborativeEditor({
  documentId,
  initialTitle,
}: CollaborativeEditorProps) {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>();

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
    };
  }, [room]);

  if (!doc || !provider) {
    return null;
  }

  return (
    <BlockNote
      doc={doc}
      provider={provider}
      documentId={documentId}
      initialTitle={initialTitle}
    />
  );
}

type EditorProps = {
  doc: Y.Doc;
  provider: any;
  documentId: string;
  initialTitle: string;
};

function BlockNote({ doc, provider, documentId, initialTitle }: EditorProps) {
  const userInfo = useSelf((me) => me.info);
  const [editorTheme, setEditorTheme] = useState<"light" | "dark">("dark");

  const uploadFile = async (file: File) => {
    const [res] = await uploadFiles("imageUploader", { files: [file] });
    // update document by adding file key to uploadedFiles
    await updateDocument(documentId, {
      uploadedFiles: [res.key],
    });
    return res.url;
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: userInfo.name,
        color: userInfo.color,
      },
    },
    uploadFile,
  });

  return (
    <section className="flex flex-col w-full h-full gap-4 mt-4">
      <div className="flex flex-row justify-between gap-4 items-center">
        <DocumentTitle initialTitle={initialTitle} documentId={documentId} />
        <EditorThemeToggle theme={editorTheme} setTheme={setEditorTheme} />
      </div>
      <BlockNoteView
        editor={editor}
        theme={editorTheme}
        className="w-full h-full mb-24"
      />
    </section>
  );
}
