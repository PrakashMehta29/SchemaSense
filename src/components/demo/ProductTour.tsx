import React, { useState, useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, Play, X, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TourStep {
  title: string;
  desc: string;
  route: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "1. Upload Schema Ingestion",
    desc: "Ingest CSV, Parquet, or JSON files. The engine profiles the structures and null limits immediately.",
    route: "/data-sources",
  },
  {
    title: "2. Data Dictionary catalog",
    desc: "Examine detailed column classifications, database types, business meanings, and AI definitions.",
    route: "/dictionary",
  },
  {
    title: "3. Observatory Lineage Paths",
    desc: "Trace how ingested tables flow and convert downstream to final dashboards.",
    route: "/lineage",
  },
  {
    title: "4. Ask Your Data AI Chat",
    desc: "Query tables in natural language. Streams semantic responses with source attributions.",
    route: "/chat",
  },
  {
    title: "5. Compliance & Governance Center",
    desc: "Audit sensitive columns, review PII detection tags, and check security risk scores.",
    route: "/governance",
  },
  {
    title: "6. Executive Analytics summary",
    desc: "Corporate health scores, metadata coverage ratio, and recommendations.",
    route: "/executive",
  },
];

export function ProductTour() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleStart = () => {
    setActiveStep(0);
    navigate({ to: TOUR_STEPS[0].route });
  };

  const handleNext = () => {
    if (activeStep === null) return;
    const nextStep = activeStep + 1;
    if (nextStep < TOUR_STEPS.length) {
      setActiveStep(nextStep);
      navigate({ to: TOUR_STEPS[nextStep].route });
    } else {
      setActiveStep(null); // End Tour
    }
  };

  const handlePrev = () => {
    if (activeStep === null || activeStep === 0) return;
    const prevStep = activeStep - 1;
    setActiveStep(prevStep);
    navigate({ to: TOUR_STEPS[prevStep].route });
  };

  const handleSkip = () => {
    setActiveStep(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* ── Active Tour Popover ── */}
      <AnimatePresence>
        {activeStep !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            className="w-80 border border-primary/20 bg-background/95 shadow-2xl backdrop-blur rounded-2xl p-5 space-y-4 pointer-events-auto shadow-[0_12px_40px_rgba(242,120,92,0.1)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-tight text-primary uppercase tracking-wider">
                <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "12s" }} />
                <span>Demo Walkthrough Tour</span>
              </div>
              <button
                onClick={handleSkip}
                className="text-muted-foreground/60 hover:text-foreground p-0.5 rounded transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-foreground">
                {TOUR_STEPS[activeStep].title}
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {TOUR_STEPS[activeStep].desc}
              </p>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center justify-between pt-1 text-[10px] font-mono-tight border-t border-border/10">
              <span className="text-muted-foreground">
                Step {activeStep + 1} of {TOUR_STEPS.length}
              </span>

              <div className="flex gap-2">
                {activeStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1 border border-border bg-secondary/50 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-secondary transition-all cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" /> Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 font-semibold glow-lime transition-all hover:scale-[1.02] cursor-pointer"
                >
                  {activeStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}{" "}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Start Tour trigger button ── */}
      {activeStep === null && (
        <button
          onClick={handleStart}
          className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2.5 text-xs font-semibold shadow-lg backdrop-blur hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer pointer-events-auto"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          Start Guided Tour
        </button>
      )}
    </div>
  );
}
