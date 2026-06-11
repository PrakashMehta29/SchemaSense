import React from "react";
import { Check, Loader2, Cpu } from "lucide-react";
import { ThinkingStage } from "@/lib/chatService";

interface ThinkingStateProps {
  stages: ThinkingStage[];
}

export function ThinkingState({ stages }: ThinkingStateProps) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 max-w-sm space-y-3.5 shadow-[0_4px_16px_rgba(242,120,92,0.02)]">
      {/* Title */}
      <div className="flex items-center gap-2 font-mono-tight text-[10px] uppercase tracking-wider text-primary">
        <Cpu className="h-3.5 w-3.5" />
        <span>AI Retrieval Pipeline Active</span>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {stages.map((stage, i) => {
          const isCompleted = stage.status === "completed";
          const isThinking = stage.status === "thinking";

          return (
            <div
              key={i}
              className={`flex items-center gap-2.5 text-xs transition-opacity duration-300 ${
                stage.status !== "pending" ? "opacity-100" : "opacity-45"
              }`}
            >
              <div className="shrink-0">
                {isCompleted ? (
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_6px_rgba(16,185,129,0.3)]">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                ) : isThinking ? (
                  <Loader2 className="h-4.5 w-4.5 text-primary animate-spin" />
                ) : (
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-muted border border-border" />
                )}
              </div>
              <span className={`font-mono-tight ${isThinking ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
