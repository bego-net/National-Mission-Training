"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Gender, MaritalStatus, RegistrationStatus } from "@prisma/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  genderLabels,
  maritalStatusLabels,
  statusLabels,
} from "@/lib/labels";

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

const statusFilters: { value: "" | RegistrationStatus; label: string }[] = [
  { value: "", label: "ሁሉም" },
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
        setError("ምዝገባዎችን ማምጣት አልተሳካም።");
        return;
      }

      const data = (await response.json()) as {
        registrations: Registration[];
        counts: Counts;
      };
      setRegistrations(data.registrations);
      setCounts(data.counts);
    } catch {
      setError("የአውታረ መረብ ስህተት።");
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

  async function handleStatusUpdate(id: string, status: "APPROVED" | "REJECTED") {
    setActionId(id);
    try {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        setError("ሁኔታ ማዘመን አልተሳካም።");
        return;
      }

      await fetchRegistrations();
    } catch {
      setError("የአውታረ መረብ ስህተት።");
    } finally {
      setActionId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("am-ET", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  }

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900">የአስተዳዳሪ ዳሽቦርድ</h1>
            <p className="text-sm text-slate-500">እንኳን ደህና መጡ፣ {username}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ውጣ
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="ጠቅላላ" value={counts.TOTAL} color="text-slate-900" />
          <StatCard label="በመጠባበቅ" value={counts.PENDING} color="text-amber-700" />
          <StatCard label="ተፀድቋል" value={counts.APPROVED} color="text-green-700" />
          <StatCard label="ተቀባይነት አልተሰጠም" value={counts.REJECTED} color="text-red-700" />
        </div>

        <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-slate-900">ምዝገባዎች</h2>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="በስም፣ ስልክ ወይም ቤተ ክርስቲያን ፈልግ..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:max-w-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value || "all"}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  statusFilter === filter.value
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">በመጫን ላይ...</p>
          ) : registrations.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">ምንም ምዝገባ አልተገኘም።</p>
          ) : (
            <div className="space-y-3">
              {registrations.map((registration) => (
                <article
                  key={registration.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {registration.fullName}
                        </h3>
                        <StatusBadge status={registration.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{registration.phone}</p>
                      <p className="text-xs text-slate-500">
                        {registration.churchName} · {formatDate(registration.createdAt)}
                      </p>
                    </div>

                    {registration.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={actionId === registration.id}
                          onClick={() =>
                            void handleStatusUpdate(registration.id, "APPROVED")
                          }
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700 disabled:opacity-60"
                        >
                          ፀድቅ
                        </button>
                        <button
                          type="button"
                          disabled={actionId === registration.id}
                          onClick={() =>
                            void handleStatusUpdate(registration.id, "REJECTED")
                          }
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                          አትቀበል
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(
                        expandedId === registration.id ? null : registration.id,
                      )
                    }
                    className="mt-3 text-xs font-medium text-blue-700 hover:text-blue-800"
                  >
                    {expandedId === registration.id ? "ዝቅ አድርግ" : "ተጨማሪ ዝርዝር"}
                  </button>

                  {expandedId === registration.id && (
                    <dl className="mt-3 grid gap-2 border-t border-slate-200 pt-3 text-sm sm:grid-cols-2">
                      <Detail label="ዕድሜ" value={String(registration.age)} />
                      <Detail label="ጾታ" value={genderLabels[registration.gender]} />
                      <Detail
                        label="የጋብቻ ሁኔታ"
                        value={maritalStatusLabels[registration.maritalStatus]}
                      />
                      <Detail label="ሙያ" value={registration.occupation} />
                      <Detail label="አድራሻ" value={registration.address} />
                      <Detail label="አብያተ ክርስቲያኖች" value={registration.parishName} />
                      <Detail label="የአገልግሎት ዘርፍ" value={registration.ministryArea} />
                      <Detail
                        label="መኝታ"
                        value={registration.needsAccommodation ? "አዎ" : "አይ"}
                      />
                    </dl>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
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
