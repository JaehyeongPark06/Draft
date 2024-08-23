"use server";

import { getUser } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateName(newName: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const updatedUser = await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        name: newName,
      },
    });

    revalidatePath("/dashboard/settings");
    return updatedUser;
  } catch (error) {
    console.error("Error updating name:", error);
    throw new Error("Failed to update name");
  }
}

export async function clearDocuments() {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // check if user has any documents
    const count = await prisma.document.count({
      where: { userId: user.id },
    });

    if (count === 0) {
      return { success: false };
    }

    // delete all user's documents
    const result = await prisma.document.deleteMany({
      where: { userId: user.id },
    });

    revalidatePath("/dashboard/settings");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error clearing documents:", error);
    throw new Error("Failed to clear documents");
  }
}

export async function deleteAccount() {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // one process
    await prisma.$transaction(async (tx) => {
      // remove all shared users from user's documents
      // need to do this as it's still being referenced in the UsersShared table
      // foreign key error
      await tx.usersShared.deleteMany({
        where: {
          Document: {
            userId: user.id,
          },
        },
      });

      // delete all documents shared with user
      await tx.usersShared.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // delete users documents
      await tx.document.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // delete user's sessions
      await tx.session.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // delete user
      await tx.user.delete({
        where: {
          id: user.id,
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    throw new Error("Failed to delete account");
  }
}
