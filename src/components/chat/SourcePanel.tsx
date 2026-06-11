import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Book, ChevronDown, ChevronUp, Link2 } from "lucide-react";

interface SourcePanelProps {
  sources: string[];
}

export function SourcePanel({ sources }: SourcePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3.5 border-t border-border/30 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 font-mono-tight text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
      >
        <Book className="h-3.5 w-3.5" />
        <span>Sources Used ({sources.length})</span>
        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {isExpanded && (
        <div className="mt-2.5 flex flex-wrap gap-2 animate-in fade-in-0 duration-200">
          {sources.map((src, i) => {
            const isTable = !src.includes(".");
            const destination = isTable ? `/lineage` : `/dictionary`;
            
            return (
              <Link
                key={i}
                to={destination}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/50 hover:bg-primary/5 hover:border-primary/20 px-2.5 py-1 font-mono-tight text-[10px] text-foreground/80 hover:text-primary transition-all shadow-sm"
              >
                <Link2 className="h-3 w-3" />
                {src}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
