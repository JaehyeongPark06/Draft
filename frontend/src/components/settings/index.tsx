import { ClientSettingsForm } from "./ClientSettingsForm";
import { Separator } from "@/components/ui/separator";
import { getUser } from "@/lib/lucia";

export async function SettingsForm() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <section className="space-y-6 mt-4">
      <div>
        <h2 className="text-lg font-medium">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Update your account settings and the appearance of the app.
        </p>
      </div>
      <Separator />
      <ClientSettingsForm
        initialData={{ name: user.name, email: user.email }}
      />
    </section>
  );
}
