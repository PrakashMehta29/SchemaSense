import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "../ui-bits";

interface UploadProgressProps {
  fileName: string;
  onComplete: () => void;
}

interface IngestionStep {
  id: number;
  label: string;
}

const STEPS: IngestionStep[] = [
  { id: 1, label: "Uploading Dataset" },
  { id: 2, label: "Profiling Columns" },
  { id: 3, label: "Detecting Data Types" },
  { id: 4, label: "Generating Metadata" },
  { id: 5, label: "Building Relationships" },
  { id: 6, label: "Preparing AI Context" },
];

export function UploadProgress({ fileName, onComplete }: UploadProgressProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Increment progress percentage smoothly
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2.5; // Ticks up to 100% over ~4 seconds
        return next >= 100 ? 100 : next;
      });
    }, 100);

    // Resolve steps sequentially based on progress
    const stepsInterval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        const next = prev + 1;
        if (next >= STEPS.length) {
          clearInterval(stepsInterval);
          return STEPS.length; // All done
        }
        return next;
      });
    }, 650);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepsInterval);
    };
  }, []);

  // Trigger completion callback when progress hits 100% and steps are resolved
  useEffect(() => {
    if (progress === 100 && currentStepIdx === STEPS.length) {
      const delay = setTimeout(() => {
        onComplete();
      }, 800); // Small pause for the checkmark wow-effect
      return () => clearTimeout(delay);
    }
  }, [progress, currentStepIdx, onComplete]);

  return (
    <GlassCard className="p-8 border-primary/20 bg-primary/5 shadow-[0_8px_30px_rgba(242,120,92,0.06)] relative overflow-hidden">
      {/* Vercel-like top glowing line */}
      <motion.div
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-lime shadow-[0_0_10px_rgba(242,120,92,0.8)]"
        style={{ width: `${progress}%` }}
      />

      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="space-y-1">
          <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
            Ingesting {fileName}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Deploying schema profile to intelligence engine...
          </p>
        </div>

        {/* 6-step checklist */}
        <div className="w-full max-w-sm border border-border/40 bg-background/50 rounded-2xl p-5 text-left space-y-3 shadow-inner">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIdx;
            const isRunning = idx === currentStepIdx && progress < 100;
            const isPending = idx > currentStepIdx;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between text-xs transition-all duration-300 ${
                  isDone
                    ? "text-emerald-500 font-medium"
                    : isRunning
                    ? "text-primary font-bold"
                    : "text-muted-foreground/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  ) : isRunning ? (
                    <Loader2 className="h-4.5 w-4.5 text-primary animate-spin shrink-0" />
                  ) : (
                    <div className="h-4.5 w-4.5 rounded-full border border-border bg-secondary/20 shrink-0 flex items-center justify-center text-[9px] font-bold">
                      {step.id}
                    </div>
                  )}
                  <span>{step.label}</span>
                </div>

                <span className="text-[9px] font-mono-tight uppercase tracking-wider">
                  {isDone ? "Done" : isRunning ? "Running" : "Queue"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom progress bar & numeric status */}
        <div className="w-full max-w-sm space-y-2">
          <div className="flex justify-between font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Progress</span>
            <span className="font-bold text-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-primary glow-lime transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
