import Link from "next/link";
import { LayoutDashboard, FileText, LayoutTemplate, Users, PenLine, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/auth-actions";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/crm", label: "CRM", icon: Users },
];

const ROLE_LABEL: Record<string, string> = { REP: "Sales Rep", APPROVER: "Approver", ADMIN: "Admin" };

export async function Sidebar() {
  const user = await getCurrentUser();
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
      {user && (
        <div className="px-3 py-3 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-sm truncate">{user.name}</div>
              <div className="text-[11px] text-white/50">{ROLE_LABEL[user.role] ?? user.role}</div>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="mt-1 w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </form>
        </div>
      )}
      <div className="px-5 py-3 border-t border-white/10 text-[11px] text-white/40">
        v0.1 · Node.js build
      </div>
    </aside>
  );
}
