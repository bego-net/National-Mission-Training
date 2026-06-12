import Link from "next/link";

type PageHeaderProps = {
  showRegisterLink?: boolean;
};

export function PageHeader({ showRegisterLink = false }: PageHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
            HGM
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800">Hossana Gospel Movement</p>
            <p className="text-xs text-slate-500">የተልዕኮ ስልጠና ምዝገባ</p>
          </div>
        </Link>
        {showRegisterLink && (
          <Link
            href="/register"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            ምዝገባ
          </Link>
        )}
      </div>
    </header>
  );
}
