"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Gender, MaritalStatus, RegistrationStatus } from "@prisma/client";
import { ReceiptModal } from "@/components/admin/ReceiptModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatusConfirmDialog } from "@/components/admin/StatusConfirmDialog";
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
  createdAt: string;
};

type Counts = {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  TOTAL: number;
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

  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter) params.set("status", statusFilter);

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
      };
      setRegistrations(data.registrations);
      setCounts(data.counts);
    } catch {
      setError("Network error.");
    } finally {
      setIsLoading(false);
    }
  }, [router, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchRegistrations();
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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Total"
            value={counts.TOTAL}
            icon="📊"
            bgClass="bg-gradient-to-br from-indigo-50/30 to-white"
            borderClass="border-indigo-100/80"
            textClass="text-indigo-950"
            iconBg="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            label="Pending"
            value={counts.PENDING}
            icon="⏰"
            bgClass="bg-gradient-to-br from-amber-50/30 to-white"
            borderClass="border-amber-100/80"
            textClass="text-amber-950"
            iconBg="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Approved"
            value={counts.APPROVED}
            icon="✅"
            bgClass="bg-gradient-to-br from-emerald-50/30 to-white"
            borderClass="border-emerald-100/80"
            textClass="text-emerald-950"
            iconBg="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Rejected"
            value={counts.REJECTED}
            icon="❌"
            bgClass="bg-gradient-to-br from-rose-50/30 to-white"
            borderClass="border-rose-100/80"
            textClass="text-rose-950"
            iconBg="bg-rose-50 text-rose-600"
          />
        </div>

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
                          <h3 className="text-base font-bold text-slate-900">
                            {registration.fullName}
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
                        </dl>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
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
}: {
  label: string;
  value: number;
  icon: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  iconBg: string;
}) {
  return (
    <div className={`rounded-2xl border ${borderClass} ${bgClass} p-5 shadow-sm transition-all duration-300 hover:shadow-md`}>
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
