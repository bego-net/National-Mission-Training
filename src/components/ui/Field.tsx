import { type ReactNode } from "react";

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  dark?: boolean;
  children: ReactNode;
};

export function Field({ label, htmlFor, error, dark = false, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={htmlFor}
        className={`block text-sm font-bold tracking-wide select-none ${dark ? "text-[#4c3b1a]" : "text-slate-700"
          }`}
      >
        {label}
      </label>
      <div className="relative rounded-xl">{children}</div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 animate-fade-in">
          <svg
            className="h-3.5 w-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
