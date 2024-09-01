"use client";

import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateDocumentTitle } from "@/lib/actions/documents";

interface DocumentTitleProps {
  initialTitle: string;
  documentId: string;
}

export function DocumentTitle({
  initialTitle,
  documentId,
}: DocumentTitleProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastSavedTitle, setLastSavedTitle] = useState(initialTitle);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleTitleChange = async (newTitle: string) => {
    const trimmedTitle = newTitle.trim();
    if (trimmedTitle === lastSavedTitle.trim()) {
      setTitle(lastSavedTitle);
      setIsEditing(false);
      return;
    }

    if (trimmedTitle === "") {
      toast.info("The document title cannot be empty.");
      setTitle(lastSavedTitle);
      setIsEditing(false);
      return;
    }

    if (trimmedTitle !== newTitle) {
      toast.info("Leading and trailing whitespace has been removed.");
    }

    try {
      await updateDocumentTitle(documentId, trimmedTitle);
      toast.success("Document title updated successfully.");
      setTitle(trimmedTitle);
      setLastSavedTitle(trimmedTitle);
    } catch (error) {
      console.error("Error updating document title:", error);
      toast.error("Failed to update document title.");
      setTitle(lastSavedTitle);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleChange(title);
    }
  };

  const handleBlur = () => {
    if (title.trim() !== lastSavedTitle.trim()) {
      handleTitleChange(title);
    } else {
      setIsEditing(false);
    }
  };

  return (
    <Input
      ref={inputRef}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`text-xl font-bold border ${isEditing ? "border-input" : ""}`}
      readOnly={!isEditing}
      onClick={() => setIsEditing(true)}
    />
  );
}
