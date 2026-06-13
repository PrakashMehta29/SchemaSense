import React, { useState } from "react";
import { Database, Loader2, CheckCircle2, AlertCircle, Link } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ConnectionCardProps {
  name: string;
  defaultStatus: "Coming Soon" | "Mock Connected" | "Disconnected";
}

export function ConnectionCard({ name, defaultStatus }: ConnectionCardProps) {
  const [status, setStatus] = useState(defaultStatus);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (status === "Coming Soon" || isConnecting) return;

    if (status === "Mock Connected") {
      // Toggle disconnect
      setStatus("Disconnected");
      return;
    }

    // Simulate connection loader
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setStatus("Mock Connected");
    }, 1500);
  };

  const getStatusBadge = () => {
    if (status === "Coming Soon") {
      return (
        <span className="rounded border border-border bg-secondary/80 px-2 py-0.5 font-mono-tight text-[8px] uppercase tracking-widest text-muted-foreground select-none">
          Coming Soon
        </span>
      );
    }
    if (status === "Mock Connected") {
      return (
        <span className="flex items-center gap-1.5 rounded border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5 px-2 py-0.5 font-mono-tight text-[8px] uppercase tracking-widest text-emerald-500 font-bold select-none">
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse-dot shrink-0" />
          Connected
        </span>
      );
    }
    return (
      <span className="rounded border border-red-500/20 bg-red-500/10 px-2 py-0.5 font-mono-tight text-[8px] uppercase tracking-widest text-red-500 font-bold select-none animate-pulse">
        Disconnected
      </span>
    );
  };

  return (
    <div className="border border-border/40 bg-background/20 p-5 rounded-2xl flex flex-col justify-between min-h-[110px] select-none transition-all hover:border-primary/15 relative overflow-hidden group">
      {/* Background visual detail */}
      <div className="absolute top-0 right-0 h-10 w-10 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors pointer-events-none" />

      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Database className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          <span className="font-bold text-xs text-foreground block">{name}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="text-[9px] text-muted-foreground leading-normal">
          {status === "Coming Soon" ? "Warehouse connection pending release." : "Mock relational schema provider."}
        </span>

        {status !== "Coming Soon" && (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`rounded-lg border px-3 py-1.5 text-[9px] font-mono-tight uppercase font-semibold transition-all cursor-pointer ${
              status === "Mock Connected"
                ? "border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                : "border-primary/25 bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            {isConnecting ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                <span>Checking</span>
              </span>
            ) : status === "Mock Connected" ? (
              "Disconnect"
            ) : (
              "Connect"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
