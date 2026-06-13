import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, RefreshCw, FileText, Network, Check, ExternalLink } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface QuickActionsBarProps {
  text: string;
  hasLineageLink?: boolean;
  hasDictionaryLink?: boolean;
  onRegenerate?: () => void;
}

export function QuickActionsBar({
  text,
  hasLineageLink = true,
  hasDictionaryLink = true,
  onRegenerate,
}: QuickActionsBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 mt-3 border-t border-border/20 pt-2.5">
        {/* Copy Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg border border-transparent text-muted-foreground/75 hover:text-foreground hover:bg-secondary/60 hover:border-border/30 transition-all cursor-pointer"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="text-[10px] p-1.5 bg-background border text-foreground"
          >
            {copied ? "Copied!" : "Copy Response"}
          </TooltipContent>
        </Tooltip>

        {/* Regenerate Button */}
        {onRegenerate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg border border-transparent text-muted-foreground/75 hover:text-foreground hover:bg-secondary/60 hover:border-border/30 transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="text-[10px] p-1.5 bg-background border text-foreground"
            >
              Regenerate Answer
            </TooltipContent>
          </Tooltip>
        )}

        {/* Dictionary Link */}
        {hasDictionaryLink && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/dictionary"
                className="p-1.5 rounded-lg border border-transparent text-muted-foreground/75 hover:text-foreground hover:bg-secondary/60 hover:border-border/30 transition-all"
              >
                <FileText className="h-3.5 w-3.5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="text-[10px] p-1.5 bg-background border text-foreground"
            >
              Open Dictionary Catalog
            </TooltipContent>
          </Tooltip>
        )}

        {/* Lineage Link */}
        {hasLineageLink && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/lineage"
                className="p-1.5 rounded-lg border border-transparent text-muted-foreground/75 hover:text-foreground hover:bg-secondary/60 hover:border-border/30 transition-all"
              >
                <Network className="h-3.5 w-3.5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="text-[10px] p-1.5 bg-background border text-foreground"
            >
              View Lineage Observability Graph
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
