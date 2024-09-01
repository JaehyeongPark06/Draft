"use client";

import { ReactNode } from "react";
import { RoomProvider } from "@liveblocks/react";

interface RoomProps {
  children: ReactNode;
  roomId: string;
}

export function Room({ children, roomId }: RoomProps) {
  return (
    <RoomProvider id={roomId} initialPresence={{}}>
      {children}
    </RoomProvider>
  );
}
