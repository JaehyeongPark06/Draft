import {
  EmptyPlaceholder,
  SearchPlaceholder,
  SharedPlaceholder,
} from "./Placeholders";

import Document from "../document";
import { Plus } from "lucide-react";

interface DocumentType {
  id: string;
  name: string;
  shared: boolean;
  lastModified: string;
  ownedBy: string;
}

interface DocumentsProps {
  documents: DocumentType[];
  removeDocument: (id: string) => Promise<void>;
  renameDocument: (id: string, newName: string) => Promise<void>;
  searchTerm: string;
  ownerFilter: "me" | "anyone" | "not-me";
  refreshDocuments: () => Promise<void>;
}

export default function Documents({
  documents,
  removeDocument,
  renameDocument,
  searchTerm,
  ownerFilter,
  refreshDocuments,
}: DocumentsProps) {
  async function createDocument() {
    try {
      const newDocument = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "" }],
          },
        ],
      };

      const response = await fetch("/api/documents/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Untitled Document",
          content: newDocument,
        }),
      });

      if (response.ok) {
        // refresh to show the new document
        await refreshDocuments();
      } else {
        const errorData = await response.json();
        console.error("Failed to create document:", errorData.error);
      }
    } catch (error) {
      console.error("Failed to create document:", error);
    }
  }

  if (documents.length === 0) {
    if (searchTerm) {
      return <SearchPlaceholder />;
    } else if (ownerFilter === "not-me") {
      return <SharedPlaceholder />;
    } else {
      return <EmptyPlaceholder onCreate={createDocument} />;
    }
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4">
      {ownerFilter !== "not-me" && (
        <div
          className="flex justify-center items-center p-4 border border-dashed rounded-md cursor-pointer hover:bg-accent transition-all"
          onClick={createDocument}
        >
          <Plus />
        </div>
      )}
      {documents.map((document) => (
        <Document
          key={document.id}
          id={document.id}
          name={document.name}
          shared={document.shared}
          lastModified={document.lastModified}
          ownedBy={document.ownedBy}
          removeDocument={removeDocument}
          renameDocument={renameDocument}
        />
      ))}
    </section>
  );
}
