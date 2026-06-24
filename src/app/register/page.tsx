import Link from "next/link";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = {
  title: "ምዝገባ | ስምህ ይቀደስ",
  description: "ለ«ስምህ ይቀደስ» ሀገር አቀፍ የተልዕኮ ስልጠና የምዝገባ ቅጽ",
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#fdfaf2] via-[#f7ebd0] to-[#e8d2a0] text-stone-900 overflow-x-hidden font-sans">
      {/* Luxurious Gold Spotlight / Rays */}
      <div className="absolute top-[-10%] right-[5%] z-0 h-[500px] w-[500px] rounded-full bg-white opacity-[0.5] blur-[110px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[5%] z-0 h-[500px] w-[500px] rounded-full bg-amber-200/40 opacity-[0.4] blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <PageHeader maxWidth="5xl" />

        <main className="flex-1 px-4 py-8 sm:px-6 sm:py-16 animate-fade-in">
          <div className="mx-auto max-w-5xl">
            {/* Back Navigation */}
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-amber-800 hover:text-amber-600 transition-colors duration-200"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                ወደ መነሻ ተመለስ
              </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left Column: Info card (Light Gold Glass Panel) */}
              <div className="lg:col-span-4 flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-200/50 bg-white/70 p-6 text-stone-900 shadow-xl backdrop-blur-xl sm:p-8">
                <div className="relative">
                  {/* Visual badge */}
                  <span className="inline-block rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
                    ምዝገባ ፖርታል
                  </span>

                  <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-[#2d220f] sm:text-3xl leading-snug">
                    የምዝገባ ቅጽ
                  </h1>

                  <p className="mt-4 text-sm leading-relaxed text-[#4b3e25] font-medium">
                    «ስምህ ይቀደስ» ሀገር አቀፍ የተልዕኮ ስልጠና ላይ ለመሳተፍ እባክዎ ከታች ያለውን ቅጽ በትክክል በመሙላት ይመዝገቡ።
                  </p>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100/50 border border-amber-200/60 text-amber-850">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold tracking-wide uppercase text-amber-850">አስፈላጊ ማሳሰቢያ</h4>
                        <p className="mt-1.5 text-xs text-stone-600 leading-relaxed font-semibold">
                          የምዝገባ ቅጹን ካስገቡ በኋላ ክፍያ ፈጽመው የክፍያ ማረጋገጫ (ደረሰኝ/sreenshot) ማዘጋጀትዎን ያረጋግጡ።
                        </p>
                        <div className="mt-3 p-3 bg-amber-100/40 rounded-xl border border-amber-200/50">
                          <p className="text-xs font-bold text-amber-900 mb-1">CBE (የኢትዮጵያ ንግድ ባንክ)</p>
                          <p className="text-sm font-mono font-bold text-stone-800 tracking-wider">1000334467839</p>
                          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mt-1">Hosana Gospel Movement</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HGM branding in left col footer */}
                <div className="mt-12 border-t border-amber-200/40 pt-6">
                  <p className="text-xs font-bold text-[#5c4a2a]">Hossana Gospel Movement</p>
                  <p className="mt-1 text-[10px] text-stone-400">© {new Date().getFullYear()} NMT Platform</p>
                </div>
              </div>

              {/* Right Column: Form card (Light Gold Glass Panel) */}
              <div className="lg:col-span-8">
                <div className="rounded-3xl border border-amber-200/50 bg-white/70 p-6 shadow-xl backdrop-blur-xl sm:p-8">
                  <RegistrationForm />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
