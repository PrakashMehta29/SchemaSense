import React from "react";

export function MetadataSkeleton() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/30 p-5 animate-pulse space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
      {/* Header collapsed state */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="h-5 w-16 rounded-full bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 rounded-full bg-muted" />
          <div className="h-4 w-4 rounded bg-muted" />
        </div>
      </div>
      
      {/* Expanded content simulation (subtle line bars) */}
      <div className="border-t border-border/20 pt-4 space-y-4">
        {/* section 1 stats */}
        <div className="flex gap-4">
          <div className="h-5 w-20 rounded bg-muted/65" />
          <div className="h-5 w-24 rounded bg-muted/65" />
        </div>
        {/* section 2 AI description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-muted/50" />
            <div className="h-3 w-full rounded bg-muted/65" />
            <div className="h-3 w-4/5 rounded bg-muted/65" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-muted/50" />
            <div className="h-3 w-full rounded bg-muted/65" />
            <div className="h-3 w-3/4 rounded bg-muted/65" />
          </div>
        </div>
      </div>
    </div>
  );
}
