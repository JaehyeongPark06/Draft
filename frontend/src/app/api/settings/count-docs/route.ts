import { NextResponse } from "next/server";
import { getUser } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const documents = await prisma.document.findMany({
      where: {
        userId: user.id, // documents owned by the user
      },
    });

    const documentCount = documents.length;

    if (documentCount === 0) {
      return NextResponse.json(
        { message: "No documents found", count: documentCount },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Documents found", count: documentCount },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
