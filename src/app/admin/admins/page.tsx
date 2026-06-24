import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ManageAdminsClient } from "@/components/admin/ManageAdminsClient";

export const metadata = {
  title: "Admin Management | HGM Admin",
  description: "Manage administrators and roles",
};

export default async function AdminManagementPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  if (session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  return <ManageAdminsClient currentUserId={session.id} currentUserName={session.name} />;
}
