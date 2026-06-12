import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = {
  title: "ምዝገባ ተሳክቷል | ስምህ ይቀደስ",
  description: "የምዝገባዎ በተሳካ ሁኔታ ተልኳል",
};

export default function RegisterSuccessPage() {
  return (
    <div className="flex min-h-full flex-col">
      <PageHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✓
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
            ምዝገባዎ ተሳክቷል!
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">
            የምዝገባ ጥያቄዎ በተሳካ ሁኔታ ተልኳል። አስተዳዳሪዎች ከገምገሙ በኋላ ሁኔታዎ ይፀድቃል ወይም ይታወቃል።
          </p>
          <p className="mt-2 text-sm text-slate-500">
            ሁኔታ፡ <span className="font-medium text-amber-700">በመጠባበቅ ላይ</span>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              ወደ መነሻ ተመለስ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
