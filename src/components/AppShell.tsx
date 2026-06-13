import React from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import DataCloud from "./DataCloud";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload, BookOpen, MessageSquare, BarChart3,
  Download, LayoutDashboard, Settings, Activity, Shield, Play, Database, Compass, Mic
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { CommandPalette } from "./search/CommandPalette";
import { ProductTour } from "./demo/ProductTour";
import { isDemoModeActive, enableDemoMode, disableDemoMode } from "../lib/demoModeService";
import { useWorkspace } from "../lib/WorkspaceContext";
import { GlobalContextBar } from "./GlobalContextBar";

const navItems = [
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/talkto-speech", label: "Talk to Speech", icon: Mic },
  { to: "/data-sources", label: "Data Sources", icon: Database },
  { to: "/dictionary", label: "Dictionary", icon: BookOpen },
  { to: "/quality", label: "Quality", icon: Activity },
  { to: "/governance", label: "Governance", icon: Shield },
  { to: "/executive", label: "Executive", icon: LayoutDashboard },
];

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [demoActive, setDemoActive] = React.useState(false);
  
  React.useEffect(() => {
    setDemoActive(isDemoModeActive());
  }, []);

  const { hasDataset } = useWorkspace();

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-transparent text-foreground">
      <DataCloud density={70} />

      {/* Global Search and Tour overlays */}
      <CommandPalette />
      <ProductTour />

      {/* Sidebar */}
      <aside className="w-64 h-full flex-shrink-0 border-r glass-panel backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-20 hidden md:flex flex-col px-4 py-6">
        <div className="flex items-center justify-between mb-8 px-2">
          <Link to="/" className="flex items-center">
            <BrandLogo />
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">SchemaSense</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-1 w-full overflow-y-auto pb-4 custom-scrollbar">
          {navItems.map(({ to, label, icon: Icon }) => {
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
        </nav>

        <div className="mt-auto flex flex-col gap-2.5">
          {/* Demo Mode Toggle Button */}
          <button
            onClick={demoActive ? disableDemoMode : enableDemoMode}
            className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-semibold border transition-all cursor-pointer ${
              demoActive
                ? "border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 animate-pulse"
            }`}
          >
            <div className="flex items-center gap-3">
              <Play className="h-[16px] w-[16px] shrink-0 fill-current" />
              <span>{demoActive ? "Exit Demo Workspace" : "Load Demo Workspace"}</span>
            </div>
          </button>

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
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 h-full overflow-y-auto relative z-10 bg-transparent flex flex-col">
        {/* Global Dataset Context Bar */}
        {pathname !== "/chat" && <GlobalContextBar />}

        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border/60 bg-background/60 px-4 py-3 backdrop-blur md:hidden mb-4">
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