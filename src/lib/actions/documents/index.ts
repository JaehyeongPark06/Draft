"use server";

import { deleteFile } from "@/lib/utDelete";
import { getUser } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDocument(name: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  try {
    const newDocument = await prisma.document.create({
      data: {
        userId: user.id,
        name: name,
        shared: false,
      },
    });

    revalidatePath("/dashboard");
    return newDocument;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create document.");
  }
}

export async function deleteDocument(id: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id, userId: user.id },
    });

    if (!document) {
      throw new Error("Document not found.");
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.usersShared.deleteMany({
        where: { documentId: id },
      });

      // delete files from uploadthing related to this document
      if (document.uploadedFiles && document.uploadedFiles.length > 0) {
        for (const fileKey of document.uploadedFiles) {
          await deleteFile(fileKey);
        }
      }

      await prisma.document.delete({
        where: { id },
      });
    });

    revalidatePath("/documents");
    return { message: "Document deleted successfully." };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete document.");
  }
}

export async function renameDocument(id: string, name: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized.");
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
      throw new Error("Document not found or access denied.");
    }

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
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to rename document.");
  }
}

export async function shareDocument(id: string, email: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  try {
    // if no email, just fetch and return the current shared users
    if (!email) {
      const sharedUsers = await prisma.usersShared.findMany({
        where: { documentId: id },
        include: { User: true },
      });
      return sharedUsers.map((shared) => shared.User.email);
    }

    const document = await prisma.document.findUnique({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!document) {
      throw new Error(
        "Document not found or you don't have permission to share it."
      );
    }

    if (user.email === email) {
      throw new Error("You cannot share a document with yourself.");
    }

    const userToShare = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!userToShare) {
      throw new Error("User with this email does not exist.");
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
      throw new Error("Document is already shared with this user.");
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

    // return updated list of shared users
    const sharedUsers = await prisma.usersShared.findMany({
      where: { documentId: id },
      include: { User: true },
    });

    return sharedUsers.map((shared) => shared.User.email);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to share the document.");
  }
}

export async function removeSharedUser(documentId: string, email: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  try {
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        userId: user.id,
      },
    });

    if (!document) {
      throw new Error(
        "Document not found or you don't have permission to modify it."
      );
    }

    const userToRemove = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!userToRemove) {
      throw new Error("User with this email does not exist.");
    }

    await prisma.usersShared.delete({
      where: {
        userId_documentId: {
          userId: userToRemove.id,
          documentId: documentId,
        },
      },
    });

    const remainingSharedUsers = await prisma.usersShared.findMany({
      where: { documentId: documentId },
      include: { User: true },
    });

    if (remainingSharedUsers.length === 0) {
      await prisma.document.update({
        where: { id: documentId },
        data: { shared: false },
      });
    }

    return remainingSharedUsers.map((shared) => shared.User.email);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to remove shared user.");
  }
}

export async function clearAllDocuments() {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized.");
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
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete documents.");
  }
}

export async function updateDocument(
  id: string,
  data: { uploadedFiles?: string[] }
) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  try {
    const updatedDocument = await prisma.document.update({
      where: {
        id: id,
        OR: [
          { userId: user.id },
          { usersShared: { some: { userId: user.id } } },
        ],
      },
      data: {
        lastModified: new Date(),
        uploadedFiles: data.uploadedFiles
          ? { push: data.uploadedFiles }
          : undefined,
      },
    });

    return updatedDocument;
  } catch (error) {
    console.error("Error updating document:", error);
    throw new Error("Failed to update document.");
  }
}

export async function getDocumentInfo(id: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized.");
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
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        usersShared: {
          select: {
            userId: true,
            User: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      throw new Error("Document not found or access denied.");
    }

    return { ...document };
  } catch (error) {
    console.error("Error fetching document:", error);
    throw new Error("Failed to fetch document.");
  }
}

export async function updateDocumentTitle(id: string, title: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  try {
    const updatedDocument = await prisma.document.update({
      where: {
        id: id,
        OR: [
          { userId: user.id },
          { usersShared: { some: { userId: user.id } } },
        ],
      },
      data: {
        name: title,
        lastModified: new Date(),
      },
    });

    return updatedDocument;
  } catch (error) {
    console.error("Error updating document title:", error);
    throw new Error("Failed to update document title.");
  }
}
