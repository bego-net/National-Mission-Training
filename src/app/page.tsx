"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

type CheckResult = {
  found: boolean;
  fullName?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  registrationNumber?: string | null;
  error?: string;
};

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/registrations/check?phone=${encodeURIComponent(phoneNumber)}`);
      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setResult({ found: false, error: data.error || "የስልክ ቁጥር ማረጋገጥ አልተሳካም።" });
      }
    } catch {
      setResult({ found: false, error: "የአውታረ መረብ ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#fdfaf2] via-[#f7ebd0] to-[#e8d2a0] text-stone-900 overflow-x-hidden font-sans">
      {/* Luxurious Gold Spotlight / Rays */}
      <div className="absolute top-[-5%] left-[5%] z-0 h-[600px] w-[600px] rounded-full bg-white opacity-[0.5] blur-[110px] pointer-events-none"></div>
      <div className="absolute top-[25%] right-[10%] z-0 h-[500px] w-[500px] rounded-full bg-amber-200/40 opacity-[0.4] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[15%] left-[20%] z-0 h-[600px] w-[600px] rounded-full bg-white opacity-[0.4] blur-[130px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <PageHeader maxWidth="5xl" showRegisterLink={true} />

        <main className="flex-1 px-4 py-12 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl space-y-20 sm:space-y-28">

            {/* Hero Section */}
            <section className="text-center sm:text-left space-y-12 animate-fade-in">

              {/* Event Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/45 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800 shadow-[0_4px_15px_rgba(217,119,6,0.06)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                HGM ሀገር አቀፍ የተልዕኮ ስልጠና 2018
              </div>

              {/* Redesigned Premium Heading in Gold */}
              <div className="max-w-4xl space-y-6">
                <h1 className="text-4xl font-black tracking-tight text-[#2d220f] sm:text-6xl md:text-7xl leading-tight">
                  ስምህ ይቀደስ
                  <span className="block mt-3 text-3xl font-black bg-gradient-to-r from-amber-800 via-amber-950 to-stone-900 bg-clip-text text-transparent sm:text-5xl md:text-6xl">
                    ሀገር አቀፍ የተልዕኮ ስልጠና
                  </span>
                  <span className="block mt-3 text-2xl font-bold bg-gradient-to-r from-amber-700 via-[#8a6f2a] to-amber-850 bg-clip-text text-transparent sm:text-3xl font-sans">
                    National Mission Training
                  </span>
                </h1>

                <p className="text-base leading-relaxed text-[#4b3e25] sm:text-lg sm:leading-loose max-w-3xl font-medium">
                  ይህ የተልዕኮ ስልጠና ፡- <span className="font-bold text-stone-900">ክርስቲያኖችን ለታላቁ ተልዕኮ የማነሳሳት እና የማስታጠቅ</span> ስልጠና ነው ። በተለይም የ2018 ዓ.ም ስልጠና ትኩረቱን <span className="inline-block px-3 py-1 rounded-xl bg-amber-100/50 text-[#5c461a] font-bold border border-amber-300/45">ተግባራዊ ክርስትና ለተልዕኮ</span> በሚል ሃሳብ ላይ ትኩረት በማድረግ ለተልዕኮ ክርስትያኖችን ለማነሳሳትና ለማብቀት የተዘጋጀ ነው።
                </p>
              </div>

              {/* Hero CTAs */}
              <div className="flex flex-col gap-4 sm:flex-row pt-4 justify-center sm:justify-start">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#dec084] via-[#eedbb3] to-[#cba358] text-[#3c2f17] border border-[#cba358]/35 px-8 py-4 text-base font-bold shadow-[0_8px_20px_rgba(222,192,132,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    አሁን ይመዝገቡ
                    <svg className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </Link>
                <a
                  href="#objectives"
                  className="inline-flex items-center justify-center rounded-xl border border-amber-250/50 bg-white/60 px-8 py-4 text-base font-bold text-amber-950 hover:bg-white transition-all duration-200 shadow-sm"
                >
                  ዋና ዋና ዓላማዎች
                </a>
              </div>
            </section>

            {/* Interactive Check Status Widget (Light Glassmorphic Panel) */}
            <section className="relative max-w-2xl mx-auto sm:mx-0 animate-fade-in">
              <div className="rounded-2xl border border-amber-200/50 bg-white/60 p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-xl">
                <div>
                  <h3 className="text-lg font-bold text-[#2d220f]">የምዝገባ ሁኔታ ማረጋገጫ</h3>
                  <p className="mt-1 text-xs text-[#5c4a2a]">
                    ስልክ ቁጥርዎን በማስገባት የምዝገባዎን ሂደት እና አጠቃላይ የሁኔታ ሪፖርት ያረጋግጡ።
                  </p>
                </div>

                <form onSubmit={handleCheckStatus} className="space-y-4">
                  <label className="block text-xs text-[#4c3e23] font-bold">
                    በስርዓቱ ውስጥ የተመዘገበውን የስልክ ቁጥር ያስገቡ
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 09xxxxxxxx"
                      className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="absolute right-2.5 top-1.5 rounded-lg bg-amber-800 px-4 py-2 text-xs font-bold text-white hover:bg-amber-900 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {loading ? "በማረጋገጥ ላይ..." : "ፈልግ"}
                    </button>
                  </div>

                  {/* Detected Status Output block */}
                  <div className="rounded-xl border border-amber-200/50 bg-white/80 p-4 flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-800">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#5c4a2a]">DETECTED STATUS</p>
                        <div className="mt-0.5 text-sm font-bold text-[#2d220f]">
                          {loading ? (
                            <span className="text-amber-800 animate-pulse">በማረጋገጥ ላይ...</span>
                          ) : result ? (
                            result.found ? (
                              result.status === "APPROVED" ? (
                                <span className="text-emerald-600 font-extrabold">የጸደቀ (APPROVED)</span>
                              ) : result.status === "REJECTED" ? (
                                <span className="text-rose-600 font-extrabold">ውድቅ የተደረገ (REJECTED)</span>
                              ) : (
                                <span className="text-amber-600 font-extrabold">በመጠባበቅ ላይ (PENDING)</span>
                              )
                            ) : (
                              <span className="text-rose-500 font-extrabold">ያልተገኘ (NOT FOUND)</span>
                            )
                          ) : (
                            <span className="text-stone-400">የስልክ ቁጥር በመጠባበቅ ላይ</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Report Badge detail */}
                    {result && result.found && (
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-stone-400 uppercase">PARTICIPANT</p>
                        <p className="text-xs font-bold text-stone-850">{result.fullName}</p>
                        {result.registrationNumber && (
                          <p className="text-[10px] font-black text-amber-800 tracking-wider mt-0.5">
                            {result.registrationNumber}
                          </p>
                        )}
                      </div>
                    )}

                    {result && !result.found && (
                      <div className="text-right">
                        <Link href="/register" className="text-xs font-bold text-amber-700 hover:underline">
                          አሁን ይመዝገቡ →
                        </Link>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </section>

            {/* Premium Gold Cards Grid */}
            <section className="space-y-8 animate-fade-in">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                {/* Card 1: Total Participants */}
                <div className="rounded-2xl border border-amber-200/50 bg-white/60 p-5 backdrop-blur-md relative overflow-hidden group hover:border-amber-300 hover:bg-white/80 transition-all duration-300 shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-full"></div>
                  <h4 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">3,000+</h4>
                  <p className="mt-1.5 text-xs font-bold text-[#5c4a2a] tracking-wide">ሀገር አቀፍ ተሳታፊዎች</p>
                  <p className="mt-0.5 text-[10px] text-stone-400 uppercase">Total Participants</p>
                </div>

                {/* Card 2: Duration */}
                <div className="rounded-2xl border border-amber-200/50 bg-white/60 p-5 backdrop-blur-md relative overflow-hidden group hover:border-amber-300 hover:bg-white/80 transition-all duration-300 shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-500/5 to-transparent rounded-bl-full"></div>
                  <h4 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">5 ቀናት</h4>
                  <p className="mt-1.5 text-xs font-bold text-[#5c4a2a] tracking-wide">ቆይታ (ሐምሌ 21-25)</p>
                  <p className="mt-0.5 text-[10px] text-stone-400 uppercase">Event Duration</p>
                </div>

                {/* Card 3: Venue */}
                <div className="rounded-2xl border border-amber-200/50 bg-white/60 p-5 backdrop-blur-md relative overflow-hidden group hover:border-amber-300 hover:bg-white/80 transition-all duration-300 shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-full"></div>
                  <h4 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">ሆሳዕና</h4>
                  <p className="mt-1.5 text-xs font-bold text-[#5c4a2a] tracking-wide">ስልጠናው ቦታ (እናት ቃለ ሕይወት)</p>
                  <p className="mt-0.5 text-[10px] text-stone-400 uppercase">Training Venue</p>
                </div>

                {/* Card 4: Speakers & Tracks */}
                <div className="rounded-2xl border border-amber-200/50 bg-white/60 p-5 backdrop-blur-md relative overflow-hidden group hover:border-amber-300 hover:bg-white/80 transition-all duration-300 shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full"></div>
                  <h4 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">4+</h4>
                  <p className="mt-1.5 text-xs font-bold text-[#5c4a2a] tracking-wide">አገልጋዮች እና ዋና ዋና የስልጠና ርዕሶች</p>
                  <p className="mt-0.5 text-[10px] text-stone-400 uppercase">Speakers &amp; Training Tracks</p>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Supported Financial Institutions</p>
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-[#5c4a2a] text-sm font-semibold">
                  <span className="px-3.5 py-1.5 rounded-xl bg-white/65 border border-amber-200/40 shadow-sm">CBE (የኢትዮጵያ ንግድ ባንክ)</span>
                </div>
              </div>
            </section>

            {/* Objectives Section */}
            <section id="objectives" className="relative scroll-mt-24 space-y-12">
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-extrabold tracking-tight text-[#2d220f] sm:text-4xl flex items-center justify-center sm:justify-start gap-3">
                  የዚህ ሀገር አቀፍ ስልጠና ዋና ዋና ዓላማዎች
                </h2>
                <div className="mx-auto sm:mx-0 mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-amber-500 to-amber-700"></div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">

                {/* Card 1 */}
                <div className="group relative overflow-hidden rounded-2xl border border-amber-200/40 bg-white/55 p-6 sm:p-8 transition-all duration-300 hover:border-amber-400/60 hover:bg-white/75 shadow-sm">
                  <span className="absolute right-6 bottom-2 text-7xl font-black text-amber-800/5 pointer-events-none select-none transition-colors duration-300 group-hover:text-amber-600/10">
                    01
                  </span>
                  <div className="relative z-10 space-y-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-150 text-amber-700 font-bold transition-all group-hover:bg-amber-600 group-hover:text-white">
                      01
                    </div>
                    <p className="text-base sm:text-lg font-extrabold text-[#2d220f] leading-relaxed">
                      ክርስቲያኖችን በተለይም ወጣት ክርስቲያኖችን ለታላቁ ተልዕኮ ማነሳሳት እና ማስታጠቅ
                    </p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="group relative overflow-hidden rounded-2xl border border-amber-200/40 bg-white/55 p-6 sm:p-8 transition-all duration-300 hover:border-amber-400/60 hover:bg-white/75 shadow-sm">
                  <span className="absolute right-6 bottom-2 text-7xl font-black text-amber-800/5 pointer-events-none select-none transition-colors duration-300 group-hover:text-amber-600/10">
                    02
                  </span>
                  <div className="relative z-10 space-y-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-150 text-amber-700 font-bold transition-all group-hover:bg-amber-600 group-hover:text-white">
                      02
                    </div>
                    <p className="text-base sm:text-lg font-extrabold text-[#2d220f] leading-relaxed">
                      በአሁን ጊዜ ያለውን የተግባራዊ ክርስቲና ክፍተት በመገንዘብ እንደሚገባው ቅዱሳን እንድኖሩ ማገዝ
                    </p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="group relative overflow-hidden rounded-2xl border border-amber-200/40 bg-white/55 p-6 sm:p-8 transition-all duration-300 hover:border-amber-400/60 hover:bg-white/75 shadow-sm">
                  <span className="absolute right-6 bottom-2 text-7xl font-black text-amber-800/5 pointer-events-none select-none transition-colors duration-300 group-hover:text-amber-600/10">
                    03
                  </span>
                  <div className="relative z-10 space-y-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-150 text-amber-700 font-bold transition-all group-hover:bg-amber-600 group-hover:text-white">
                      03
                    </div>
                    <p className="text-base sm:text-lg font-extrabold text-[#2d220f] leading-relaxed">
                      በአለም አቀፍ የወንጌል ተልዕኮ ላይ ለመሳተፍ ፍላጎት እና ውሳኔ ያላቸውን ወጣቶች ወደ ተልዕኮ መስክ የሚሰማሩበትን እድል መፍጠር
                    </p>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="group relative overflow-hidden rounded-2xl border border-amber-200/40 bg-white/55 p-6 sm:p-8 transition-all duration-300 hover:border-amber-400/60 hover:bg-white/75 shadow-sm">
                  <span className="absolute right-6 bottom-2 text-7xl font-black text-amber-800/5 pointer-events-none select-none transition-colors duration-300 group-hover:text-amber-600/10">
                    04
                  </span>
                  <div className="relative z-10 space-y-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-150 text-amber-700 font-bold transition-all group-hover:bg-amber-600 group-hover:text-white">
                      04
                    </div>
                    <p className="text-base sm:text-lg font-extrabold text-[#2d220f] leading-relaxed">
                      ከስልጠናው በኃላ በሀገር ውስጥ የተለያዩ ክፍሎች የወንጌል ስርጭት ጉዞ ማድረግ
                    </p>
                  </div>
                </div>


              </div>

              {/* Glowing Bible Verse Block (Gold Tinted Card) */}
              <div className="relative overflow-hidden rounded-3xl border border-amber-300/60 bg-gradient-to-br from-amber-50/80 via-white/80 to-amber-50/80 p-8 text-center shadow-xl sm:p-16">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.03),transparent_50%)]"></div>

                <div className="relative z-10 mx-auto max-w-2xl space-y-6">
                  <span className="text-4xl text-amber-600/45 font-serif">“</span>
                  <p className="text-lg font-bold italic leading-relaxed text-[#2d220f] sm:text-2xl tracking-wide">
                    በሰማያት የምትኖር አባታችን ሆይ፤ <br />
                    <span className="not-italic font-black text-amber-700 bg-gradient-to-r from-amber-700 via-amber-900 to-amber-700 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(217,119,6,0.1)]">ስምህ ይቀደስ</span>፤ መንግሥትህ ትምጣ፤ <br />
                    ፈቃድህ በሰማይ እንደሆነች፤ <br />
                    እንዲሁ በምድር ትሁን።
                  </p>
                  <span className="mt-4 block text-sm font-bold tracking-wider text-amber-700">
                    — ማቴ 6:9-10
                  </span>
                </div>
              </div>
            </section>

            {/* Support and Organizer Side-by-Side Section */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Support Card */}
              <section className="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-white/60 p-6 shadow-md backdrop-blur-md flex flex-col justify-between">
                <div className="absolute inset-x-0 top-0 h-16 bg-[radial-gradient(circle_at_top,rgba(217,119,6,0.02),transparent_60%)]"></div>
                <div className="relative z-10 space-y-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/50 px-3 py-1 text-xs font-bold text-amber-800">
                      የእገዛ ማዕከል (Support)
                    </span>
                    <p className="mt-1 text-xs text-[#5c4a2a] font-medium">ለማንኛውም ጥያቄ ወይም እገዛ እባክዎ ያግኙን</p>
                  </div>

                  <div className="space-y-3">
                    {/* Ethio Telecom */}
                    <div className="flex items-start gap-3 rounded-xl bg-amber-50/40 border border-amber-100/50 p-3 shadow-[0_2px_8px_rgba(217,119,6,0.03)]">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-900 font-extrabold text-xs">
                        ET
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-[10px] font-bold text-amber-950 uppercase tracking-wide">Ethio Telecom</p>
                        <div className="flex flex-wrap gap-x-2 text-sm font-bold font-mono text-stone-800">
                          <a href="tel:+251982755544" className="hover:text-amber-700 transition">0982755544</a>
                          <span className="text-amber-300">/</span>
                          <a href="tel:+251982787981" className="hover:text-amber-700 transition">0982787981</a>
                        </div>
                      </div>
                    </div>

                    {/* Safaricom */}
                    <div className="flex items-start gap-3 rounded-xl bg-emerald-50/30 border border-emerald-100/40 p-3 shadow-[0_2px_8px_rgba(16,185,129,0.02)]">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-950 font-extrabold text-xs">
                        SF
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-[10px] font-bold text-emerald-950 uppercase tracking-wide">Safaricom</p>
                        <a href="tel:+251710557591" className="block text-sm font-bold font-mono text-stone-800 hover:text-emerald-700 transition">0710557591</a>
                      </div>
                    </div>

                    {/* Telegram */}
                    <div className="flex items-start gap-3 rounded-xl bg-blue-50/30 border border-blue-100/40 p-3 shadow-[0_2px_8px_rgba(59,130,246,0.02)]">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-900 text-xs">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.66-.52.36-1 .53-1.42.52-.47-.01-1.37-.27-2.03-.49-.82-.27-1.47-.42-1.42-.88.03-.24.36-.49.99-.74 3.89-1.69 6.48-2.8 7.78-3.33 3.69-1.52 4.46-1.78 4.96-1.79.11 0 .36.03.52.16.13.11.17.26.19.37z" />
                        </svg>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-[10px] font-bold text-blue-950 uppercase tracking-wide">Telegram</p>
                        <div className="flex flex-wrap gap-x-3 text-sm font-bold text-stone-800">
                          <a href="https://t.me/wami_ka" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">@wami_ka</a>
                          <span className="text-stone-300">|</span>
                          <a href="https://t.me/I_am_some" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">@I_am_some</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Organizer Card */}
              <section className="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-white/60 p-6 shadow-md backdrop-blur-md flex flex-col justify-between">
                <div className="absolute inset-x-0 bottom-0 h-16 bg-[radial-gradient(circle_at_bottom,rgba(217,119,6,0.02),transparent_60%)]"></div>
                <div className="relative z-10 space-y-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/50 px-3 py-1 text-xs font-bold text-amber-800">
                      አዘጋጅ (Organizer)
                    </span>
                    <h4 className="mt-2.5 text-lg font-black text-[#2d220f]">HGM (Hossana Gospel Movement)</h4>
                    <p className="mt-1 text-xs text-[#5c4a2a]/80 font-medium">ክርስትያኖችን ለተልዕኮ ማነሳሳትና ማብቀት </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-[#5c4a2a]/90 uppercase tracking-wide mb-2">ማህበራዊ ሚዲያ (Socials)</p>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href="https://t.me/hossanagospelmovement"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/40 px-3 py-2 text-xs font-bold text-amber-850 hover:bg-amber-100/70 hover:text-amber-950 transition shadow-sm"
                        >
                          Telegram
                        </a>
                        <a
                          href="https://www.tiktok.com/@hgm180?_r=1&_d=ekl33fc5k83e80&sec_uid=MS4wLjABAAAAcUlBx8Zyr6PaQbRhAc-yPujnT-gV3fGT-aaXpBqMKxpwFGjlfCYYuTjhsQWOnqOA&share_author_id=7505492450350629943&sharer_language=en&source=h5_m&u_code=e78gc0adg78m56&timestamp=1781118170&user_id=7218218390287123462&sec_user_id=MS4wLjABAAAAzmZA5v0hPdfyN1OtBwrCloT-UU11ZmlgHggxFyDrlkYje-GSQ1dBNoG570O8yejM&item_author_type=2&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7641307348003358484&share_link_id=9352e3f3-ccf6-43fe-bec4-70e44ad48fe4&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b6880%2Cb5836&social_share_type=5&enable_checksum=1"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-amber-200/40 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50 transition shadow-sm"
                        >
                          TikTok
                        </a>
                        <a
                          href="https://www.facebook.com/share/1AiqmwHKZc/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/40 px-3 py-2 text-xs font-bold text-amber-850 hover:bg-amber-100/70 hover:text-amber-950 transition shadow-sm"
                        >
                          Facebook
                        </a>
                      </div>
                    </div>

                    <Link
                      href="/register"
                      className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#dec084] via-[#eedbb3] to-[#cba358] text-[#3c2f17] border border-[#cba358]/35 w-full py-3 text-xs font-bold shadow-sm transition hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <span className="relative z-10 flex items-center gap-1">
                        አሁን ይመዝገቡ
                        <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>
              </section>
            </div>

          </div>
        </main>

        <footer className="border-t border-amber-200/40 bg-white/40 py-8 text-center text-sm font-semibold text-[#5c4a2a] backdrop-blur-sm">
          <p className="tracking-wide">© {new Date().getFullYear()} Hossana Gospel Movement (HGM). መብቱ በህግ የተጠበቀ ነው።</p>
        </footer>
      </div>
    </div>
  );
}
