import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "ዳሽቦርድ | HGM አስተዳዳሪ",
  description: "የምዝገባ አስተዳደር ዳሽቦርድ",
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminDashboard username={session.username} />;
}
