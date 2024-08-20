import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  const user = getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    await prisma.document.deleteMany({
      where: {
        userId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing documents:", error);
    return NextResponse.json(
      { error: "Failed to delete documents" },
      { status: 500 }
    );
  }
}
