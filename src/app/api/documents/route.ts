import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";

type FilterType = "me" | "not-me" | "anyone";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const filterParam = url.searchParams.get("filter") as FilterType | null;
    const filter: FilterType = filterParam ?? "me";

    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

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
        return NextResponse.json({ error: "Invalid filter." }, { status: 400 });
    }

    return NextResponse.json({
      currentUserEmail: user.email,
      documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to fetch documents." },
      { status: 500 }
    );
  }
}
