import React from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import DataCloud from "./DataCloud";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload, BookOpen, MessageSquare, BarChart3,
  GitBranch, Download, LayoutDashboard, Settings
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";

const navGroups = [
  {
    title: "OVERVIEW",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/summary", label: "Summary", icon: BarChart3 },
      { to: "/lineage", label: "Lineage", icon: GitBranch },
    ]
  },
  {
    title: "DATA MANAGEMENT",
    items: [
      { to: "/upload", label: "Upload", icon: Upload },
      { to: "/dictionary", label: "Dictionary", icon: BookOpen },
      { to: "/export", label: "Export", icon: Download },
    ]
  },
  {
    title: "INTELLIGENCE",
    items: [
      { to: "/ask", label: "Ask AI", icon: MessageSquare },
    ]
  }
];

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  


  return (
    <div className="flex w-screen h-screen overflow-hidden bg-transparent text-foreground">
      <DataCloud density={70} />

      {/* Sidebar */}
      <aside className="w-64 h-full flex-shrink-0 border-r glass-panel backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-20 hidden md:flex flex-col px-4 py-6">
        <div className="flex items-center justify-between mb-8 px-2">
          <Link to="/" className="flex items-center">
            <BrandLogo />
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">SchemaSense</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-6 w-full overflow-y-auto pb-4 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="flex flex-col w-full">
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-4">
                {group.title}
              </h3>
              <div className="flex flex-col gap-1 w-full">
                {group.items.map(({ to, label, icon: Icon }) => {
                  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`group relative flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? "border border-primary/20 bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]"
                          : "border border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-[18px] w-[18px]" />
                        <span className="font-medium">{label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2.5">
          <Link
            to="/settings"
            className={`group relative flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              pathname.startsWith("/settings")
                ? "border border-primary/20 bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]"
                : "border border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className="h-[18px] w-[18px]" />
              <span className="font-medium">Settings</span>
            </div>
          </Link>

          <div className="rounded-xl border glass-panel-heavy p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 animate-pulse-dot rounded-full bg-primary glow-lime" />
              Engine online
            </div>
            <div className="mt-1 font-mono-tight text-[11px] text-muted-foreground/80">
              v0.42 · region us-east
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 h-full overflow-y-auto relative z-10 bg-transparent flex flex-col">
        

        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border/60 bg-background/60 px-4 py-3 backdrop-blur md:hidden mb-8">
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
            className="w-full max-w-[1600px] mx-auto px-8 pt-8 pb-24"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}