import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, FileText, Network, Shield, BarChart3, MessageSquare, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CommandItem {
  id: string;
  label: string;
  category: "Pages" | "Columns" | "Actions";
  route: string;
  icon: any;
}

const COMMANDS: CommandItem[] = [
  // Pages
  { id: "p-chat", label: "Ask Your Data AI Chat", category: "Pages", route: "/chat", icon: MessageSquare },
  { id: "p-dict", label: "Browse Data Dictionary Catalog", category: "Pages", route: "/dictionary", icon: FileText },
  { id: "p-lineage", label: "View Observability Data Lineage", category: "Pages", route: "/lineage", icon: Network },
  { id: "p-quality", label: "View Data Quality Metrics", category: "Pages", route: "/quality", icon: BarChart3 },
  { id: "p-gov", label: "Browse Data Governance Center", category: "Pages", route: "/governance", icon: Shield },
  { id: "p-exec", label: "Open Executive Dashboard", category: "Pages", route: "/executive", icon: Shield },
  
  // Columns
  { id: "c-cust", label: "customer_id · uuid key", category: "Columns", route: "/dictionary", icon: FileText },
  { id: "c-email", label: "email · contact string", category: "Columns", route: "/dictionary", icon: FileText },
  { id: "c-rev", label: "revenue_usd · financial decimal", category: "Columns", route: "/dictionary", icon: FileText },
  { id: "c-country", label: "country · regional string", category: "Columns", route: "/dictionary", icon: FileText },
  { id: "c-plan", label: "plan_tier · subscription enum", category: "Columns", route: "/dictionary", icon: FileText },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const handleSelect = (item: CommandItem) => {
    navigate({ to: item.route });
    setIsOpen(false);
    setQuery("");
  };

  const filtered = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Reset activeIndex when query or open state changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  // Listen for Ctrl+K, Escape, Arrows, Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }

      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[activeIndex]) {
          handleSelect(filtered[activeIndex]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, activeIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Search container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/40 bg-background/95 shadow-2xl backdrop-blur flex flex-col z-10"
          >
            {/* Search Input bar */}
            <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3.5">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search catalog, schemas, or pages..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 text-foreground"
                autoFocus
              />
              <span className="rounded border border-border bg-secondary/50 px-1.5 py-0.5 text-[9px] font-mono-tight text-muted-foreground select-none shrink-0 shadow-sm">
                ESC
              </span>
            </div>

            {/* Suggestions list */}
            <div className="max-h-[300px] overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground font-sans">
                  No matching assets or pages found.
                </div>
              ) : (
                ["Pages", "Columns"].map((category) => {
                  const items = filtered.filter((cmd) => cmd.category === category);
                  if (items.length === 0) return null;

                  return (
                    <div key={category} className="space-y-1">
                      <h4 className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest px-2.5 mb-1.5">
                        {category}
                      </h4>
                      {items.map((item) => {
                        const Icon = item.icon;
                        const itemIdx = filtered.indexOf(item);
                        const isActive = itemIdx === activeIndex;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer group border ${
                              isActive
                                ? "bg-primary/10 text-primary border-primary/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.03)]"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                            }`}
                          >
                            <Icon className={`h-4 w-4 shrink-0 transition-colors ${
                              isActive ? "text-primary" : "text-muted-foreground/80 group-hover:text-primary"
                            }`} />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer shortcuts */}
            <div className="border-t border-border/20 px-4 py-2.5 bg-secondary/20 flex items-center justify-between text-[10px] font-mono-tight text-muted-foreground select-none">
              <div className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5" />
                <span>Command menu active</span>
              </div>
              <div className="flex gap-3">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
