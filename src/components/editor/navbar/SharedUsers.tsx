"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useOthers } from "@liveblocks/react";

export default function SharedUsers() {
  const others = useOthers();
  // filter out inactive
  const activeUsers = others.filter((user) => user.presence !== null);
  const displayUsers = activeUsers.slice(0, 3);
  const remainingUsers = Math.max(0, activeUsers.length - 3);

  return (
    <div className="flex flex-row justify-center items-center gap-2">
      {displayUsers.map((user) => (
        <TooltipProvider key={user.id}>
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="flex h-8 w-8 rounded-full">
                {user.info?.picture && (
                  <AvatarImage src={user.info?.picture} alt={user.info?.name} />
                )}
                <AvatarFallback>{user.info?.name?.[0]}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.info?.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {remainingUsers > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="h-8 w-8 rounded-full bg-muted-foreground flex items-center justify-center">
                <span className="text-xs font-medium">+{remainingUsers}</span>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {remainingUsers} more user{remainingUsers > 1 ? "s" : ""}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
