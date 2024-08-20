import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, content } = body;

    // create a new document
    const newDocument = await prisma.document.create({
      data: {
        userId: user.id, // use the authenticated user's ID
        name,
        content,
        shared: false,
      },
    });

    return NextResponse.json(newDocument);
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
