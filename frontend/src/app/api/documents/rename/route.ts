import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid document name" },
        { status: 400 }
      );
    }

    // check if document exists and if user has access
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
      return NextResponse.json(
        { error: "Document not found or access denied" },
        { status: 404 }
      );
    }

    // change the name
    const updatedDoc = await prisma.document.update({
      where: { id },
      data: {
        name,
        lastModified: new Date(),
      },
    });

    return NextResponse.json(updatedDoc);
  } catch (error) {
    console.error("Error renaming document:", error);
    return NextResponse.json(
      { error: "Failed to rename document" },
      { status: 500 }
    );
  }
}
