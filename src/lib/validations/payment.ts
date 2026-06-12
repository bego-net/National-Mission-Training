export const ACCEPTED_PAYMENT_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"] as const;

export const ACCEPTED_PAYMENT_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
] as const;

export const MAX_PAYMENT_FILE_SIZE = 5 * 1024 * 1024;

export type PaymentFileValidationResult =
  | { ok: true; file: File }
  | { ok: false; error: string };

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function validatePaymentFile(
  value: FormDataEntryValue | null,
): PaymentFileValidationResult {
  if (!value || !(value instanceof File) || value.size === 0) {
    return { ok: false, error: "የክፍያ ማረጋገጫ ፎቶ ያስፈልጋል።" };
  }

  const extension = getFileExtension(value.name);
  const mimeValid = ACCEPTED_PAYMENT_MIME_TYPES.includes(
    value.type as (typeof ACCEPTED_PAYMENT_MIME_TYPES)[number],
  );
  const extensionValid = ACCEPTED_PAYMENT_EXTENSIONS.includes(
    extension as (typeof ACCEPTED_PAYMENT_EXTENSIONS)[number],
  );

  if (!mimeValid && !extensionValid) {
    return {
      ok: false,
      error: "jpg, jpeg, png, ወይም pdf ብቻ ይፈቀዳል።",
    };
  }

  if (value.size > MAX_PAYMENT_FILE_SIZE) {
    return { ok: false, error: "ፋይሉ ከ 5MB በላይ ነው።" };
  }

  return { ok: true, file: value };
}

export function isPdfUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes(".pdf") ||
    lower.includes("/raw/upload/") ||
    lower.includes("f_pdf")
  );
}

export function hasPaymentScreenshot(url: string | null | undefined): boolean {
  return Boolean(url && url.trim().length > 0);
}
