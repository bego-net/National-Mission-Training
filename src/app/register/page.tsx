import Link from "next/link";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = {
  title: "ምዝገባ | ስምህ ይቀደስ",
  description: "ለ«ስምህ ይቀደስ» ሀገር አቀፍ የተልዕኮ ስልጠና የምዝገባ ቅጽ",
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 ambient-grid">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-1/4 -z-10 hero-glow"></div>
      <div className="absolute bottom-10 left-10 -z-10 hero-glow-amber"></div>

      <PageHeader maxWidth="5xl" />

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-5xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
                ወደ መነሻ ተመለስ
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Column: Info card */}
            <div className="lg:col-span-4 flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl shadow-indigo-950/15 sm:p-8">
              <div className="relative">
                {/* Visual badge */}
                <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300">
                  ምዝገባ ፖርታል
                </span>
                
                <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl leading-snug">
                  የምዝገባ ቅጽ
                </h1>
                
                <p className="mt-4 text-sm leading-relaxed text-indigo-200">
                  «ስምህ ይቀደስ» ሀገር አቀፍ የተልዕኮ ስልጠና ላይ ለመሳተፍ እባክዎ ከታች ያለውን ቅጽ በትክክል በመሙላት ይመዝገቡ።
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-300">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold tracking-wide uppercase text-indigo-300">አስፈላጊ ማሳሰቢያ</h4>
                      <p className="mt-1 text-xs text-indigo-100/80 leading-relaxed">
                        የምዝገባ ቅጹን ከማስገባትዎ በፊት ክፍያ ፈጽመው የክፍያ ማረጋገጫ (ደረሰኝ) ማዘጋጀትዎን ያረጋግጡ።
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* HGM branding in left col footer */}
              <div className="mt-12 border-t border-indigo-900/60 pt-6">
                <p className="text-xs font-semibold text-indigo-300/80">Hossana Gospel Movement</p>
                <p className="mt-1 text-[10px] text-indigo-200/50">© {new Date().getFullYear()} NMT Platform</p>
              </div>
            </div>

            {/* Right Column: Form card */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-md backdrop-blur-sm sm:p-8">
                <RegistrationForm />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
