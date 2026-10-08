import { Lock, LogOut, Scale } from "lucide-react";

export default function Navbar({ admin, onAdmin, onSignOut }) {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-hall-900/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
        <Scale size={20} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-bone-2" />
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-lg font-semibold leading-tight text-bone">
            დებატების კლუბი
          </h1>
          <p className="truncate text-meta text-bone-3">
            <span className="sm:hidden">რუსთავის №4</span>
            <span className="hidden sm:inline">რუსთავის №4 საჯარო სკოლა</span>
          </p>
        </div>
        {admin ? (
          <button type="button" onClick={onSignOut} aria-label="გასვლა"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-hall-600 px-3 text-sm text-bone-2 transition-colors hover:bg-hall-700 hover:text-bone">
            <LogOut size={16} strokeWidth={1.75} />
            <span className="hidden sm:inline">გასვლა</span>
          </button>
        ) : (
          <button type="button" onClick={onAdmin} aria-label="ადმინისტრატორის შესვლა"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-hall-600 px-3 text-sm text-bone-2 transition-colors hover:bg-hall-700 hover:text-bone">
            <Lock size={16} strokeWidth={1.75} />
            <span className="hidden sm:inline">შესვლა</span>
          </button>
        )}
      </div>
    </header>
  );
}
