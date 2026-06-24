"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/Field";
import { loginSchema } from "@/lib/validations/auth";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

export function LoginForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSubmitError("");

    const formData = new FormData(event.currentTarget);
    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setSubmitError(data.error ?? "Invalid credentials. Please try again.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Field label="Email Address" htmlFor="email" error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className={inputClassName}
          placeholder="Enter admin email"
        />
      </Field>

      <Field label="Password" htmlFor="password" error={errors.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className={inputClassName}
          placeholder="Enter password"
        />
      </Field>

      {submitError && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-xs font-semibold text-rose-700">
          <svg className="h-4.5 w-4.5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{submitError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="relative flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 active:scale-[0.99] transition disabled:pointer-events-none disabled:opacity-60"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Signing In...
          </span>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}
