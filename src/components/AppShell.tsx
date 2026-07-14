import Link from "next/link";
import { BarChart3, FileSearch, Landmark } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Landmark size={18} aria-hidden />
          </span>
          <span>CodexBanco Evidence Intelligence</span>
        </Link>
        <nav className="nav" aria-label="Primary">
          <Link href="/">
            <FileSearch size={16} aria-hidden />
            Investigação
          </Link>
          <Link href="/kpi">
            <BarChart3 size={16} aria-hidden />
            KPIs
          </Link>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}

