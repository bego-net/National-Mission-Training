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
  "w-full rounded-2xl border border-amber-200 bg-white/80 px-4 py-3.5 text-sm text-stone-900 outline-none transition-all duration-200 placeholder:text-stone-400 hover:border-amber-300 hover:bg-white focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10";

const selectClassName =
  "w-full rounded-2xl border border-amber-200 bg-white/80 px-4 py-3.5 text-sm text-stone-900 outline-none transition-all duration-200 hover:border-amber-300 hover:bg-white focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 appearance-none cursor-pointer";

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
  const [needsTshirt, setNeedsTshirt] = useState(false);

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
      ministryArea: formData.get("ministryArea"),
      needsAccommodation: formData.get("needsAccommodation") === "on",
      needsTshirt: formData.get("needsTshirt") === "on",
      tShirtSize: (formData.get("tShirtSize") as string) || null,
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
    formData.set(
      "needsTshirt",
      parsed.data.needsTshirt ? "true" : "false",
    );
    formData.set(
      "tShirtSize",
      parsed.data.needsTshirt ? (parsed.data.tShirtSize || "") : "",
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
        <div className="sm:col-span-2">
          <Field label="ሙሉ ስም *" htmlFor="fullName" error={errors.fullName} dark>
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
        <div>
          <Field label="ስልክ ቁጥር *" htmlFor="phone" error={errors.phone} dark>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={inputClassName}
              placeholder="09xxxxxxxx / 07xxxxxxxx"
              pattern="^(09|07)[0-9]{8}$"
            />
          </Field>
        </div>

        {/* Age */}
        <div>
          <Field label="ዕድሜ *" htmlFor="age" error={errors.age} dark>
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
        <div>
          <Field label="ጾታ *" htmlFor="gender" error={errors.gender} dark>
            <div className="relative">
              <select id="gender" name="gender" defaultValue="" className={selectClassName}>
                <option value="" disabled className="bg-white text-stone-400">
                  ይምረጡ
                </option>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-white text-stone-900">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-amber-800">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </Field>
        </div>

        {/* Marital Status */}
        <div>
          <Field label="የጋብቻ ሁኔታ *" htmlFor="maritalStatus" error={errors.maritalStatus} dark>
            <div className="relative">
              <select
                id="maritalStatus"
                name="maritalStatus"
                defaultValue=""
                className={selectClassName}
              >
                <option value="" disabled className="bg-white text-stone-400">
                  ይምረጡ
                </option>
                {maritalStatusOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-white text-stone-900">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-amber-800">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </Field>
        </div>

        {/* Occupation */}
        <div className="sm:col-span-2">
          <Field label="ሙያ / ስራ *" htmlFor="occupation" error={errors.occupation} dark>
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
        <div className="sm:col-span-2">
          <Field label="አድራሻ *" htmlFor="address" error={errors.address} dark>
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
        <div className="sm:col-span-2">
          <Field label="የቤተ ክርስቲያን ስም *" htmlFor="churchName" error={errors.churchName} dark>
            <input
              id="churchName"
              name="churchName"
              type="text"
              className={inputClassName}
              placeholder="የቤተ ክርስቲያን ስም"
            />
          </Field>
        </div>

        {/* Ministry Area */}
        <div className="sm:col-span-2">
          <Field label="የአገልግሎት ዘርፍ *" htmlFor="ministryArea" error={errors.ministryArea} dark>
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
        <div className="sm:col-span-2">
          <label
            className={`flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 cursor-pointer select-none ${needsAccom
              ? "border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/5"
              : "border-amber-200 bg-white/50 hover:bg-white/80"
              }`}
          >
            <input
              id="needsAccommodation"
              name="needsAccommodation"
              type="checkbox"
              className="mt-1 h-4.5 w-4.5 rounded-lg border-amber-300 bg-white text-amber-600 focus:ring-amber-500 cursor-pointer"
              onChange={(e) => setNeedsAccom(e.target.checked)}
            />
            <div className="flex-1">
              <span className={`block text-sm font-bold ${needsAccom ? "text-amber-900" : "text-stone-850"}`}>
                መኝታ ቦታ ያስፈልገኛል? (+200 ETB)
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-stone-500">
                በስልጠናው ወቅት መኝታ ቦታ ከፈለጉ ይህን ሳጥን ይምረጡ።
              </span>
            </div>
          </label>
        </div>

        {/* Needs T-Shirt Checkbox */}
        <div className="sm:col-span-2">
          <label
            className={`flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 cursor-pointer select-none ${needsTshirt
              ? "border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/5"
              : "border-amber-200 bg-white/50 hover:bg-white/80"
              }`}
          >
            <input
              id="needsTshirt"
              name="needsTshirt"
              type="checkbox"
              className="mt-1 h-4.5 w-4.5 rounded-lg border-amber-300 bg-white text-amber-600 focus:ring-amber-500 cursor-pointer"
              onChange={(e) => setNeedsTshirt(e.target.checked)}
            />
            <div className="flex-1">
              <span className={`block text-sm font-bold ${needsTshirt ? "text-amber-900" : "text-stone-850"}`}>
                ቲሸርት ይፈልጋሉ? (+500 ETB)
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-stone-500">
                ለስልጠናው የተዘጋጀ ቲሸርት ለመግዛት ከፈለጉ ይህን ሳጥን ይምረጡ።
              </span>
            </div>
          </label>
        </div>

        {/* Needs T-Shirt Size Selector */}
        {needsTshirt && (
          <div className="sm:col-span-2 animate-fade-in">
            <Field label="የቲሸርት መጠን * (T-Shirt Size)" htmlFor="tShirtSize" error={errors.tShirtSize} dark>
              <div className="relative">
                <select id="tShirtSize" name="tShirtSize" defaultValue="" className={selectClassName}>
                  <option value="" disabled className="bg-white text-stone-400">
                    የቲሸርት መጠን ይምረጡ (Select Size)
                  </option>
                  {["S", "M", "L", "XL", "XXL"].map((size) => (
                    <option key={size} value={size} className="bg-white text-stone-900">
                      {size}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-amber-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </Field>
          </div>
        )}

        {/* Dynamic Pricing Breakdown Display */}
        <div className="sm:col-span-2 rounded-2xl border border-amber-200 bg-amber-50/20 p-5 backdrop-blur-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">የክፍያ ዝርዝር (Payment Details)</h4>
          <div className="space-y-2 text-sm text-stone-750 font-medium">
            <div className="flex justify-between">
              <span>መደበኛ ምዝገባ (Registration)</span>
              <span>1,000 ETB</span>
            </div>
            {needsAccom && (
              <div className="flex justify-between text-stone-700 animate-fade-in">
                <span>መኝታ ቦታ (Accommodation)</span>
                <span>+200 ETB</span>
              </div>
            )}
            {needsTshirt && (
              <div className="flex justify-between text-stone-700 animate-fade-in">
                <span>ቲሸርት (T-Shirt)</span>
                <span>+500 ETB</span>
              </div>
            )}
            {needsAccom && needsTshirt && (
              <div className="flex justify-between text-emerald-700 animate-fade-in">
                <span>የጥቅል ቅናሽ (Bundle Discount)</span>
                <span>-200 ETB</span>
              </div>
            )}
            <div className="pt-2.5 mt-2.5 border-t border-amber-200 flex justify-between font-extrabold text-stone-900 text-base">
              <span>ጠቅላላ ክፍያ (Total Payment)</span>
              <span className="text-amber-850 tracking-wide font-black">
                {1000 + (needsAccom ? 200 : 0) + (needsTshirt ? 500 : 0) - (needsAccom && needsTshirt ? 200 : 0)} ETB
              </span>
            </div>
          </div>
        </div>

        {/* Payment Screenshot File Upload */}
        <div className="sm:col-span-2">
          <Field
            label="የክፍያ ደረሰኝ (Receipt) *"
            htmlFor="paymentScreenshot"
            error={errors.paymentScreenshot}
            dark
          >
            <div
              className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-8 px-4 text-center transition-all duration-300 cursor-pointer ${selectedFileName
                ? "border-emerald-500 bg-emerald-50"
                : errors.paymentScreenshot
                  ? "border-rose-500 bg-rose-50 hover:border-rose-450"
                  : "border-amber-200 bg-white/50 hover:border-amber-500/40 hover:bg-white/80"
                }`}
            >
              {selectedFileName ? (
                // Success Upload Icon
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-600 animate-fade-in">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                // Cloud Upload Icon
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-700 transition-colors group-hover:bg-amber-100 group-hover:text-amber-900">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
              )}

              <span className="mt-3 block text-sm font-bold text-stone-700">
                {selectedFileName || "የክፍያ ደረሰኝ ወይም የሞባይል ባንክ ስክሪንሾት ያስገቡ"}
              </span>
              <span className="mt-1 block text-xs text-stone-500">
                Upload payment receipt or Mobile Banking screenshot
              </span>
              <span className="mt-2 text-[10px] font-medium tracking-wide text-stone-500 uppercase">
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

      {/* Validation Caution Banner — shown when fields have errors */}
      {Object.keys(errors).length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3.5 animate-fade-in">
          <svg className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-amber-900">
              እባክዎ ቅጹን ያስተካክሉ
            </p>
            <p className="mt-0.5 text-xs text-amber-700 font-semibold">
              {Object.keys(errors).length === 1
                ? "1 ያልተሞላ ወይም ትክክል ያልሆነ መረጃ አለ። እባክዎ ከላይ ያረጋግጡ።"
                : `${Object.keys(errors).length} ያልተሞሉ ወይም ትክክል ያልሆኑ መረጃዎች አሉ። እባክዎ ከላይ ያረጋግጡ።`}
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#dec084] via-[#eedbb3] to-[#cba358] py-3.5 px-6 text-base font-bold text-[#3c2f17] border border-[#cba358]/35 shadow-[0_4px_15px_rgba(222,192,132,0.35)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_4px_25px_rgba(222,192,132,0.5)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin text-amber-950" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            በመላክ ላይ...
          </span>
        ) : (
          <span className="relative z-10 flex items-center gap-2">
            ምዝገባ ያስገቡ
            <svg className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        )}
      </button>
    </form>
  );
}
