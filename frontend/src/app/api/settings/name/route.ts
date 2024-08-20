import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { newName } = await req.json();

    const newUsername = await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        name: newName,
      },
    });

    return NextResponse.json(newUsername);
  } catch (error) {
    console.error("Error updating name:", error);
    return NextResponse.json(
      { error: "Failed to update name" },
      { status: 500 }
    );
  }
}
