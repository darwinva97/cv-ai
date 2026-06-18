import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@/lib/auth-helpers";

/**
 * Guard for the entire /admin area. Server-side check so non-admins never
 * receive admin markup; admin server actions re-check independently.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/dashboard");

  return <>{children}</>;
}
