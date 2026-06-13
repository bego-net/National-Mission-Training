import Link from "next/link";

export type PageHeaderProps = {
  showRegisterLink?: boolean;
  maxWidth?: "3xl" | "5xl" | "7xl";
};

export function PageHeader({ showRegisterLink = false, maxWidth = "3xl" }: PageHeaderProps) {
  const widthClasses = maxWidth === "5xl" ? "max-w-5xl" : maxWidth === "7xl" ? "max-w-7xl" : "max-w-3xl";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
      <div className={`mx-auto flex items-center justify-between px-4 py-4 sm:px-6 ${widthClasses}`}>
        {/* Brand Link (ስምህ ይቀደስ) */}
        <Link href="/" className="group flex items-center gap-2 transition-transform duration-250 active:scale-[0.98]">
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-900 bg-clip-text text-transparent sm:text-2xl transition-all duration-300 group-hover:opacity-85">
            ስምህ ይቀደስ
          </span>
        </Link>

        {/* Social Media Links (between brand and actions button) */}
        <div className="flex items-center gap-4">
          {/* Telegram */}
          <a
            href="https://t.me/hossanagospelmovement"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-sky-600 transition-colors"
            title="Telegram"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.97-.74 3.79-1.65 6.32-2.73 7.57-3.25 3.61-1.48 4.36-1.74 4.85-1.75.11 0 .35.03.51.16.13.12.17.29.19.41-.02.11-.02.2-.03.3z"/>
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@hgm180?_r=1&_d=ekl33fc5k83e80&sec_uid=MS4wLjABAAAAcUlBx8Zyr6PaQbRhAc-yPujnT-gV3fGT-aaXpBqMKxpwFGjlfCYYuTjhsQWOnqOA&share_author_id=7505492450350629943&sharer_language=en&source=h5_m&u_code=e78gc0adg78m56&timestamp=1781118170&user_id=7218218390287123462&sec_user_id=MS4wLjABAAAAzmZA5v0hPdfyN1OtBwrCloT-UU11ZmlgHggxFyDrlkYje-GSQ1dBNoG570O8yejM&item_author_type=2&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7641307348003358484&share_link_id=9352e3f3-ccf6-43fe-bec4-70e44ad48fe4&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b6880%2Cb5836&social_share_type=5&enable_checksum=1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-900 transition-colors"
            title="TikTok"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.86.99 2.05 1.63 3.33 1.88.02 1.25.01 2.5.01 3.75-.9-.08-1.8-.4-2.58-.87-.8-.52-1.45-1.25-1.87-2.11-.03 2.87-.02 5.73-.03 8.6-.07 1.83-.72 3.65-1.92 5.01-1.42 1.69-3.6 2.76-5.83 2.91-2.44.11-4.94-.85-6.52-2.73-1.63-1.9-2.31-4.57-1.79-7.05.47-2.15 1.82-4.07 3.7-5.18 1.4-.84 3.03-1.2 4.65-1.03v3.74c-.95-.23-1.99-.02-2.77.58-.88.66-1.41 1.76-1.41 2.87.01 1.25.66 2.44 1.7 3.1 1.05.69 2.45.79 3.58.21 1.05-.51 1.72-1.6 1.73-2.77.02-4.14.01-8.28.01-12.42z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/share/1AiqmwHKZc/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-blue-600 transition-colors"
            title="Facebook"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
            </svg>
          </a>
        </div>

        {/* Right Navigation Actions (ምዝገባ) */}
        <div className="flex items-center gap-4">
          {showRegisterLink && (
            <Link
              href="/register"
              className="relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-blue-700 active:scale-[0.98]"
            >
              ምዝገባ
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
