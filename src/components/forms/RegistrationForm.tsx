"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/Field";
import {
  ACCEPTED_PAYMENT_EXTENSIONS,
  MAX_PAYMENT_FILE_SIZE,
  validatePaymentFile,
} from "@/lib/validations/payment";
import {
  genderOptions,
  maritalStatusOptions,
  registrationSchema,
} from "@/lib/validations/registration";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

const selectClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer";

const acceptAttribute = [
  ...ACCEPTED_PAYMENT_EXTENSIONS.map((ext) =>
    ext === "pdf" ? "application/pdf" : `image/${ext === "jpg" ? "jpeg" : ext}`,
  ),
  ...ACCEPTED_PAYMENT_EXTENSIONS.map((ext) => `.${ext}`),
].join(",");

export function RegistrationForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [needsAccom, setNeedsAccom] = useState(false);

  function onFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSubmit(event);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (isSubmitting) return;

    setErrors({});
    setSubmitError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const paymentFile = validatePaymentFile(formData.get("paymentScreenshot"));

    const raw = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      age: formData.get("age"),
      gender: formData.get("gender"),
      maritalStatus: formData.get("maritalStatus"),
      occupation: formData.get("occupation"),
      address: formData.get("address"),
      churchName: formData.get("churchName"),
      parishName: formData.get("parishName"),
      ministryArea: formData.get("ministryArea"),
      needsAccommodation: formData.get("needsAccommodation") === "on",
    };

    const fieldErrors: Record<string, string> = {};

    if (!paymentFile.ok) {
      fieldErrors.paymentScreenshot = paymentFile.error;
    }

    const parsed = registrationSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
    }

    if (Object.keys(fieldErrors).length > 0 || !parsed.success || !paymentFile.ok) {
      setErrors(fieldErrors);
      return;
    }

    formData.set(
      "needsAccommodation",
      parsed.data.needsAccommodation ? "true" : "false",
    );

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      let data: { error?: string; id?: string } = {};
      try {
        data = (await response.json()) as { error?: string; id?: string };
      } catch {
        data = {};
      }

      if (!response.ok) {
        setSubmitError(data.error ?? "ምዝገባው አልተሳካም። እባክዎ እንደገና ይሞክሩ።");
        return;
      }

      router.push("/register/success");
    } catch {
      setSubmitError("የአውታረ መረብ ስህተት። እባክዎ እንደገና ይሞክሩ።");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onFormSubmit} className="space-y-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Full Name */}
        <div className="sm:col-span-2 animate-fade-in">
          <Field label="ሙሉ ስም *" htmlFor="fullName" error={errors.fullName}>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              className={inputClassName}
              placeholder="ሙሉ ስምዎን ያስገቡ"
            />
          </Field>
        </div>

        {/* Phone */}
        <div className="animate-fade-in">
          <Field label="ስልክ ቁጥር *" htmlFor="phone" error={errors.phone}>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={inputClassName}
              placeholder="09xxxxxxxx"
            />
          </Field>
        </div>

        {/* Age */}
        <div className="animate-fade-in">
          <Field label="ዕድሜ *" htmlFor="age" error={errors.age}>
            <input
              id="age"
              name="age"
              type="number"
              min={15}
              max={80}
              className={inputClassName}
              placeholder="25"
            />
          </Field>
        </div>

        {/* Gender */}
        <div className="animate-fade-in">
          <Field label="ጾታ *" htmlFor="gender" error={errors.gender}>
            <div className="relative">
              <select id="gender" name="gender" defaultValue="" className={selectClassName}>
                <option value="" disabled>
                  ይምረጡ
                </option>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </Field>
        </div>

        {/* Marital Status */}
        <div className="animate-fade-in">
          <Field label="የጋብቻ ሁኔታ *" htmlFor="maritalStatus" error={errors.maritalStatus}>
            <div className="relative">
              <select
                id="maritalStatus"
                name="maritalStatus"
                defaultValue=""
                className={selectClassName}
              >
                <option value="" disabled>
                  ይምረጡ
                </option>
                {maritalStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </Field>
        </div>

        {/* Occupation */}
        <div className="sm:col-span-2 animate-fade-in">
          <Field label="ሙያ / ስራ *" htmlFor="occupation" error={errors.occupation}>
            <input
              id="occupation"
              name="occupation"
              type="text"
              className={inputClassName}
              placeholder="ሙያዎን ያስገቡ"
            />
          </Field>
        </div>

        {/* Address */}
        <div className="sm:col-span-2 animate-fade-in">
          <Field label="አድራሻ *" htmlFor="address" error={errors.address}>
            <textarea
              id="address"
              name="address"
              rows={2}
              className={`${inputClassName} resize-none`}
              placeholder="ከተማ፣ ክፍለ ከተማ ወይም ወረዳ"
            />
          </Field>
        </div>

        {/* Church Name */}
        <div className="animate-fade-in">
          <Field label="የቤተ ክርስቲያን ስም *" htmlFor="churchName" error={errors.churchName}>
            <input
              id="churchName"
              name="churchName"
              type="text"
              className={inputClassName}
              placeholder="የቤተ ክርስቲያን ስም"
            />
          </Field>
        </div>

        {/* Parish Name */}
        <div className="animate-fade-in">
          <Field label="የአብያተ ክርስቲያኖች ስም *" htmlFor="parishName" error={errors.parishName}>
            <input
              id="parishName"
              name="parishName"
              type="text"
              className={inputClassName}
              placeholder="የአብያተ ክርስቲያኖች ስም"
            />
          </Field>
        </div>

        {/* Ministry Area */}
        <div className="sm:col-span-2 animate-fade-in">
          <Field label="የአገልግሎት ዘርፍ *" htmlFor="ministryArea" error={errors.ministryArea}>
            <input
              id="ministryArea"
              name="ministryArea"
              type="text"
              className={inputClassName}
              placeholder="ለምሳሌ፡ ወጣቶች አገልግሎት፣ ውሳኔ፡ መዝሙር"
            />
          </Field>
        </div>

        {/* Needs Accommodation Checkbox */}
        <div className="sm:col-span-2 animate-fade-in">
          <label
            className={`flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 cursor-pointer select-none ${
              needsAccom
                ? "border-blue-500 bg-blue-50/40 shadow-sm shadow-blue-500/5"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <input
              id="needsAccommodation"
              name="needsAccommodation"
              type="checkbox"
              className="mt-1 h-4.5 w-4.5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              onChange={(e) => setNeedsAccom(e.target.checked)}
            />
            <div className="flex-1">
              <span className="block text-sm font-bold text-slate-800">
                መኝታ ቦታ ያስፈልገኛል?
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                በስልጠናው ወቅት መኝታ ቦታ ከፈለጉ ይህን ሳጥን ይምረጡ።
              </span>
            </div>
          </label>
        </div>

        {/* Payment Screenshot File Upload */}
        <div className="sm:col-span-2 animate-fade-in">
          <Field
            label="የክፍያ ማረጋገጫ ፎቶ *"
            htmlFor="paymentScreenshot"
            error={errors.paymentScreenshot}
          >
            <div
              className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-8 px-4 text-center transition-all duration-300 cursor-pointer ${
                selectedFileName
                  ? "border-emerald-400 bg-emerald-50/20"
                  : errors.paymentScreenshot
                  ? "border-rose-300 bg-rose-50/10 hover:border-rose-400"
                  : "border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-slate-50"
              }`}
            >
              {selectedFileName ? (
                // Success Upload Icon
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-fade-in">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                // Cloud Upload Icon
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-blue-50 group-hover:text-blue-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
              )}

              <span className="mt-3 block text-sm font-bold text-slate-700">
                {selectedFileName || "የማረጋገጫ ፎቶ ወይም ፒዲኤፍ እዚህ ይስቀሉ"}
              </span>
              <span className="mt-1 block text-xs text-slate-400">
                ክሊክ በማድረግ ወይም ፋይሉን ጎትቶ እዚህ በመጣል ይስቀሉ
              </span>
              <span className="mt-2 text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                jpg, jpeg, png, pdf (ቢበዛ {MAX_PAYMENT_FILE_SIZE / (1024 * 1024)}MB)
              </span>

              <input
                id="paymentScreenshot"
                name="paymentScreenshot"
                type="file"
                accept={acceptAttribute}
                className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                onChange={(e) =>
                  setSelectedFileName(e.target.files?.[0]?.name ?? "")
                }
              />
            </div>
          </Field>
        </div>
      </div>

      {/* Submission Error Banner */}
      {submitError && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-semibold text-rose-700 animate-fade-in">
          <svg className="h-5 w-5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>{submitError}</div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 px-6 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-700 hover:to-indigo-800 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            በመላክ ላይ...
          </span>
        ) : (
          <span className="relative z-10 flex items-center gap-2">
            ምዝገባ ያስገቡ
            <svg className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        )}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-1000 group-hover:translate-x-full"></div>
      </button>
    </form>
  );
}
