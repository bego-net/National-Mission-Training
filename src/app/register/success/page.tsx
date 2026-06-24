import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = {
  title: "ምዝገባ ተሳክቷል | ስምህ ይቀደስ",
  description: "የምዝገባዎ በተሳካ ሁኔታ ተልኳል",
};

export default function RegisterSuccessPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#fdfaf2] via-[#f7ebd0] to-[#e8d2a0] text-stone-900 overflow-x-hidden font-sans">
      {/* Luxurious Gold Spotlight / Rays */}
      <div className="absolute top-1/4 left-1/4 z-0 h-[500px] w-[500px] rounded-full bg-white opacity-[0.5] blur-[110px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 z-0 h-[500px] w-[500px] rounded-full bg-amber-200/40 opacity-[0.4] blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <PageHeader maxWidth="3xl" />

        <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 relative z-10 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-amber-200/50 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl sm:p-10">

            {/* Animated Success Badge */}
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-250 text-emerald-600 shadow-inner">
              <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75 duration-1000"></span>
              <svg className="h-10 w-10 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-[#2d220f] sm:text-4xl">
              ምዝገባዎ ተሳክቷል!
            </h1>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#4b3e25] font-semibold">
              የምዝገባ ጥያቄዎ በተሳካ ሁኔታ ተልኳል።
              ለበለጠ መረጃ በስልክ ቁጥር: 0982755544   #
            </p>

            {/* Status Badge Box */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800">
              <svg className="h-4 w-4 text-amber-700 animate-spin [animation-duration:8s]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>ሁኔታ፡ <strong className="font-bold">በመጠባበቅ ላይ</strong></span>
            </div>

            {/* Actions */}
            <div className="mt-10 pt-6 border-t border-amber-200/50">
              <Link
                href="/"
                className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#dec084] via-[#eedbb3] to-[#cba358] py-3.5 px-6 text-base font-bold text-[#3c2f17] border border-[#cba358]/35 shadow-[0_4px_15px_rgba(222,192,132,0.35)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_4px_25px_rgba(222,192,132,0.5)] active:translate-y-0"
              >
                <span className="relative z-10 flex items-center gap-2">
                  ወደ መነሻ ተመለስ
                  <svg className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
