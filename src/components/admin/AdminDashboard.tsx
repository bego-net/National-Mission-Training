"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Gender, MaritalStatus, RegistrationStatus } from "@prisma/client";
import { ReceiptModal } from "@/components/admin/ReceiptModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatusConfirmDialog } from "@/components/admin/StatusConfirmDialog";
import { BadgeModal } from "@/components/admin/BadgeModal";
import {
  ALL_REGISTRATION_STATUSES,
  genderLabels,
  maritalStatusLabels,
  statusActionLabels,
  statusLabels,
} from "@/lib/labels";
import { hasPaymentScreenshot, isPdfUrl } from "@/lib/validations/payment";

type Registration = {
  id: string;
  fullName: string;
  phone: string;
  age: number;
  gender: Gender;
  maritalStatus: MaritalStatus;
  occupation: string;
  address: string;
  churchName: string;
  ministryArea: string;
  needsAccommodation: boolean;
  needsTshirt: boolean;
  paymentScreenshot: string;
  status: RegistrationStatus;
  registrationNumber?: string;
  qrCode?: string;
  scannedEntry: boolean;
  scannedLunch: boolean;
  scannedEntryAt?: string;
  scannedLunchAt?: string;
  createdAt: string;
};

type Counts = {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  TOTAL: number;
  scannedEntry: number;
  scannedLunch: number;
  attendanceRate: number;
  todayDate?: string;
};

type AttendanceDay = {
  date: string;
  entryCount: number;
  lunchCount: number;
};

type Pagination = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

type AdminDashboardProps = {
  username: string;
  role: "SUPER_ADMIN" | "ADMIN";
};

type ReceiptView = {
  url: string;
  participantName: string;
};

type PendingStatusChange = {
  id: string;
  participantName: string;
  currentStatus: RegistrationStatus;
  nextStatus: RegistrationStatus;
};

const statusFilters: { value: "" | RegistrationStatus; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: statusLabels.PENDING },
  { value: "APPROVED", label: statusLabels.APPROVED },
  { value: "REJECTED", label: statusLabels.REJECTED },
];

export function AdminDashboard({ username, role }: AdminDashboardProps) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [counts, setCounts] = useState<Counts>({
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    TOTAL: 0,
    scannedEntry: 0,
    scannedLunch: 0,
    attendanceRate: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | RegistrationStatus>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [receiptView, setReceiptView] = useState<ReceiptView | null>(null);
  const [pendingStatusChange, setPendingStatusChange] =
    useState<PendingStatusChange | null>(null);
  const [badgeView, setBadgeView] = useState<Registration | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "registrations" | "attendance">("dashboard");
  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceFetched, setAttendanceFetched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, totalCount: 0, totalPages: 1 });

  const fetchRegistrations = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", "50");

      const response = await fetch(`/api/admin/registrations?${params.toString()}`);
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) {
        setError("Failed to fetch registrations.");
        return;
      }

      const data = (await response.json()) as {
        registrations: Registration[];
        counts: Counts;
        pagination: Pagination;
      };
      setRegistrations(data.registrations);
      setCounts(data.counts);
      setPagination(data.pagination);
      setCurrentPage(data.pagination.page);
    } catch {
      setError("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [router, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      void fetchRegistrations(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchRegistrations]);

  async function handleStatusUpdate(
    id: string,
    status: RegistrationStatus,
  ): Promise<boolean> {
    setActionId(id);
    try {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        setError("Failed to update status.");
        return false;
      }

      await fetchRegistrations(currentPage);
      return true;
    } catch {
      setError("Network error occurred.");
      return false;
    } finally {
      setActionId(null);
    }
  }

  async function confirmStatusChange() {
    if (!pendingStatusChange) return;

    const success = await handleStatusUpdate(
      pendingStatusChange.id,
      pendingStatusChange.nextStatus,
    );

    if (success) {
      setPendingStatusChange(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  }

  const fetchAttendance = useCallback(async () => {
    setAttendanceLoading(true);
    try {
      const response = await fetch("/api/admin/attendance");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) return;
      const data = (await response.json()) as { days: AttendanceDay[] };
      setAttendanceDays(data.days);
      setAttendanceFetched(true);
    } catch {
      // silent
    } finally {
      setAttendanceLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (activeTab === "attendance" && !attendanceFetched) {
      void fetchAttendance();
    }
  }, [activeTab, attendanceFetched, fetchAttendance]);

  function formatDayLabel(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(year, (month || 1) - 1, day || 1));
  }

  function handleDownload(date: string, format: "csv" | "xlsx") {
    window.open(`/api/admin/attendance/download?date=${date}&format=${format}`, "_blank");
  }

  function printAllApprovedBadges(regs: Registration[]) {
    const approved = regs.filter((r) => r.status === "APPROVED");
    if (approved.length === 0) return;

    const badgeHTML = (r: Registration) => `
      <div class="badge">
        <div class="badge-header">
          <div class="title">ስምህ ይቀደስ</div>
          <div class="subtitle">National Mission Training</div>
        </div>
        <div class="badge-body">
          <div class="name">${r.fullName}</div>
          <div class="church">${r.churchName}</div>
          ${r.qrCode ? `<div class="qr-wrap"><img class="qr" src="${r.qrCode}" alt="QR" /></div>` : ""}
          ${r.registrationNumber ? `<div class="reg">${r.registrationNumber}</div>` : ""}
        </div>
        <div class="badge-footer">HOSSANA GOSPEL MOVEMENT (HGM)</div>
      </div>`;

    const pw = window.open("", "_blank");
    if (!pw) return;

    pw.document.write(`<!DOCTYPE html><html><head><title>All Badges – Print</title>
    <style>
      @page { size: A4 landscape; margin: 10mm; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: system-ui, -apple-system, sans-serif; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8mm; width: 100%; height: 100vh; page-break-after: always; }
      .grid:last-child { page-break-after: auto; }
      .badge { display: flex; flex-direction: column; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #fff; height: 100%; }
      .badge-header { background: linear-gradient(135deg,#1e3a8a,#3730a3); color: #fff; text-align: center; padding: 10px 8px; }
      .title { font-size: 18px; font-weight: 800; }
      .subtitle { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: .85; margin-top: 2px; }
      .badge-body { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; text-align: center; gap: 4px; }
      .name { font-size: 15px; font-weight: 800; color: #0f172a; line-height: 1.2; }
      .church { font-size: 10px; font-weight: 600; color: #475569; }
      .qr-wrap { margin: 6px 0; border: 1px solid #f1f5f9; border-radius: 6px; padding: 3px; background: #fff; }
      .qr { width: 80px; height: 80px; display: block; }
      .reg { font-family: monospace; font-size: 10px; font-weight: 700; color: #1e3a8a; background: #eff6ff; border: 1px solid #dbeafe; padding: 2px 8px; border-radius: 4px; }
      .badge-footer { text-align: center; padding: 6px; border-top: 1px solid #f1f5f9; background: #fafafa; font-size: 7px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
    </style></head><body>`);

    // Group into pages of 4
    for (let i = 0; i < approved.length; i += 4) {
      const page = approved.slice(i, i + 4);
      pw.document.write(`<div class="grid">${page.map(badgeHTML).join("")}</div>`);
    }

    pw.document.write(`<script>
      window.onload = function() {
        var imgs = document.getElementsByTagName('img');
        var total = imgs.length, loaded = 0;
        function tryPrint() { if (++loaded >= total) { setTimeout(function(){ window.print(); setTimeout(function(){ window.close(); }, 500); }, 300); } }
        if (total === 0) { setTimeout(function(){ window.print(); setTimeout(function(){ window.close(); }, 500); }, 300); }
        else { for (var i = 0; i < imgs.length; i++) { if (imgs[i].complete) tryPrint(); else { imgs[i].addEventListener('load', tryPrint); imgs[i].addEventListener('error', tryPrint); } } }
      };
    <\/script></body></html>`);
    pw.document.close();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans antialiased">
      {/* Sticky Header with glowing elements */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-black text-white shadow-sm shadow-blue-500/10">
              HGM
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">Admin Portal</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged in as {username}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {role === "SUPER_ADMIN" && (
              <a
                href="/admin/admins"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 active:scale-[0.99]"
              >
                ⚙️ Manage Admins
              </a>
            )}
            {/* Highly visible direct Scanner Link */}
            <a
              href="/scanner"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition active:scale-[0.99]"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-4v-4m-6 4h2m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Live Scanner ↗
            </a>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 active:scale-[0.99]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Selector capsule bar */}
      <div className="border-b border-slate-200 bg-white sticky top-[73px] z-30 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="-mb-px flex gap-2 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "dashboard"
                  ? "bg-slate-100 text-blue-600 font-extrabold shadow-inner"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              📊 Stats Dashboard
            </button>
            <button
              onClick={() => setActiveTab("registrations")}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "registrations"
                  ? "bg-slate-100 text-blue-600 font-extrabold shadow-inner"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              👥 Registrations
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                activeTab === "attendance"
                  ? "bg-slate-100 text-blue-600 font-extrabold shadow-inner"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              📅 Attendance Days
            </button>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fade-in">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard
                label="Total Registered"
                value={counts.TOTAL}
                icon="📊"
                bgClass="bg-white"
                borderClass="border-slate-200/80"
                textClass="text-slate-900"
                iconBg="bg-slate-50 text-slate-600 border border-slate-200"
              />
              <StatCard
                label="Approved Requests"
                value={counts.APPROVED}
                icon="✅"
                bgClass="bg-white"
                borderClass="border-slate-200/80"
                textClass="text-emerald-700"
                iconBg="bg-emerald-50 text-emerald-600 border border-emerald-100"
              />
              <StatCard
                label="Gate Check-In (Today)"
                value={counts.scannedEntry}
                icon="🚪"
                bgClass="bg-white"
                borderClass="border-slate-200/80"
                textClass="text-blue-750"
                iconBg="bg-blue-50 text-blue-600 border border-blue-100"
              />
              <StatCard
                label="Lunch Scanned (Today)"
                value={counts.scannedLunch}
                icon="🍽️"
                bgClass="bg-white"
                borderClass="border-slate-200/80"
                textClass="text-amber-750"
                iconBg="bg-amber-50 text-amber-600 border border-amber-100"
              />
              <StatCard
                label="Daily Attendance Rate"
                value={`${counts.attendanceRate}%`}
                icon="📈"
                bgClass="bg-white"
                borderClass="border-slate-200/80"
                textClass="text-indigo-750"
                iconBg="bg-indigo-50 text-indigo-650 border border-indigo-100"
                className="col-span-2 sm:col-span-1"
              />
            </div>

            {/* Registration status progress indicators */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Registration Breakdown</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Overview of pending vs finalized registration requests</p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Pending */}
                <div className="flex items-center gap-4">
                  <span className="w-24 text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-550"></span>
                    Pending
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-700"
                      style={{ width: `${counts.TOTAL > 0 ? (counts.PENDING / counts.TOTAL) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                    {counts.PENDING}
                  </span>
                </div>

                {/* Approved */}
                <div className="flex items-center gap-4">
                  <span className="w-24 text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-550"></span>
                    Approved
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${counts.TOTAL > 0 ? (counts.APPROVED / counts.TOTAL) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                    {counts.APPROVED}
                  </span>
                </div>

                {/* Rejected */}
                <div className="flex items-center gap-4">
                  <span className="w-24 text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-550"></span>
                    Rejected
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-700"
                      style={{ width: `${counts.TOTAL > 0 ? (counts.REJECTED / counts.TOTAL) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/50">
                    {counts.REJECTED}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REGISTRATIONS TAB */}
        {activeTab === "registrations" && (
          <div className="space-y-6 animate-fade-in">
            {/* Search, Filter capsule bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  Participant Registrations
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-extrabold text-slate-700">
                    {pagination.totalCount} total
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage details, receipts, and credential prints</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Print all approved badges action */}
                <button
                  type="button"
                  onClick={() => printAllApprovedBadges(registrations)}
                  disabled={registrations.filter((r) => r.status === "APPROVED").length === 0}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 px-3.5 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Approved Badges ({registrations.filter((r) => r.status === "APPROVED").length})
                </button>

                {/* Filter Selector capsule */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/50">
                  {statusFilters.map((filter) => {
                    const isActive = statusFilter === filter.value;
                    return (
                      <button
                        key={filter.value || "all"}
                        type="button"
                        onClick={() => setStatusFilter(filter.value)}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                          isActive
                            ? "bg-white text-blue-700 shadow-sm border border-slate-200/20"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, phone, or church..."
                    className="w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-xs outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-64"
                  />
                  <span className="absolute right-3.5 top-3 text-slate-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <svg className="animate-spin h-5 w-5 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-xs font-bold text-slate-455">Loading registrations list...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <span className="text-2xl block mb-2">👥</span>
                <p className="text-xs font-bold text-slate-455">No registration records found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration) => {
                  const borderL = {
                    PENDING: "border-l-amber-500",
                    APPROVED: "border-l-emerald-500",
                    REJECTED: "border-l-rose-550",
                  }[registration.status];

                  return (
                    <article
                      key={registration.id}
                      className={`rounded-2xl border border-slate-200/80 border-l-4 ${borderL} bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-sm font-extrabold text-slate-900 flex flex-wrap items-center gap-x-2">
                              {registration.fullName}
                            </h3>
                            
                            {registration.registrationNumber && (
                              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                                {registration.registrationNumber}
                              </span>
                            )}
                            
                            {registration.needsAccommodation && (
                              <span className="text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-150 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Accommodation Required
                              </span>
                            )}
                            {registration.needsTshirt && (
                              <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-150 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                T-Shirt Required
                              </span>
                            )}

                            <StatusBadge status={registration.status} />
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-semibold">
                            <span className="text-slate-800 font-bold">{registration.phone}</span>
                            <span className="text-slate-300">•</span>
                            <span>{registration.churchName}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] text-slate-400 font-medium">{formatDate(registration.createdAt)}</span>
                          </div>
                        </div>

                        {/* Action buttons (Highly Visible) */}
                        <div className="flex flex-wrap items-center gap-2 lg:self-center">
                          {hasPaymentScreenshot(registration.paymentScreenshot) && (
                            <button
                              type="button"
                              onClick={() =>
                                setReceiptView({
                                  url: registration.paymentScreenshot,
                                  participantName: registration.fullName,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50/50 px-3.5 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Receipt
                            </button>
                          )}

                          {registration.status === "APPROVED" && (
                            <button
                              type="button"
                              onClick={() => setBadgeView(registration)}
                              className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50/50 px-3.5 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                              Print Badge
                            </button>
                          )}

                          {/* Primary Decision Actions: Approve & Reject */}
                          {ALL_REGISTRATION_STATUSES.filter(
                            (status) => status !== registration.status,
                          ).map((status) => {
                            const btnColor = {
                              PENDING: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/10",
                              APPROVED: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10",
                              REJECTED: "bg-rose-600 hover:bg-rose-700 shadow-rose-500/10",
                            }[status];

                            const isUpdatingThis = actionId === registration.id && pendingStatusChange?.nextStatus === status;

                            return (
                              <button
                                key={status}
                                type="button"
                                disabled={actionId !== null}
                                onClick={() =>
                                  setPendingStatusChange({
                                    id: registration.id,
                                    participantName: registration.fullName,
                                    currentStatus: registration.status,
                                    nextStatus: status,
                                  })
                                }
                                className={`inline-flex items-center justify-center gap-1.5 rounded-xl ${btnColor} px-4 py-2 text-xs font-extrabold text-white shadow-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-60`}
                              >
                                {isUpdatingThis && (
                                  <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                )}
                                {isUpdatingThis
                                  ? {
                                      PENDING: "Pending...",
                                      APPROVED: "Approving...",
                                      REJECTED: "Rejecting...",
                                    }[status]
                                  : statusActionLabels[status]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Payment review caution notice */}
                      {registration.status === "PENDING" &&
                        hasPaymentScreenshot(registration.paymentScreenshot) && (
                        <div className="mt-3.5 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/45 px-4 py-3 text-xs font-medium text-amber-800">
                          <span className="text-sm shrink-0">⚠️</span>
                          <div>
                            Please verify the payment screenshot below to confirm they have paid before clicking the green <strong className="font-extrabold">Approve</strong> button.
                          </div>
                        </div>
                      )}

                      {/* Small inline image preview for payment receipt */}
                      {hasPaymentScreenshot(registration.paymentScreenshot) &&
                        !isPdfUrl(registration.paymentScreenshot) && (
                        <div className="mt-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Payment Screenshot</p>
                          <img
                            src={registration.paymentScreenshot}
                            alt={`Payment Screenshot - ${registration.fullName}`}
                            className="h-16 w-auto max-w-full cursor-pointer rounded-xl border border-slate-200 object-cover shadow-sm transition hover:opacity-90 hover:shadow"
                            onClick={() =>
                              setReceiptView({
                                url: registration.paymentScreenshot,
                                participantName: registration.fullName,
                              })
                            }
                          />
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(
                              expandedId === registration.id ? null : registration.id,
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          {expandedId === registration.id ? (
                            <>
                              <span>Show Less</span>
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                              </svg>
                            </>
                          ) : (
                            <>
                              <span>View Participant Details</span>
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Collapsible details section */}
                      {expandedId === registration.id && (
                        <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-5">
                          <div className="flex flex-col md:flex-row gap-6">
                            {registration.qrCode && (
                              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm self-center md:self-start">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={registration.qrCode}
                                  alt={`QR Code - ${registration.registrationNumber}`}
                                  className="h-28 w-28 object-contain"
                                />
                                <span className="text-[10px] font-mono font-bold text-slate-500 mt-2.5">
                                  {registration.registrationNumber}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setBadgeView(registration)}
                                  className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition shadow-sm active:scale-[0.99]"
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                  </svg>
                                  Print Badge
                                </button>
                              </div>
                            )}
                            <div className="flex-1">
                              <dl className="grid gap-x-4 gap-y-3.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
                                <Detail label="Age" value={`${registration.age} years`} />
                                <Detail label="Gender" value={genderLabels[registration.gender]} />
                                <Detail
                                  label="Marital Status"
                                  value={maritalStatusLabels[registration.maritalStatus]}
                                />
                                <Detail label="Occupation" value={registration.occupation} />
                                <Detail label="Address" value={registration.address} />
                                <Detail label="Church Name" value={registration.churchName} />
                                <Detail label="Ministry / Service Area" value={registration.ministryArea} />
                                <Detail
                                  label="Accommodation Needed?"
                                  value={registration.needsAccommodation ? "Yes, Accommodation Required" : "No, accommodation not required"}
                                />
                                <Detail
                                  label="T-Shirt Needed?"
                                  value={registration.needsTshirt ? "Yes, T-Shirt Required" : "No, T-shirt not required"}
                                />
                                <Detail
                                  label="Gate Entry Status"
                                  value={
                                    registration.scannedEntry
                                      ? `Checked In ✅ (at ${formatDate(registration.scannedEntryAt!)})`
                                      : "Not yet checked-in"
                                  }
                                />
                                <Detail
                                  label="Lunch Scanned"
                                  value={
                                    registration.scannedLunch
                                      ? `Scanned Lunch 🍽️ (at ${formatDate(registration.scannedLunchAt!)})`
                                      : "No scans recorded today"
                                  }
                                />
                              </dl>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col items-center gap-3 border-t border-slate-200/60 pt-5 sm:flex-row sm:justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  Showing{" "}
                  <span className="font-bold text-slate-700">
                    {(currentPage - 1) * pagination.limit + 1}–
                    {Math.min(currentPage * pagination.limit, pagination.totalCount)}
                  </span>{" "}
                  of <span className="font-bold text-slate-700">{pagination.totalCount}</span> registrations
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || isLoading}
                    onClick={() => void fetchRegistrations(currentPage - 1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                    Prev
                  </button>

                  {/* Page number pills — show at most 5 around current */}
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) =>
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - currentPage) <= 1
                    )
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "…" ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">…</span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          disabled={isLoading}
                          onClick={() => void fetchRegistrations(item as number)}
                          className={`h-7 w-7 rounded-xl text-xs font-extrabold transition ${
                            item === currentPage
                              ? "bg-blue-600 text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    type="button"
                    disabled={currentPage >= pagination.totalPages || isLoading}
                    onClick={() => void fetchRegistrations(currentPage + 1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === "attendance" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header info */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  Daily Attendance Log
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-extrabold text-blue-700">
                    {attendanceDays.length} {attendanceDays.length === 1 ? "Active Day" : "Active Days"}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Summary of attendance counts for days with scan activity</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAttendanceFetched(false);
                  void fetchAttendance();
                }}
                disabled={attendanceLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-355 disabled:opacity-60"
              >
                <svg className={`h-3.5 w-3.5 ${attendanceLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Log
              </button>
            </div>

            {attendanceLoading && !attendanceFetched && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <svg className="animate-spin h-5 w-5 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-xs font-bold text-slate-500">Loading daily attendance records...</p>
              </div>
            )}

            {!attendanceLoading && attendanceFetched && attendanceDays.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <span className="text-2xl block mb-2">📋</span>
                <p className="text-xs font-bold text-slate-550">No daily attendance logs found yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Scan participant QR codes to start logging attendance.</p>
              </div>
            )}

            {/* Day Log Rows */}
            <div className="grid gap-4">
              {attendanceDays.map((day) => (
                <div
                  key={day.date}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-655 font-bold">
                      📅
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 leading-snug">
                        {formatDayLabel(day.date)}
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400 tracking-wider mt-0.5">{day.date}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-150 px-3 py-1.5 text-[11px] font-extrabold text-blue-755 shadow-sm">
                      🚪 {day.entryCount} Check-In Scans
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-150 px-3 py-1.5 text-[11px] font-extrabold text-amber-755 shadow-sm">
                      🍽️ {day.lunchCount} Lunch Scans
                    </span>
                    
                    {/* Downloads */}
                    <button
                      type="button"
                      onClick={() => handleDownload(day.date, "xlsx")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/50 px-3.5 py-1.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100 active:scale-[0.99]"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Excel Export
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {receiptView && (
        <ReceiptModal
          url={receiptView.url}
          participantName={receiptView.participantName}
          onClose={() => setReceiptView(null)}
        />
      )}

      {pendingStatusChange && (
        <StatusConfirmDialog
          participantName={pendingStatusChange.participantName}
          currentStatus={pendingStatusChange.currentStatus}
          nextStatus={pendingStatusChange.nextStatus}
          isLoading={actionId === pendingStatusChange.id}
          onConfirm={() => void confirmStatusChange()}
          onCancel={() => setPendingStatusChange(null)}
        />
      )}

      {badgeView && (
        <BadgeModal
          registration={badgeView}
          onClose={() => setBadgeView(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  bgClass,
  borderClass,
  textClass,
  iconBg,
  className = "",
}: {
  label: string;
  value: number | string;
  icon: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  iconBg: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border ${borderClass} ${bgClass} p-5 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg} text-sm`}>
          {icon}
        </span>
      </div>
      <p className={`mt-3 text-2xl font-black tracking-tight ${textClass}`}>{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</dt>
      <dd className="font-semibold text-slate-800 mt-0.5">{value}</dd>
    </div>
  );
}
