import {
  EmptyPlaceholder,
  SearchPlaceholder,
  SharedPlaceholder,
} from "./Placeholders";

import DocumentCard from "../document";
import { LoaderCircle } from "lucide-react";
import { Plus } from "lucide-react";
import { useState } from "react";

interface DocumentType {
  id: string;
  name: string;
  shared: boolean;
  lastModified: string;
  ownedBy: string;
  isOwner: boolean;
}

interface DocumentsProps {
  documents: DocumentType[];
  removeDocument: (id: string) => Promise<void>;
  renameDocument: (id: string, newName: string) => Promise<void>;
  shareDocument: (id: string, email: string) => Promise<void>;
  searchTerm: string;
  ownerFilter: "me" | "anyone" | "not-me";
  refreshDocuments: () => Promise<void>;
  onCreate: () => Promise<void>;
}

export default function Documents({
  documents,
  removeDocument,
  renameDocument,
  shareDocument,
  searchTerm,
  ownerFilter,
  refreshDocuments,
  onCreate,
}: DocumentsProps) {
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate() {
    setIsCreating(true);
    await onCreate();
    setIsCreating(false);
    refreshDocuments();
  }

  if (documents.length === 0) {
    if (searchTerm) {
      return <SearchPlaceholder />;
    } else if (ownerFilter === "not-me") {
      return <SharedPlaceholder />;
    } else {
      return <EmptyPlaceholder onCreate={handleCreate} />;
    }
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4">
      {ownerFilter !== "not-me" && (
        <div
          className="flex justify-center items-center p-4 border border-dashed rounded-md cursor-pointer hover:bg-accent transition-all"
          onClick={handleCreate}
        >
          {isCreating ? (
            <LoaderCircle className="w-6 h-6 animate-spin" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </div>
      )}
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          id={document.id}
          name={document.name}
          shared={document.shared}
          lastModified={document.lastModified}
          ownedBy={document.ownedBy}
          isOwner={document.isOwner}
          removeDocument={removeDocument}
          renameDocument={renameDocument}
          shareDocument={shareDocument}
        />
      ))}
    </section>
  );
}
