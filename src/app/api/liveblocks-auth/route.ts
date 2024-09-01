import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";
import { colors } from "@/lib/colors";
import { getUser } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";

const API_KEY = process.env.LIVEBLOCKS_API_KEY;

const liveblocks = new Liveblocks({
  secret: API_KEY!,
});

export async function POST(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return new Response(null, { status: 401 });
  }

  // get random color
  const colorKeys = Object.keys(colors);
  const randomColorKey =
    colorKeys[Math.floor(Math.random() * colorKeys.length)];
  const randomColor = colors[randomColorKey as keyof typeof colors];

  // get document id
  const { room: documentId } = await request.json();

  // get document
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { usersShared: { select: { userId: true } } },
  });

  if (!document) {
    return new Response(null, { status: 404 });
  }

  // create session
  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: user.name,
      email: user.email,
      color: randomColor,
      picture: user.picture ?? "",
      //   `https://avatar.vercel.sh/${user.name}`,
    },
  });

  // give access to owner and shared users
  if (
    document.userId === user.id ||
    document.usersShared.some((shared) => shared.userId === user.id)
  ) {
    session.allow(documentId, session.FULL_ACCESS);
  } else {
    return new Response(null, { status: 403 });
  }

  // authorize the user
  const { body, status } = await session.authorize();
  return new Response(body, { status });
}
