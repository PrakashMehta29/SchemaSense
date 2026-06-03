import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import DataCloud from "./DataCloud";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload, BookOpen, MessageSquare, BarChart3, AlertTriangle,
  GitBranch, Download, LayoutDashboard,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/dictionary", label: "Dictionary", icon: BookOpen },
  { to: "/ask", label: "Ask AI", icon: MessageSquare },
  { to: "/profiler", label: "Profiler", icon: BarChart3 },
  { to: "/anomalies", label: "Anomalies", icon: AlertTriangle },
  { to: "/lineage", label: "Lineage", icon: GitBranch },
  { to: "/export", label: "Export", icon: Download },
] as const;

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-transparent text-foreground">
      <DataCloud density={70} />

      {/* Sidebar */}
      <aside className="w-64 h-full flex-shrink-0 border-r border-white/[0.05] bg-[#090909]/80 backdrop-blur-md z-20 hidden md:flex flex-col px-4 py-6">
        <Link to="/" className="mb-8 flex items-center px-2">
          <BrandLogo />
          <span className="font-display text-2xl font-bold tracking-tight text-white">SchemaSense</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? "border border-primary/20 bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(204,255,0,0.05)]"
                    : "border border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-white/5 bg-[#0a0a0a]/40 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-primary glow-lime" />
            Engine online
          </div>
          <div className="mt-1 font-mono-tight text-[11px] text-muted-foreground/80">
            v0.42 · region us-east
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 h-full overflow-y-auto p-8 relative z-10 bg-transparent">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border/60 bg-background/60 px-4 py-3 backdrop-blur md:hidden mb-8 -mx-8 -mt-8">
          <Link to="/" className="flex items-center font-display text-base font-bold">
            <BrandLogo className="w-6 h-6 mr-2 shrink-0" />
            SchemaSense
          </Link>
          <span className="text-xs text-muted-foreground">v0.42</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}