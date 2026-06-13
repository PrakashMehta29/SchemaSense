import React, { useState } from "react";
import { Database, Loader2, CheckCircle, Flame, ShieldCheck, Unlink } from "lucide-react";
import { ConnectionDialog } from "./ConnectionDialog";

interface ConnectionCardProps {
  name: string;
  status: "Connected" | "Disconnected" | "Coming Soon";
  host?: string;
  port?: number;
  dbName?: string;
  username?: string;
  onToggle: (
    name: string,
    newStatus: "Connected" | "Disconnected",
    config?: { host: string; port: number; dbName: string; username: string },
  ) => void;
}

export function ConnectionCard({
  name,
  status,
  host,
  port,
  dbName,
  username,
  onToggle,
}: ConnectionCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleActionClick = () => {
    if (status === "Coming Soon") return;

    if (status === "Connected") {
      setIsDisconnecting(true);
      setTimeout(() => {
        setIsDisconnecting(false);
        onToggle(name, "Disconnected");
      }, 1000);
      return;
    }

    // Open connection dialogue
    setIsDialogOpen(true);
  };

  const handleConnectSuccess = (config: {
    host: string;
    port: number;
    dbName: string;
    username: string;
  }) => {
    onToggle(name, "Connected", config);
  };

  const getStatusBadge = () => {
    if (status === "Coming Soon") {
      return (
        <span className="rounded border border-border bg-secondary/80 px-2 py-0.5 font-mono-tight text-[8px] uppercase tracking-widest text-muted-foreground select-none">
          Coming Soon
        </span>
      );
    }
    if (status === "Connected") {
      return (
        <span className="flex items-center gap-1.2 rounded border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5 px-2 py-0.5 font-mono-tight text-[8px] uppercase tracking-widest text-emerald-500 font-bold select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot shrink-0" />
          Connected
        </span>
      );
    }
    return (
      <span className="rounded border border-red-500/15 bg-red-500/10 px-2 py-0.5 font-mono-tight text-[8px] uppercase tracking-widest text-rose-500 font-bold select-none animate-pulse">
        Disconnected
      </span>
    );
  };

  return (
    <>
      <div className="border border-border/40 bg-background/20 p-5 rounded-2xl flex flex-col justify-between min-h-[135px] select-none transition-all hover:border-primary/15 relative overflow-hidden group">
        {/* Background visual gloss bubble */}
        <div className="absolute top-0 right-0 h-12 w-12 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors pointer-events-none" />

        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Database
              className={`h-4.5 w-4.5 transition-colors shrink-0 ${status === "Connected" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
            />
            <span className="font-bold text-xs text-foreground block">{name}</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Detailed configuration subtext under connection state */}
        <div className="mt-2 text-[9px] text-muted-foreground leading-relaxed flex-1 flex flex-col justify-center">
          {status === "Connected" ? (
            <div className="font-mono text-zinc-400 space-y-0.5 bg-primary/[0.02] border border-primary/5 rounded-lg p-2.5">
              <div className="flex justify-between">
                <span>HOST:</span>
                <span className="text-zinc-200 font-semibold truncate max-w-[120px]">{host}</span>
              </div>
              <div className="flex justify-between">
                <span>DB:</span>
                <span className="text-zinc-200 font-semibold">{dbName}</span>
              </div>
              <div className="flex justify-between">
                <span>USER:</span>
                <span className="text-zinc-200 font-semibold">{username}</span>
              </div>
            </div>
          ) : (
            <p className="py-2">
              {status === "Coming Soon"
                ? "Warehouse connection pending release."
                : "Configure secure real-time metadata syncing with zero latency."}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/10 pt-3">
          <span className="text-[8px] uppercase font-mono-tight tracking-widest text-muted-foreground flex items-center gap-1">
            {status === "Connected" ? (
              <>
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>SSL Link Active</span>
              </>
            ) : status === "Coming Soon" ? (
              <span>STAGED</span>
            ) : (
              <span>PORT READY</span>
            )}
          </span>

          {status !== "Coming Soon" && (
            <button
              onClick={handleActionClick}
              disabled={isDisconnecting}
              className={`rounded-lg border px-3 py-1.5 text-[9px] font-mono-tight uppercase font-semibold transition-all cursor-pointer ${
                status === "Connected"
                  ? "border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  : "border-primary/25 bg-primary/10 text-primary hover:bg-primary/20 shadow-sm"
              }`}
            >
              {isDisconnecting ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  <span>Unlinking</span>
                </span>
              ) : status === "Connected" ? (
                "Disconnect"
              ) : (
                "Connect"
              )}
            </button>
          )}
        </div>
      </div>

      <ConnectionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        databaseName={name}
        onConnectSuccess={handleConnectSuccess}
      />
    </>
  );
}
