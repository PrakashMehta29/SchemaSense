import React from "react";
import { MessageSquare, FileText, Network, ShieldAlert, Database, HelpCircle } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelect: (prompt: string) => void;
}

const PROMPTS = [
  {
    text: "What does customer_ltv mean?",
    desc: "Inspect customer lifetime value, customer cohort calculations, and definitions.",
    icon: FileText,
  },
  {
    text: "Which datasets contain PII?",
    desc: "Audit email addresses, contact details, and GDPR security restrictions.",
    icon: ShieldAlert,
  },
  {
    text: "Show table relationships.",
    desc: "Audit the visual lineage nodes mapping raw files to final downstream tables.",
    icon: Network,
  },
  {
    text: "Where does revenue_usd come from?",
    desc: "Trace transactional invoice columns downstream from merchant payment ledgers.",
    icon: Database,
  },
  {
    text: "Which columns are undocumented?",
    desc: "Identify schema catalog parameters lacking descriptions or AI generation.",
    icon: HelpCircle,
  },
];

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-center gap-2 text-[10px] font-mono-tight text-muted-foreground uppercase tracking-widest text-center">
        <MessageSquare className="h-3.5 w-3.5 text-primary" />
        <span>Ask questions about your data catalog</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {PROMPTS.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelect(p.text)}
              className="group text-left border border-border/50 bg-background/30 rounded-2xl p-4 transition-all hover:scale-[1.02] hover:border-primary/20 hover:bg-primary/5 active:scale-[0.98] shadow-sm flex items-start gap-3.5 cursor-pointer"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/5 text-primary transition-all group-hover:bg-primary/10">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {p.text}
                </h4>
                <p className="mt-1 text-[10px] text-muted-foreground/80 leading-relaxed font-sans font-normal">
                  {p.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
