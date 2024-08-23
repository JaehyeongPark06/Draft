"use server";

import { getUser } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDocument(name: string, content: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const newDocument = await prisma.document.create({
      data: {
        userId: user.id,
        name,
        content,
        shared: false,
      },
    });

    revalidatePath("/documents");
    return newDocument;
  } catch (error) {
    console.error("Error creating document:", error);
    throw new Error("Failed to create document");
  }
}

export async function deleteDocument(id: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id, userId: user.id },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.usersShared.deleteMany({
        where: { documentId: id },
      });
      await prisma.document.delete({
        where: { id },
      });
    });

    revalidatePath("/documents");
    return { message: "Document deleted successfully" };
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new Error("Failed to delete document");
  }
}

export async function getDocuments(filter: "me" | "not-me" | "anyone" = "me") {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    let documents;

    switch (filter) {
      case "me":
        documents = await prisma.document.findMany({
          where: { userId: user.id },
          include: { owner: { select: { email: true } } },
        });
        break;
      case "not-me":
        documents = await prisma.document.findMany({
          where: { usersShared: { some: { userId: user.id } } },
          include: { owner: { select: { email: true } } },
        });
        break;
      case "anyone":
        documents = await prisma.document.findMany({
          where: {
            OR: [
              { userId: user.id },
              { usersShared: { some: { userId: user.id } } },
            ],
          },
          include: { owner: { select: { email: true } } },
        });
        break;
      default:
        throw new Error("Invalid filter");
    }

    return { currentUserEmail: user.email, documents };
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw new Error("Failed to fetch documents");
  }
}

export async function renameDocument(id: string, name: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const document = await prisma.document.findFirst({
      where: {
        id,
        OR: [
          { userId: user.id },
          { shared: true },
          { usersShared: { some: { userId: user.id } } },
        ],
      },
    });

    if (!document) {
      throw new Error("Document not found or access denied");
    }

    // check if document name even changed
    if (document.name === name) {
      return { updated: false, document };
    }

    const updatedDoc = await prisma.document.update({
      where: { id },
      data: {
        name,
        lastModified: new Date(),
      },
    });

    revalidatePath(`/documents/${id}`);
    return { updated: true, document: updatedDoc };
  } catch (error) {
    console.error("Error renaming document:", error);
    throw new Error("Failed to rename document");
  }
}

export async function shareDocument(id: string, email: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const document = await prisma.document.findUnique({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!document) {
      throw new Error(
        "Document not found or you don't have permission to share it"
      );
    }

    if (user.email === email) {
      throw new Error("You cannot share a document with yourself");
    }

    const userToShare = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!userToShare) {
      throw new Error("User with this email does not exist");
    }

    const existingShare = await prisma.usersShared.findUnique({
      where: {
        userId_documentId: {
          userId: userToShare.id,
          documentId: id,
        },
      },
    });

    if (existingShare) {
      throw new Error("Document is already shared with this user");
    }

    await prisma.usersShared.create({
      data: {
        userId: userToShare.id,
        documentId: id,
      },
    });

    if (!document.shared) {
      await prisma.document.update({
        where: { id: id },
        data: { shared: true },
      });
    }

    revalidatePath(`/documents/${id}`);
    return { message: "Document shared successfully" };
  } catch (error) {
    console.error("Error sharing document:", error);
    throw new Error("Failed to share document");
  }
}

export async function getDocumentCount() {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const count = await prisma.document.count({
      where: {
        userId: user.id,
      },
    });

    return {
      count,
      message: count === 0 ? "No documents found" : "Documents found",
    };
  } catch (error) {
    console.error("Error fetching document count:", error);
    throw new Error("Failed to fetch document count");
  }
}

export async function clearAllDocuments() {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.document.deleteMany({
      where: {
        userId: user.id,
      },
    });

    revalidatePath("/documents");
    return { success: true };
  } catch (error) {
    console.error("Error clearing documents:", error);
    throw new Error("Failed to delete documents");
  }
}
