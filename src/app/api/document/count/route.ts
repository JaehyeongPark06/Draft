import { NextResponse } from "next/server";
import { getUser } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const count = await prisma.document.count({
      where: {
        userId: user.id,
      },
    });

    const message = count === 0 ? "No documents found." : "Documents found.";

    return NextResponse.json({
      count,
      message,
    });
  } catch (error) {
    console.error("Error fetching document count:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to fetch document count." },
      { status: 500 }
    );
  }
}
