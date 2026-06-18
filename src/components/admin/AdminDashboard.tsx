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
  statusActionStyles,
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
  parishName: string;
  ministryArea: string;
  needsAccommodation: boolean;
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
  { value: "", label: "All" },
  { value: "PENDING", label: statusLabels.PENDING },
  { value: "APPROVED", label: statusLabels.APPROVED },
  { value: "REJECTED", label: statusLabels.REJECTED },
];

export function AdminDashboard({ username }: AdminDashboardProps) {
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
      setError("Network error.");
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

      await fetchRegistrations();
      return true;
    } catch {
      setError("Network error.");
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

  function formatTimeOnly(timeString: string) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date(timeString));
  }

  function formatDayLabel(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(year, month - 1, day));
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
    <div className="min-h-full bg-slate-50/60 pb-12">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900 bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Welcome, {username}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs Sub-Navbar */}
      <div className="border-b border-slate-200 bg-white/60 backdrop-blur-md sticky top-[69px] z-30 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="-mb-px flex gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`border-b-2 py-4 text-sm font-bold transition whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "border-blue-600 text-blue-600 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab("registrations")}
              className={`border-b-2 py-4 text-sm font-bold transition whitespace-nowrap ${
                activeTab === "registrations"
                  ? "border-blue-600 text-blue-600 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              👥 Registrations
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`border-b-2 py-4 text-sm font-bold transition whitespace-nowrap ${
                activeTab === "attendance"
                  ? "border-blue-600 text-blue-600 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              🚪 Attendance
            </button>
            <a
              href="/scanner"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b-2 border-transparent py-4 text-sm font-bold text-slate-500 hover:text-slate-700 hover:border-slate-300 transition whitespace-nowrap flex items-center gap-1.5"
            >
              📷 QR Scanner <span className="text-[10px]">↗</span>
            </a>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard
                label="Total Registered"
                value={counts.TOTAL}
                icon="📊"
                bgClass="bg-gradient-to-br from-indigo-50/30 to-white"
                borderClass="border-indigo-100/80"
                textClass="text-indigo-950"
                iconBg="bg-indigo-50 text-indigo-600"
              />
              <StatCard
                label="Total Approved"
                value={counts.APPROVED}
                icon="✅"
                bgClass="bg-gradient-to-br from-emerald-50/30 to-white"
                borderClass="border-emerald-100/80"
                textClass="text-emerald-950"
                iconBg="bg-emerald-50 text-emerald-600"
              />
              <StatCard
                label="Checked In Today (Gate)"
                value={counts.scannedEntry}
                icon="🚪"
                bgClass="bg-gradient-to-br from-blue-50/30 to-white"
                borderClass="border-blue-100/80"
                textClass="text-blue-950"
                iconBg="bg-blue-50 text-blue-600"
              />
              <StatCard
                label="Lunch Scanned Today"
                value={counts.scannedLunch}
                icon="🍽️"
                bgClass="bg-gradient-to-br from-amber-50/30 to-white"
                borderClass="border-amber-100/80"
                textClass="text-amber-950"
                iconBg="bg-amber-50 text-amber-600"
              />
              <StatCard
                label="Today's Attendance Rate"
                value={`${counts.attendanceRate}%`}
                icon="📈"
                bgClass="bg-gradient-to-br from-rose-50/30 to-white"
                borderClass="border-rose-100/80"
                textClass="text-rose-950"
                iconBg="bg-rose-50 text-rose-600"
                className="col-span-2 sm:col-span-1"
              />
            </div>

            {/* Status breakdown */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">Registration Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-24 text-xs font-bold text-slate-500">Pending</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${counts.TOTAL > 0 ? (counts.PENDING / counts.TOTAL) * 100 : 0}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-extrabold text-amber-600">{counts.PENDING}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 text-xs font-bold text-slate-500">Approved</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${counts.TOTAL > 0 ? (counts.APPROVED / counts.TOTAL) * 100 : 0}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-extrabold text-emerald-600">{counts.APPROVED}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 text-xs font-bold text-slate-500">Rejected</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-700" style={{ width: `${counts.TOTAL > 0 ? (counts.REJECTED / counts.TOTAL) * 100 : 0}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-extrabold text-rose-600">{counts.REJECTED}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "registrations" && (
          <div className="mt-8 space-y-6 rounded-[24px] border border-slate-200/60 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Registrations
                <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-extrabold text-slate-600">
                  {registrations.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage participant requests and payment details</p>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => printAllApprovedBadges(registrations)}
                disabled={registrations.filter(r => r.status === "APPROVED").length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print All Approved ({registrations.filter(r => r.status === "APPROVED").length})
              </button>

              {/* Tab Selector capsule group */}
              <div className="inline-flex rounded-xl bg-slate-100/80 p-1">
                {statusFilters.map((filter) => {
                  const isActive = statusFilter === filter.value;
                  return (
                    <button
                      key={filter.value || "all"}
                      type="button"
                      onClick={() => setStatusFilter(filter.value)}
                      className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, phone or church..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-3 pr-10 py-2 text-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 sm:w-64"
                />
                <span className="absolute right-3 top-2.5 text-slate-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading...</p>
          ) : registrations.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No registrations found.</p>
          ) : (
            <div className="space-y-4">
              {registrations.map((registration) => {
                const accentBorder = {
                  PENDING: "border-l-amber-500",
                  APPROVED: "border-l-emerald-500",
                  REJECTED: "border-l-rose-500",
                }[registration.status];

                return (
                  <article
                    key={registration.id}
                    className={`rounded-2xl border border-slate-200/80 border-l-4 ${accentBorder} bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 flex flex-wrap items-center gap-x-2">
                            {registration.fullName}
                            {registration.registrationNumber && (
                              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                {registration.registrationNumber}
                              </span>
                            )}
                          </h3>
                          <StatusBadge status={registration.status} />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                          <span className="font-semibold text-slate-700">{registration.phone}</span>
                          <span className="text-slate-300">•</span>
                          <span>{registration.churchName}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">{formatDate(registration.createdAt)}</span>
                        </div>
                      </div>

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
                            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Receipt
                          </button>
                        )}

                        {registration.status === "APPROVED" && (
                          <button
                            type="button"
                            onClick={() => setBadgeView(registration)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 px-4 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Badge
                          </button>
                        )}

                        {ALL_REGISTRATION_STATUSES.filter(
                          (status) => status !== registration.status,
                        ).map((status) => {
                          const baseStyles = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-bold text-white transition-all duration-200 disabled:opacity-60";
                          return (
                            <button
                              key={status}
                              type="button"
                              disabled={actionId === registration.id}
                              onClick={() =>
                                setPendingStatusChange({
                                  id: registration.id,
                                  participantName: registration.fullName,
                                  currentStatus: registration.status,
                                  nextStatus: status,
                                })
                              }
                              className={`${baseStyles} ${statusActionStyles[status]}`}
                            >
                              {statusActionLabels[status]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {registration.status === "PENDING" &&
                      hasPaymentScreenshot(registration.paymentScreenshot) && (
                      <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/40 px-3.5 py-2.5 text-xs font-medium text-amber-800">
                        <span className="text-sm">⚠️</span> Please verify payment details before approving.
                      </div>
                    )}

                    {hasPaymentScreenshot(registration.paymentScreenshot) &&
                      !isPdfUrl(registration.paymentScreenshot) && (
                      <div className="mt-4">
                        <img
                          src={registration.paymentScreenshot}
                          alt={`Payment Confirmation - ${registration.fullName}`}
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
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        {expandedId === registration.id ? (
                          <>
                            <span>Show Less</span>
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>View Details</span>
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>

                    {expandedId === registration.id && (
                      <div className="mt-4 rounded-xl bg-slate-50/70 p-4 border border-slate-100">
                        <div className="flex flex-col md:flex-row gap-6">
                          {registration.qrCode && (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 shadow-sm self-center md:self-start">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={registration.qrCode}
                                alt={`QR Code - ${registration.registrationNumber}`}
                                className="h-32 w-32 object-contain"
                              />
                              <span className="text-[10px] font-mono font-bold text-slate-500 mt-2">
                                {registration.registrationNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => setBadgeView(registration)}
                                className="mt-3 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 shadow-sm"
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print
                              </button>
                            </div>
                          )}
                          <div className="flex-1">
                            <dl className="grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                              <Detail label="Age" value={String(registration.age)} />
                              <Detail label="Gender" value={genderLabels[registration.gender]} />
                              <Detail
                                label="Marital Status"
                                value={maritalStatusLabels[registration.maritalStatus]}
                              />
                              <Detail label="Occupation" value={registration.occupation} />
                              <Detail label="Address" value={registration.address} />
                              <Detail label="Church Name" value={registration.parishName} />
                              <Detail label="Ministry Area" value={registration.ministryArea} />
                              <Detail
                                label="Accommodation Required"
                                value={registration.needsAccommodation ? "Yes" : "No"}
                              />
                              <Detail
                                label="Gate Entry Today"
                                value={
                                  registration.scannedEntry
                                    ? `Yes (at ${formatDate(registration.scannedEntryAt!)})`
                                    : "Not yet"
                                }
                              />
                              <Detail
                                label="Lunch Today"
                                value={
                                  registration.scannedLunch
                                    ? `Yes (at ${formatDate(registration.scannedLunchAt!)})`
                                    : "Not yet"
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col items-center gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
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
                            ? "bg-indigo-600 text-white shadow-sm"
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

        {activeTab === "attendance" && (
          <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Attendance by Day
                  <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-extrabold text-indigo-700">
                    {attendanceDays.length} {attendanceDays.length === 1 ? "Day" : "Days"}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Per-day tracking — only days with scan activity are shown</p>
              </div>
              <button
                type="button"
                onClick={() => { setAttendanceFetched(false); void fetchAttendance(); }}
                disabled={attendanceLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60"
              >
                <svg className={`h-3.5 w-3.5 ${attendanceLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {attendanceLoading && !attendanceFetched && (
              <div className="rounded-[24px] border border-slate-200/60 bg-white p-12 shadow-sm text-center">
                <svg className="animate-spin h-6 w-6 text-indigo-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-sm font-semibold text-slate-500">Loading attendance data...</p>
              </div>
            )}

            {!attendanceLoading && attendanceFetched && attendanceDays.length === 0 && (
              <div className="rounded-[24px] border border-slate-200/60 bg-white p-12 shadow-sm text-center">
                <span className="text-3xl block mb-3">📋</span>
                <p className="text-sm font-semibold text-slate-500">No attendance records found yet.</p>
                <p className="text-xs text-slate-400 mt-1">Scan participant QR codes to start recording attendance.</p>
              </div>
            )}

            {/* Day Cards */}
            {attendanceDays.map((day) => (
              <div key={day.date} className="rounded-2xl border border-slate-200/60 bg-white shadow-sm px-5 py-4 sm:px-6 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    📅 {formatDayLabel(day.date)}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{day.date}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-100 px-3 py-1.5 text-[11px] font-extrabold text-blue-700">
                    🚪 {day.entryCount} Entry
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-100 px-3 py-1.5 text-[11px] font-extrabold text-amber-700">
                    🍽️ {day.lunchCount} Lunch
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownload(day.date, "xlsx")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100 hover:border-emerald-300"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Excel
                  </button>
                </div>
              </div>
            ))}
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
    <div className={`rounded-2xl border ${borderClass} ${bgClass} p-5 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg} text-sm shadow-sm`}>
          {icon}
        </span>
      </div>
      <p className={`mt-3 text-3xl font-black tracking-tight ${textClass}`}>{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}
