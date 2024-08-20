"use client";

import { useCallback, useEffect, useState } from "react";

import Documents from "./documents";
import Filters from "./filters";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  shared: boolean;
  lastModified: string;
  ownedBy: string;
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAlphabeticalSort, setIsAlphabeticalSort] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<"me" | "anyone" | "not-me">(
    "me"
  );

  const trimEmail = (email: string) => email.split("@")[0];

  const refreshDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/documents");
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`);
      }
      const data = await response.json();

      const currentUserEmail = data.length > 0 ? data[0].owner.email : null;

      const transformedDocuments: Document[] = data.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        shared: doc.shared,
        lastModified: doc.lastModified.split("T")[0],
        ownedBy:
          doc.owner.email === currentUserEmail
            ? "me"
            : trimEmail(doc.owner.email),
      }));

      setDocuments(transformedDocuments);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to fetch documents. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const filteredAndSortedDocuments = documents
    .filter((doc) => {
      const docNameLower = doc.name.toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = docNameLower.includes(searchTermLower);
      const matchesOwner =
        ownerFilter === "anyone" ||
        (ownerFilter === "me" && doc.ownedBy === "me") ||
        (ownerFilter === "not-me" && doc.ownedBy !== "me");

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

  const removeDocument = async (id: string) => {
    try {
      const res = await fetch("/api/documents/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.error || `Failed to delete document: ${res.statusText}`
        );
      }

      const data = await res.json();
      toast.success(data.message || "Document deleted successfully.");
      refreshDocuments();
    } catch (err) {
      console.error("Error removing document:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to remove document. Please try again later."
      );
    }
  };

  const renameDocument = useCallback(
    async (id: string, newName: string) => {
      try {
        const res = await fetch("/api/documents/rename", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, name: newName }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(
            errorData?.error || `Failed to rename document: ${res.statusText}`
          );
        }

        const data = await res.json();

        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  name: data.name,
                  lastModified: data.lastModified,
                }
              : doc
          )
        );

        toast.success("Document renamed successfully.");
      } catch (err) {
        console.error("Error renaming document:", err);
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to rename document. Please try again later."
        );
      }
    },
    [setDocuments]
  );

  return (
    <section className="w-full h-full flex flex-col mt-4">
      <div className="w-full h-full flex flex-col gap-4">
        <Filters
          setSearchTerm={setSearchTerm}
          isAlphabeticalSort={isAlphabeticalSort}
          setIsAlphabeticalSort={setIsAlphabeticalSort}
          setOwnerFilter={setOwnerFilter}
        />
        {isLoading ? (
          <div className="w-full h-full flex flex-col justify-center items-center pt-20">
            <LoaderCircle className="w-7 h-7 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : (
          <Documents
            documents={filteredAndSortedDocuments}
            removeDocument={removeDocument}
            renameDocument={renameDocument}
            searchTerm={searchTerm}
            ownerFilter={ownerFilter}
            refreshDocuments={refreshDocuments}
          />
        )}
      </div>
    </section>
  );
}
