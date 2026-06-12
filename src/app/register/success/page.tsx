import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = {
  title: "ምዝገባ ተሳክቷል | ስምህ ይቀደስ",
  description: "የምዝገባዎ በተሳካ ሁኔታ ተልኳል",
};

export default function RegisterSuccessPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 ambient-grid">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 -z-10 hero-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 hero-glow-amber"></div>

      <PageHeader maxWidth="3xl" />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/95 p-8 text-center shadow-xl shadow-indigo-950/5 backdrop-blur-sm sm:p-10 animate-fade-in">

          {/* Animated Success Badge */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
            <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-20 duration-1000"></span>
            <svg className="h-10 w-10 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            ምዝገባዎ ተሳክቷል!
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600">
            የምዝገባ ጥያቄዎ በተሳካ ሁኔታ ተልኳል። አስተዳዳሪዎች ከገመገሙ በኋላ በ 24 ሰአት ውስጥ በስልኮ አጭር የጽሁፍ መልዕክት ይደርሰዎታል።
            ለበለጠ መረጃ በስልክ ቁጥር: +251910732070  #
          </p>

          {/* Status Badge Box */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/70 px-4 py-1.5 text-sm font-semibold text-amber-800">
            <svg className="h-4 w-4 text-amber-600 animate-spin [animation-duration:8s]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>ሁኔታ፡ <strong className="font-bold">በመጠባበቅ ላይ</strong></span>
          </div>

          {/* Actions */}
          <div className="mt-10 pt-6 border-t border-slate-100">
            <Link
              href="/"
              className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 px-6 text-base font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-800 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            >
              <span className="relative z-10 flex items-center gap-2">
                ወደ መነሻ ተመለስ
                <svg className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-1000 group-hover:translate-x-full"></div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
