import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "motion/react";
import { Check, Loader2, BarChart2, Brain, Cpu, Database, Network, Layers } from "lucide-react";

interface MetadataGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface Stage {
  label: string;
  desc: string;
  icon: any;
}

const STAGES: Stage[] = [
  { label: "Profiling Dataset", desc: "Reading records, null ratios, and key densities...", icon: Database },
  { label: "Detecting Column Types", desc: "Analyzing characters, bounds, and string structures...", icon: Cpu },
  { label: "Generating Semantic Metadata", desc: "Synthesizing AI definitions and usage context...", icon: Brain },
  { label: "Identifying Lineage & Relations", desc: "Correlating column names and potential foreign keys...", icon: Network },
  { label: "Calculating Confidence Scores", desc: "Running validation rules and accuracy scores...", icon: BarChart2 },
];

export function MetadataGenerationModal({ isOpen, onClose, onComplete }: MetadataGenerationModalProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(0);
      setProgress(0);
      return;
    }

    // Step-by-step progress simulation
    const intervalTime = 700; // time per stage in ms
    const totalSteps = STAGES.length;

    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        const next = prev + 1;
        if (next >= totalSteps) {
          clearInterval(timer);
          setProgress(100);
          // Wait briefly at 100% for satisfying feedback
          setTimeout(() => {
            onComplete();
          }, 600);
          return totalSteps;
        }
        setProgress(Math.round((next / totalSteps) * 100));
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, onComplete]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md border-border/40 bg-background/95 backdrop-blur shadow-2xl rounded-2xl p-6">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <Layers className="h-5 w-5 text-primary" />
            Schema Catalog Profiler
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Analyzing schema columns and compiling interactive dictionary documentation.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono-tight text-muted-foreground uppercase tracking-wider">
            <span>Overall Analysis Progress</span>
            <span className="font-bold text-foreground">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-border/40 overflow-hidden relative">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
              className="h-full rounded-full bg-primary glow-lime shadow-[0_0_8px_rgba(242,120,92,0.4)]"
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="mt-6 space-y-4">
          {STAGES.map((stage, index) => {
            const isCompleted = currentStage > index;
            const isActive = currentStage === index;
            const Icon = stage.icon;

            return (
              <div
                key={index}
                className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? "bg-primary/5 border-primary/20 shadow-sm"
                    : isCompleted
                    ? "bg-secondary/20 border-transparent opacity-80"
                    : "border-transparent opacity-40"
                }`}
              >
                {/* Stage status indicator icon */}
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : isActive ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted border border-border text-muted-foreground">
                      <Icon className="h-3 w-3" />
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h4
                    className={`text-xs font-bold leading-none ${
                      isActive ? "text-foreground" : isCompleted ? "text-muted-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {stage.label}
                  </h4>
                  <p className="mt-1 text-[10px] text-muted-foreground/85 leading-relaxed truncate max-w-[320px]">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
