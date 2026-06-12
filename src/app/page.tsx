import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
              HGM
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Hossana Gospel Movement</p>
              <p className="text-xs text-slate-500">የተልዕኮ ስልጠና ምዝገባ</p>
            </div>
          </div>
          <Link
            href="/register"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            ምዝገባ
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-blue-800 to-blue-900 px-4 py-16 text-white sm:px-6 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-blue-100">
              HGM — Hossana Gospel Movement
            </p>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
              «ስምህ ይቀደስ» ሀገር አቀፍ የተልዕኮ ስልጠና
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-blue-100 sm:text-lg">
              በመላው ኢትዮጵያ ከተለያዩ ቤተ ክርስቲያኖችና አገልግሎት ቦታዎች የተሰበሰቡ ወጣቶችና አገልጋዮች
              ለተልዕኮ ስልጠና እንኳን በደህና መጡ። ለመሳተፍ የምዝገባ ቅጽ ይሙሉ።
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-6 py-3 text-base font-semibold text-blue-950 transition hover:bg-amber-300"
              >
                አሁን ይመዝገቡ
              </Link>
              <a
                href="#about"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-base font-medium text-white transition hover:bg-white/10"
              >
                ተጨማሪ መረጃ
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">ስለ ስልጠናው</h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
              ይህ ስልጠና በ Hossana Gospel Movement (HGM) የሚመራ ሀገር አቀፍ የተልዕኮ ስልጠና ነው።
              ተሳታፊዎች የክርስትና ተልዕኮ፣ የአገልግሎት እድገት እና የመንፈሳዊ ዕድገት ስልጠናዎችን ይቀበላሉ።
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-2xl font-bold text-blue-700">ሀገር አቀፍ</p>
                <p className="mt-2 text-sm text-slate-600">ከመላው ኢትዮጵያ የተሰበሰቡ ተሳታፊዎች</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-2xl font-bold text-blue-700">ተልዕኮ</p>
                <p className="mt-2 text-sm text-slate-600">የመንፈሳዊ እድገት እና አገልግሎት ስልጠና</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-2xl font-bold text-blue-700">ምዝገባ</p>
                <p className="mt-2 text-sm text-slate-600">ቀላል እና ፈጣን የመስመር ላይ ምዝገባ</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-2xl font-bold text-slate-900">ለመሳተፍ ዝግጁ ነዎት?</h2>
            <p className="mt-3 text-slate-600">
              የምዝገባ ቅጹን ይሙሉ። ከአስተዳዳሪዎች ከተጣራ በኋላ ምዝገባዎ ይፀድቃል።
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-700 px-8 py-3 text-base font-semibold text-white transition hover:bg-blue-800"
            >
              የምዝገባ ቅጽ ይሙሉ
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-100 px-4 py-6 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Hossana Gospel Movement (HGM)</p>
      </footer>
    </div>
  );
}
