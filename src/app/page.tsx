import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 ambient-grid overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[10%] -z-10 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[130px]"></div>
      <div className="absolute top-[30%] right-[10%] -z-10 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]"></div>
      <div className="absolute bottom-[10%] left-[20%] -z-10 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px]"></div>

      <PageHeader maxWidth="5xl" showRegisterLink={true} />

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-16 sm:space-y-24">

          {/* Modern Premium Hero Banner */}
          <section className="relative overflow-hidden rounded-[32px] border border-slate-200/50 bg-white/70 p-8 shadow-xl shadow-indigo-950/5 backdrop-blur-md sm:p-16 animate-fade-in">
            {/* Inner top glow effect */}
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_60%)]"></div>

            <div className="relative z-10 max-w-3xl space-y-8 text-center sm:text-left">
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-950 bg-clip-text text-transparent">
                    "ስምህ ይቀደስ"
                  </span>
                  <span className="block mt-2 text-3xl font-extrabold text-slate-800 sm:text-5xl">
                    ሀገር አቀፍ የተልዕኮ ስልጠና
                  </span>
                  <span className="block mt-2 text-xl font-bold tracking-wider text-blue-600 sm:text-2xl">
                    National mission training
                  </span>
                </h1>

                <p className="text-base leading-relaxed text-slate-600 sm:text-lg sm:leading-loose">
                  ይህ የተልዕኮ ስልጠና ፡- <span className="font-bold text-slate-800">ክርስቲያኖችን ለታላቁ ተልዕኮ የማነሳሳት እና የማስታጠቅ</span> ስልጠና ነው ። በተለይም የ2018 ዓ.ም ስልጠና ትኩረቱን <span className="inline-block px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">ተግባራዊ ክርስትና ለተልዕኮ</span> በሚል ሃሳብ ላይ ትኩረት በማድረግ ለተልዕኮ ክርስትያኖችን ለማነሳሳትና ለማብቀት የተዘጋጀ ነው።
                </p>
              </div>

              {/* Time, Venue & Feature stats cards grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Time / Duration */}
                <div className="group flex flex-col justify-between rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/30 to-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600/80">ጊዜ እና ቆይታ</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-lg text-white shadow-md shadow-sky-500/20 transition-transform duration-300 group-hover:scale-110">
                      ⏰
                    </span>
                  </div>
                  <div className="mt-4 text-left">
                    <p className="text-base font-extrabold text-slate-800 group-hover:text-sky-950 transition-colors">ሐምሌ 21-24/2018 ዓ.ም</p>
                    <p className="mt-1 text-xs font-semibold text-sky-700/80">4 ቀናት (4 Days)</p>
                  </div>
                </div>

                {/* 2. Venue / Location */}
                <div className="group flex flex-col justify-between rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/30 to-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600/80">ቦታ</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-lg text-white shadow-md shadow-amber-500/20 transition-transform duration-300 group-hover:scale-110">
                      📍
                    </span>
                  </div>
                  <div className="mt-4 text-left">
                    <p className="text-base font-extrabold text-slate-800 group-hover:text-amber-950 transition-colors">በሆሳዕና ከተማ</p>
                    <p className="mt-1 text-xs font-semibold text-amber-700/80">ዋናው አዳራሽ</p>
                  </div>
                </div>

                {/* 3. Trainees count */}
                <div className="group flex flex-col justify-between rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600/80">ሰልጣኞች</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500 text-lg text-white shadow-md shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-110">
                      👥
                    </span>
                  </div>
                  <div className="mt-4 text-left">
                    <p className="text-base font-extrabold text-slate-800 group-hover:text-indigo-950 transition-colors">3000+ ሰልጣኞች</p>
                    <p className="mt-1 text-xs font-semibold text-indigo-700/80">ሀገር አቀፍ ተሳታፊዎች</p>
                  </div>
                </div>

                {/* 4. Amenities */}
                <div className="group flex flex-col justify-between rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/30 to-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600/80">አገልግሎት</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-lg text-white shadow-md shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-110">
                      🍽️
                    </span>
                  </div>
                  <div className="mt-4 text-left">
                    <p className="text-base font-extrabold text-slate-800 group-hover:text-emerald-950 transition-colors">ምግብ እና ማደሪያ</p>
                    <p className="mt-1 text-xs font-semibold text-emerald-700/80">ሙሉ በሙሉ የቀረበ</p>
                  </div>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-800 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <span className="relative z-10">አሁን ይመዝገቡ</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-1000 group-hover:translate-x-full"></div>
                </Link>
                <a
                  href="#objectives"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:-translate-y-0.5"
                >
                  ዋና ዋና ዓላማዎች
                </a>
              </div>
            </div>
          </section>

          {/* Objectives Section */}
          <section id="objectives" className="relative scroll-mt-24 space-y-10">
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl flex items-center justify-center sm:justify-start gap-3">
                <span></span> የዚህ ሀገር አቀፍ ስልጠና ዋና ዋና ዓላማዎች
              </h2>
              <div className="mx-auto sm:mx-0 mt-2 h-1 w-24 rounded-full bg-blue-600"></div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Card 1 */}
              <div className="group relative overflow-hidden rounded-[24px] border-l-4 border-l-blue-600 border-y border-r border-slate-200/50 bg-white/70 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-md">
                <span className="absolute right-6 bottom-2 text-7xl font-black text-slate-100/60 pointer-events-none select-none transition-colors duration-300 group-hover:text-blue-50">
                  01
                </span>
                <div className="relative z-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    01
                  </div>
                  <p className="mt-4 text-base sm:text-lg font-extrabold text-slate-800 leading-relaxed transition-colors group-hover:text-blue-700">
                    ክርስቲያኖችን በተለይም ወጣት ክርስቲያኖችን ለታላቁ ተልዕኮ ማነሳሳት እና ማስታጠቅ
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative overflow-hidden rounded-[24px] border-l-4 border-l-indigo-600 border-y border-r border-slate-200/50 bg-white/70 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-md">
                <span className="absolute right-6 bottom-2 text-7xl font-black text-slate-100/60 pointer-events-none select-none transition-colors duration-300 group-hover:text-indigo-50">
                  02
                </span>
                <div className="relative z-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                    02
                  </div>
                  <p className="mt-4 text-base sm:text-lg font-extrabold text-slate-800 leading-relaxed transition-colors group-hover:text-indigo-700">
                    በአሁን ጊዜ ያለውን የተግባራዊ ክርስቲና ክፍተት በመገንዘብ እንደሚገባው ቅዱሳን እንድኖሩ ማገዝ
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative overflow-hidden rounded-[24px] border-l-4 border-l-amber-500 border-y border-r border-slate-200/50 bg-white/70 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:bg-white hover:shadow-md">
                <span className="absolute right-6 bottom-2 text-7xl font-black text-slate-100/60 pointer-events-none select-none transition-colors duration-300 group-hover:text-amber-50">
                  03
                </span>
                <div className="relative z-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold transition-colors group-hover:bg-amber-600 group-hover:text-white">
                    03
                  </div>
                  <p className="mt-4 text-base sm:text-lg font-extrabold text-slate-800 leading-relaxed transition-colors group-hover:text-amber-700">
                    በአለም አቀፍ የወንጌል ተልዕኮ ላይ ለመሳተፍ ፍላጎት እና ውሳኔ ያላቸውን ወጣቶች ወደ ተልዕኮ መስክ የሚሰማሩበትን እድል መፍጠር
                  </p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="group relative overflow-hidden rounded-[24px] border-l-4 border-l-emerald-600 border-y border-r border-slate-200/50 bg-white/70 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-md">
                <span className="absolute right-6 bottom-2 text-7xl font-black text-slate-100/60 pointer-events-none select-none transition-colors duration-300 group-hover:text-emerald-50">
                  04
                </span>
                <div className="relative z-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    04
                  </div>
                  <p className="mt-4 text-base sm:text-lg font-extrabold text-slate-800 leading-relaxed transition-colors group-hover:text-emerald-700">
                    ከስልጠናው በኃላ በሀገር ውስጥ የተለያዩ ክፍሎች የወንጌል ስርጭት ጉዞ ማድረግ
                  </p>
                </div>
              </div>
            </div>

            {/* Restructured Bible Quote block at the bottom of the objectives list */}
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-8 text-center text-white shadow-xl shadow-indigo-950/20 sm:p-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_45%)]"></div>

              <div className="relative z-10 mx-auto max-w-2xl">
                <span className="text-4xl text-indigo-400 opacity-40 font-serif">“</span>
                <p className="text-lg font-bold italic leading-relaxed text-indigo-100 sm:text-2xl tracking-wide">
                  በሰማያት የምትኖር አባታችን ሆይ፤ <br />
                  <span className="not-italic font-black text-amber-400 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]">ስምህ ይቀደስ</span>፤ መንግሥትህ ትምጣ፤ <br />
                  ፈቃድህ በሰማይ እንደሆነች፤ <br />
                  እንዲሁ በምድር ትሁን።
                </p>
                <span className="mt-6 block text-sm font-bold tracking-wider text-amber-400">
                  — ማቴ 6:9-10
                </span>
              </div>
            </div>
          </section>

          {/* Organizer Details & Social Links Bottom Panel */}
          <section className="relative overflow-hidden rounded-[32px] border border-slate-200/50 bg-white/70 p-8 shadow-lg shadow-indigo-950/5 backdrop-blur-sm sm:p-12">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.05),transparent_60%)]"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">አዘጋጅ (Organizer)</p>
                <h3 className="mt-1 text-2xl font-black text-slate-800">HGM (Hossana Gospel Movement)</h3>
                <p className="mt-2 text-xs text-slate-500 font-medium">ለተልዕኮ ክርስትያኖችን ለማነሳሳትና ለማብቀት የተዘጋጀ</p>
              </div>

              {/* Bottom Social Channels */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Telegram */}
                <a
                  href="https://t.me/hossanagospelmovement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-sky-50 border border-sky-100/80 px-6 py-3.5 text-sm font-bold text-sky-700 hover:bg-sky-100 hover:shadow-sm hover:shadow-sky-500/5 transition-all duration-200"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.97-.74 3.79-1.65 6.32-2.73 7.57-3.25 3.61-1.48 4.36-1.74 4.85-1.75.11 0 .35.03.51.16.13.12.17.29.19.41-.02.11-.02.2-.03.3z" />
                  </svg>
                  Telegram
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@hgm180?_r=1&_d=ekl33fc5k83e80&sec_uid=MS4wLjABAAAAcUlBx8Zyr6PaQbRhAc-yPujnT-gV3fGT-aaXpBqMKxpwFGjlfCYYuTjhsQWOnqOA&share_author_id=7505492450350629943&sharer_language=en&source=h5_m&u_code=e78gc0adg78m56&timestamp=1781118170&user_id=7218218390287123462&sec_user_id=MS4wLjABAAAAzmZA5v0hPdfyN1OtBwrCloT-UU11ZmlgHggxFyDrlkYje-GSQ1dBNoG570O8yejM&item_author_type=2&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7641307348003358484&share_link_id=9352e3f3-ccf6-43fe-bec4-70e44ad48fe4&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b6880%2Cb5836&social_share_type=5&enable_checksum=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-slate-900 border border-slate-850 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 hover:shadow-sm transition-all duration-200"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.86.99 2.05 1.63 3.33 1.88.02 1.25.01 2.5.01 3.75-.9-.08-1.8-.4-2.58-.87-.8-.52-1.45-1.25-1.87-2.11-.03 2.87-.02 5.73-.03 8.6-.07 1.83-.72 3.65-1.92 5.01-1.42 1.69-3.6 2.76-5.83 2.91-2.44.11-4.94-.85-6.52-2.73-1.63-1.9-2.31-4.57-1.79-7.05.47-2.15 1.82-4.07 3.7-5.18 1.4-.84 3.03-1.2 4.65-1.03v3.74c-.95-.23-1.99-.02-2.77.58-.88.66-1.41 1.76-1.41 2.87.01 1.25.66 2.44 1.7 3.1 1.05.69 2.45.79 3.58.21 1.05-.51 1.72-1.6 1.73-2.77.02-4.14.01-8.28.01-12.42z" />
                  </svg>
                  TikTok
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/1AiqmwHKZc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-blue-50 border border-blue-100/80 px-6 py-3.5 text-sm font-bold text-blue-700 hover:bg-blue-100 hover:shadow-sm hover:shadow-blue-500/5 transition-all duration-200"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                  </svg>
                  Facebook
                </a>

              </div>

              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-800 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <span className="relative z-10">አሁን ይመዝገቡ</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-1000 group-hover:translate-x-full"></div>
              </Link>
            </div>
          </section>

        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/70 py-8 text-center text-sm font-medium text-slate-500 backdrop-blur-sm">
        <p className="tracking-wide">© {new Date().getFullYear()} Hossana Gospel Movement (HGM). መብቱ በህግ የተጠበቀ ነው።</p>
      </footer>
    </div>
  );
}
