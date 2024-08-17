import { Plus, Users } from "lucide-react";

import Document from "../document";
import EmptyPlaceholder from "./EmptyPlaceholder";

type Document = {
  name: string;
  shared: boolean;
  lastUpdated: string;
  ownedBy: string;
};

const documents: Document[] = [
  {
    name: "Document 1",
    shared: false,
    lastUpdated: "2021-09-01",
    ownedBy: "Me",
  },
  {
    name: "Document 2",
    shared: true,
    lastUpdated: "2021-09-02",
    ownedBy: "User 2",
  },
  {
    name: "Document 3",
    shared: false,
    lastUpdated: "2021-09-03",
    ownedBy: "User 3",
  },
];

export default function Documents() {
  function DocumentsEmpty() {
    return documents.length === 0;
  }

  return (
    <section
      className={
        DocumentsEmpty()
          ? "grid grid-cols-1"
          : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4"
      }
    >
      {DocumentsEmpty() ? (
        <EmptyPlaceholder />
      ) : (
        <>
          <div className="flex min-h-[106px] max-h-[106px] justify-center items-center p-4 border border-dashed rounded-md cursor-pointer hover:bg-accent transition-all">
            <Plus />
          </div>
          {documents.map((document) => (
            <Document
              key={document.name}
              name={document.name}
              shared={document.shared}
              lastUpdated={document.lastUpdated}
              ownedBy={document.ownedBy}
            />
          ))}
        </>
      )}
    </section>
  );
}
