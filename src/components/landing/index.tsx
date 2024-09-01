import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { getUser } from "@/lib/lucia";

export default async function Landing() {
  const user = await getUser();

  return (
    <section className="w-full h-screen flex flex-col justify-center items-center m:gap-4 text-center md:px-14 xl:px-60">
      <h1 className="text-3xl sm:text-4xl md:text-5xl w-full font-bold">
        Draft
      </h1>
      <h2 className="text-sm sm:text-base md:text-lg w-full font-normal mt-2 mb-6">
        A real time collaborative document editor built with Next.js 14 (app
        router), Liveblocks, Shadcn UI, Lucia auth, Tailwind, Zod, Supabase,
        UploadThing, and Prisma
      </h2>
      <Button variant="default">
        {user ? (
          <Link className="text-sm sm:text-base font-medium" href="/dashboard">
            Dashboard
          </Link>
        ) : (
          <Link className="text-sm sm:text-base font-medium" href="/sign-in">
            Sign In
          </Link>
        )}
      </Button>
      <div className="fixed w-full bottom-6">
        <div className="flex flex-row gap-4 justify-center items-center">
          <Button variant="outline">
            <Link href="https://">
              <Github className="h-4 w-4" />
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </section>
  );
}
