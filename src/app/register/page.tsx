import Link from "next/link";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = {
  title: "ምዝገባ | ስምህ ይቀደስ",
  description: "ለ«ስምህ ይቀደስ» ሀገር አቀፍ የተልዕኮ ስልጠና የምዝገባ ቅጽ",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-col">
      <PageHeader />

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm font-medium text-blue-700 transition hover:text-blue-800"
            >
              ← ወደ መነሻ ተመለስ
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              የምዝገባ ቅጽ
            </h1>
            <p className="mt-2 text-slate-600">
              «ስምህ ይቀደስ» ሀገር አቀፍ የተልዕኮ ስልጠና — እባክዎ ሁሉንም መስኮች በትክክል ይሙሉ።
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <RegistrationForm />
          </div>
        </div>
      </main>
    </div>
  );
}
