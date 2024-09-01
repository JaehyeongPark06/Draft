import { ClientSettingsForm } from "./ClientSettingsForm";
import { LoaderCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { getUser } from "@/lib/lucia";

async function UserData() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <>
      <ClientSettingsForm
        initialData={{ userId: user.id, name: user.name, email: user.email }}
      />
    </>
  );
}

export async function SettingsForm() {
  return (
    <section className="space-y-6 mt-4">
      <div>
        <h2 className="text-lg font-medium">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Update your account settings and the appearance of the app.
        </p>
      </div>
      <Separator />
      <Suspense
        fallback={
          <div className="w-full h-full flex flex-col justify-center items-center pt-20">
            <LoaderCircle className="w-7 h-7 animate-spin" />
          </div>
        }
      >
        <UserData />
      </Suspense>
    </section>
  );
}
