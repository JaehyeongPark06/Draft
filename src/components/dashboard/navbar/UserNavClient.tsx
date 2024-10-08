"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SignOut } from "@/app/(auth)/auth.action";
import { useRouter } from "next/navigation";

type UserNavProps = {
  user: {
    name: string;
    email: string;
    picture: string | null;
  };
};

export default function UserNav({ user }: UserNavProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {user.picture && (
              <AvatarImage src={user.picture} alt="Profile Picture" />
            )}
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex flex-row items-center gap-2 justify-start"
            onClick={() => router.push("/dashboard/settings")}
          >
            <Settings className="w-4 h-4 text-muted-foreground" /> Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex flex-row items-center gap-2 justify-start"
            onClick={() => SignOut()}
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
