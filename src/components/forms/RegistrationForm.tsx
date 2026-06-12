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
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const selectClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

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
        <div className="sm:col-span-2">
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

        <Field label="ጾታ *" htmlFor="gender" error={errors.gender}>
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
        </Field>

        <Field label="የጋብቻ ሁኔታ *" htmlFor="maritalStatus" error={errors.maritalStatus}>
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
        </Field>

        <div className="sm:col-span-2">
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

        <div className="sm:col-span-2">
          <Field label="አድራሻ *" htmlFor="address" error={errors.address}>
            <textarea
              id="address"
              name="address"
              rows={2}
              className={inputClassName}
              placeholder="ከተማ፣ ክፍለ ከተማ ወይም ወረዳ"
            />
          </Field>
        </div>

        <Field label="የቤተ ክርስቲያን ስም *" htmlFor="churchName" error={errors.churchName}>
          <input
            id="churchName"
            name="churchName"
            type="text"
            className={inputClassName}
            placeholder="የቤተ ክርስቲያን ስም"
          />
        </Field>

        <Field label="የአብያተ ክርስቲያኖች ስም *" htmlFor="parishName" error={errors.parishName}>
          <input
            id="parishName"
            name="parishName"
            type="text"
            className={inputClassName}
            placeholder="የአብያተ ክርስቲያኖች ስም"
          />
        </Field>

        <div className="sm:col-span-2">
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

        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <input
              id="needsAccommodation"
              name="needsAccommodation"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">መኝታ ቦታ ያስፈልገኛል?</span>
              <span className="mt-0.5 block text-sm text-slate-500">
                በስልጠናው ወቅት መኝታ ቦታ ከፈለጉ ይህን ሳብስ ያድርጉ።
              </span>
            </span>
          </label>
        </div>

        <div className="sm:col-span-2">
          <Field
            label="የክፍያ ማረጋገጫ ፎቶ *"
            htmlFor="paymentScreenshot"
            error={errors.paymentScreenshot}
          >
            <input
              id="paymentScreenshot"
              name="paymentScreenshot"
              type="file"
              accept={acceptAttribute}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700"
              onChange={(e) =>
                setSelectedFileName(e.target.files?.[0]?.name ?? "")
              }
            />
            <p className="mt-1.5 text-xs text-slate-500">
              jpg, jpeg, png, ወይም pdf — ከፍተኛው መጠን {MAX_PAYMENT_FILE_SIZE / (1024 * 1024)}MB
            </p>
            {selectedFileName && (
              <p className="mt-1 text-xs font-medium text-slate-700">
                የተመረጠ፡ {selectedFileName}
              </p>
            )}
          </Field>
        </div>
      </div>

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "በመላክ ላይ..." : "ምዝገባ ያስገቡ"}
      </button>
    </form>
  );
}
