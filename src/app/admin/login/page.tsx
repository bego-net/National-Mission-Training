import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Admin Login | HGM",
  description: "Admin Login Page",
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
              HGM
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Admin Login</h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to manage registrations
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/" className="font-medium text-blue-700 hover:text-blue-800">
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
