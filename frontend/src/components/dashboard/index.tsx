"use client";

import {
  createDocument,
  deleteDocument,
  getDocuments,
  renameDocument,
  shareDocument,
} from "@/lib/actions/documents";
import { useCallback, useEffect, useMemo, useState } from "react";

import Documents from "./documents";
import Filters from "./filters";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

interface Document {
  id: string;
  name: string;
  shared: boolean;
  lastModified: string;
  ownedBy: string;
  isOwner: boolean;
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlphabeticalSort, setIsAlphabeticalSort] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<"me" | "anyone" | "not-me">(
    "me"
  );

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("q") || "";

  const trimEmail = (email: string) => {
    if (!email) return "Unknown";
    const parts = email.split("@");
    return parts.length > 0 ? parts[0] : "Unknown";
  };

  const refreshDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getDocuments(ownerFilter);
      const transformedDocuments: Document[] = result.documents.map(
        (doc: any) => ({
          id: doc.id,
          name: doc.name,
          shared: doc.shared,
          lastModified:
            doc.lastModified instanceof Date
              ? doc.lastModified.toISOString().split("T")[0]
              : typeof doc.lastModified === "string"
              ? doc.lastModified.split("T")[0]
              : new Date().toISOString().split("T")[0],
          ownedBy:
            doc.owner.email === result.currentUserEmail
              ? "me"
              : doc.owner.email
              ? trimEmail(doc.owner.email)
              : "Unknown",
          isOwner: doc.owner.email === result.currentUserEmail,
        })
      );

      setDocuments(transformedDocuments);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  }, [ownerFilter]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments, ownerFilter]);

  const filteredAndSortedDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        const docNameLower = doc.name.toLowerCase();
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = docNameLower.includes(searchTermLower);
        const matchesOwner =
          ownerFilter === "anyone" ||
          (ownerFilter === "me" && doc.isOwner) ||
          (ownerFilter === "not-me" && !doc.isOwner);

        return matchesSearch && matchesOwner;
      })
      .sort((a, b) => {
        if (isAlphabeticalSort) {
          return a.name.localeCompare(b.name);
        } else {
          return (
            new Date(b.lastModified).getTime() -
            new Date(a.lastModified).getTime()
          );
        }
      });
  }, [documents, searchTerm, isAlphabeticalSort, ownerFilter]);

  const handleRemoveDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      toast.success("Document deleted successfully.");
      refreshDocuments();
    } catch (err) {
      console.error("Error removing document:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to remove document."
      );
    }
  };

  const handleRenameDocument = async (id: string, newName: string) => {
    try {
      const { updated, document: updatedDoc } = await renameDocument(
        id,
        newName
      );

      if (!updated) {
        toast.info("The document name is not different.");
        return;
      }

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                name: updatedDoc.name,
                lastModified: updatedDoc.lastModified
                  .toISOString()
                  .split("T")[0],
              }
            : doc
        )
      );
      toast.success("Document renamed successfully.");
    } catch (err) {
      console.error("Error renaming document:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to rename document."
      );
    }
  };

  const handleShareDocument = async (id: string, email: string) => {
    try {
      await shareDocument(id, email);
      toast.success("Document shared successfully.");
      refreshDocuments();
    } catch (err) {
      console.error("Error sharing document:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to share document."
      );
    }
  };

  const handleCreateDocument = async () => {
    try {
      await createDocument("Untitled Document");
      refreshDocuments();
      toast.success("Document created successfully.");
    } catch (error) {
      console.error("Failed to create document:", error);
      toast.error("Failed to create document.");
    }
  };

  return (
    <section className="w-full h-full flex flex-col mt-4">
      <div className="w-full h-full flex flex-col gap-4">
        <Filters
          isAlphabeticalSort={isAlphabeticalSort}
          setIsAlphabeticalSort={setIsAlphabeticalSort}
          setOwnerFilter={setOwnerFilter}
        />
        {isLoading ? (
          <div className="w-full h-full flex flex-col justify-center items-center pt-20">
            <LoaderCircle className="w-7 h-7 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-destructive">Error: {error}</div>
        ) : (
          <Documents
            documents={filteredAndSortedDocuments}
            removeDocument={handleRemoveDocument}
            renameDocument={handleRenameDocument}
            shareDocument={handleShareDocument}
            searchTerm={searchTerm}
            ownerFilter={ownerFilter}
            refreshDocuments={refreshDocuments}
            onCreate={handleCreateDocument}
          />
        )}
      </div>
    </section>
  );
}
