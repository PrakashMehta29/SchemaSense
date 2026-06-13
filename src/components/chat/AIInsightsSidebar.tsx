import React from "react";
import { Lightbulb, ShieldAlert, AlertTriangle, Network, CheckCircle } from "lucide-react";
import { MOCK_INSIGHTS, AIInsightCard } from "@/lib/mockConversationData";

interface AIInsightsSidebarProps {
  onSelectPrompt?: (prompt: string) => void;
}

export function AIInsightsSidebar({ onSelectPrompt }: AIInsightsSidebarProps) {
  const getSeverityStyle = (severity: AIInsightCard["severity"]) => {
    switch (severity) {
      case "critical":
        return {
          border: "border-red-500/20 bg-red-500/5",
          badge: "border-red-500/30 bg-red-500/10 text-red-500",
          icon: ShieldAlert,
        };
      case "high":
        return {
          border: "border-orange-500/20 bg-orange-500/5",
          badge: "border-orange-500/30 bg-orange-500/10 text-orange-500",
          icon: AlertTriangle,
        };
      case "medium":
        return {
          border: "border-amber-500/20 bg-amber-500/5",
          badge: "border-amber-500/30 bg-amber-500/10 text-amber-500",
          icon: Network,
        };
      default:
        return {
          border: "border-emerald-500/20 bg-emerald-500/5",
          badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
          icon: CheckCircle,
        };
    }
  };

  return (
    <aside className="w-72 h-full flex-shrink-0 border-l border-border/40 bg-secondary/10 flex flex-col p-4">
      {/* Title */}
      <div className="flex items-center gap-2 text-[10px] font-mono-tight text-muted-foreground uppercase tracking-widest px-2 mb-4">
        <Lightbulb className="h-4 w-4 text-primary" />
        <span>Suggested Insights</span>
      </div>

      {/* Insights lists */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
        {MOCK_INSIGHTS.map((ins) => {
          const { border, badge, icon: Icon } = getSeverityStyle(ins.severity);

          return (
            <div
              key={ins.id}
              onClick={() => {
                if (onSelectPrompt) {
                  onSelectPrompt(`Explain the insight: "${ins.title}"`);
                }
              }}
              className={`rounded-xl border p-3.5 space-y-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${border}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono-tight text-[9px] uppercase font-bold shrink-0 ${badge}`}
                >
                  <Icon className="h-3 w-3" />
                  {ins.severity}
                </span>
                {ins.metric && (
                  <span className="font-mono-tight text-[10px] text-muted-foreground font-semibold">
                    {ins.metric}
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-foreground leading-tight">{ins.title}</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{ins.description}</p>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
