"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Admin = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  createdAt: string;
};

type ManageAdminsClientProps = {
  currentUserId: string;
  currentUserName: string;
};

export function ManageAdminsClient({ currentUserId, currentUserName }: ManageAdminsClientProps) {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dialog / Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);

  // Add form fields
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"SUPER_ADMIN" | "ADMIN">("ADMIN");
  const [addError, setAddError] = useState("");
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Edit form fields
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"SUPER_ADMIN" | "ADMIN">("ADMIN");
  const [editError, setEditError] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/admins");
      if (response.status === 401 || response.status === 403) {
        router.push("/admin");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch admins list");
      }
      const data = await response.json();
      setAdmins(data.admins);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while loading admins.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchAdmins();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAdmins]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setIsSubmittingAdd(true);

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create administrator");
      }

      // Reset form & reload list
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("ADMIN");
      setShowAddForm(false);
      setSuccess("Administrator added successfully!");
      setTimeout(() => setSuccess(""), 4000);
      setIsLoading(true);
      setError("");
      void fetchAdmins();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Failed to create administrator");
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleOpenEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setEditName(admin.name);
    setEditEmail(admin.email);
    setEditPassword("");
    setEditRole(admin.role);
    setEditError("");
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setEditError("");
    setIsSubmittingEdit(true);

    try {
      const response = await fetch(`/api/admin/admins/${editingAdmin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          password: editPassword || undefined,
          role: editRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update administrator");
      }

      setEditingAdmin(null);
      setSuccess("Administrator updated successfully!");
      setTimeout(() => setSuccess(""), 4000);
      setIsLoading(true);
      setError("");
      void fetchAdmins();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Failed to update administrator");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deletingAdmin) return;
    setEditError("");
    setIsSubmittingDelete(true);

    try {
      const response = await fetch(`/api/admin/admins/${deletingAdmin.id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete administrator");
      }

      setDeletingAdmin(null);
      setSuccess("Administrator deleted successfully!");
      setTimeout(() => setSuccess(""), 4000);
      setIsLoading(true);
      setError("");
      void fetchAdmins();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete administrator");
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateStr));
  }

  const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans antialiased">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
              title="Back to Dashboard"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">Admin Management</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Super Admin: {currentUserName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition active:scale-[0.99]"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Administrator
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 flex items-center gap-2 animate-fade-in shadow-sm">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        {/* ADMINS LIST */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">System Administrators</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Manage administrative credentials and system-wide roles</p>
            </div>
            <span className="inline-flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-extrabold text-slate-700">
              {admins.length} total
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <svg className="animate-spin h-5 w-5 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-xs font-bold text-slate-400">Loading administrators list...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No admins found in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-5">Name & Email</th>
                    <th className="py-3 px-5">Role</th>
                    <th className="py-3 px-5">Joined Date</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {admin.name}
                          {admin.id === currentUserId && (
                            <span className="text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-150 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-550 mt-0.5 font-medium">{admin.email}</div>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-extrabold border ${
                            admin.role === "SUPER_ADMIN"
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {admin.role === "SUPER_ADMIN" ? "👑 SUPER ADMIN" : "👤 ADMIN"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-400 font-medium">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="py-4 px-5 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(admin)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 active:scale-[0.99] shadow-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          disabled={admin.id === currentUserId}
                          onClick={() => setDeletingAdmin(admin)}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ADD ADMIN DIALOG */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6 relative">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Add Administrator</h3>
            <p className="text-xs text-slate-400 mb-4">Create administrative login credentials</p>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Martha Hailu"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Role Permission</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole("ADMIN")}
                    className={`py-2 text-center text-xs font-bold border rounded-xl transition ${
                      newRole === "ADMIN"
                        ? "bg-slate-100 border-slate-300 text-slate-800"
                        : "bg-white border-slate-200 text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    👤 ADMIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole("SUPER_ADMIN")}
                    className={`py-2 text-center text-xs font-bold border rounded-xl transition ${
                      newRole === "SUPER_ADMIN"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-755 font-extrabold"
                        : "bg-white border-slate-200 text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    👑 SUPER ADMIN
                  </button>
                </div>
              </div>

              {addError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                  {addError}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmittingAdd}
                  onClick={() => {
                    setShowAddForm(false);
                    setAddError("");
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-[0.99]"
                >
                  {isSubmittingAdd ? "Saving..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN DIALOG */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6 relative">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Edit Administrator</h3>
            <p className="text-xs text-slate-400 mb-4">Modify details and permission level for {editingAdmin.name}</p>

            <form onSubmit={handleEditAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Role Permission</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={editingAdmin.id === currentUserId}
                    onClick={() => setEditRole("ADMIN")}
                    className={`py-2 text-center text-xs font-bold border rounded-xl transition disabled:opacity-50 ${
                      editRole === "ADMIN"
                        ? "bg-slate-100 border-slate-300 text-slate-800"
                        : "bg-white border-slate-200 text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    👤 ADMIN
                  </button>
                  <button
                    type="button"
                    disabled={editingAdmin.id === currentUserId}
                    onClick={() => setEditRole("SUPER_ADMIN")}
                    className={`py-2 text-center text-xs font-bold border rounded-xl transition disabled:opacity-50 ${
                      editRole === "SUPER_ADMIN"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-755 font-extrabold"
                        : "bg-white border-slate-200 text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    👑 SUPER ADMIN
                  </button>
                </div>
                {editingAdmin.id === currentUserId && (
                  <p className="text-[10px] text-slate-400 mt-1.5">You cannot change your own super administrator permission level.</p>
                )}
              </div>

              {editError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmittingEdit}
                  onClick={() => {
                    setEditingAdmin(null);
                    setEditError("");
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-[0.99]"
                >
                  {isSubmittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {deletingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6 relative">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Delete Administrator</h3>
            <p className="text-xs text-slate-400 mb-4">
              Are you sure you want to permanently delete <strong className="text-slate-800">{deletingAdmin.name}</strong> ({deletingAdmin.email})? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                disabled={isSubmittingDelete}
                onClick={() => setDeletingAdmin(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingDelete}
                onClick={handleDeleteAdmin}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-[0.99] flex items-center gap-1.5"
              >
                {isSubmittingDelete ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
