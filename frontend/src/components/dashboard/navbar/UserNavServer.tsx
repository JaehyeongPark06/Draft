import UserNavClient from "./UserNavClient";
import { getUser } from "@/lib/lucia";

export default async function UserNav() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return <UserNavClient user={user} />;
}
