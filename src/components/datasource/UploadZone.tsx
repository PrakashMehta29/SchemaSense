import React, { useState, useRef } from "react";
import { UploadCloud, FolderOpen } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard, Pill } from "../ui-bits";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <GlassCard className="p-8 border-border/40 bg-card/30">
      <h3 className="font-mono-tight text-[10px] uppercase text-muted-foreground tracking-widest mb-4 flex items-center gap-1.5">
        <FolderOpen className="h-4 w-4 text-primary" />
        📂 Ingest Dataset
      </h3>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          dragOver
            ? "border-primary bg-primary/5 shadow-[0_0_25px_rgba(242,120,92,0.08)]"
            : "border-border/60 hover:border-primary/40 hover:bg-secondary/20"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv,.json,.xlsx,.xls"
          onChange={handleFileChange}
        />

        {/* Upload Icon with animated float */}
        <motion.div
          animate={dragOver ? { y: -12, scale: 1.1 } : { y: [0, -6, 0] }}
          transition={
            dragOver
              ? { type: "spring", stiffness: 300, damping: 15 }
              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
          className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/5 text-primary shadow-[0_4px_16px_rgba(242,120,92,0.05)]"
        >
          <UploadCloud className="h-7 w-7" />
        </motion.div>

        <div className="font-display text-lg font-bold text-foreground">Drag & drop your dataset here</div>
        <p className="mt-1 text-xs text-muted-foreground">Supported: CSV • XLSX • JSON</p>

        <button className="mt-5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary px-5 py-2.5 text-xs font-semibold transition-all">
          Browse Files
        </button>
      </div>
    </GlassCard>
  );
}
