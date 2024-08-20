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
        OR: [
          { userId: user.id }, // documents owned by the user
          {
            usersShared: {
              some: {
                userId: user.id, // documents shared with the user
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            email: true,
            name: true,
          },
        },
        usersShared: {
          select: {
            User: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
