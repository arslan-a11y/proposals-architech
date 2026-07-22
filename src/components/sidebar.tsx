import Link from "next/link";
import { LayoutDashboard, FileText, LayoutTemplate, Users, PenLine } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/crm", label: "CRM", icon: Users },
];

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r bg-[var(--at-ink)] text-white flex flex-col">
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-lime flex items-center justify-center">
          <PenLine className="w-4 h-4 text-[var(--at-ink)]" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm">ArchiTech</div>
          <div className="text-[11px] text-white/50">Proposals</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/40">
        v0.1 · Node.js build
      </div>
    </aside>
  );
}
