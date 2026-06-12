import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { UploadCloud, FileSpreadsheet, Database, CheckCircle2 } from "lucide-react";
import { SectionTitle, Pill, GlassCard } from "@/components/ui-bits";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload · SchemaSense" },
      { name: "description", content: "Drag and drop your dataset to begin schema analysis." },
    ],
  }),
  component: UploadPage,
});

const defaultColumns = [
  { name: "cust_id", type: "uuid", null: "0%" },
  { name: "email", type: "string", null: "2.1%" },
  { name: "signup_ts", type: "timestamp", null: "0%" },
  { name: "country", type: "string", null: "0.4%" },
  { name: "revenue_usd", type: "decimal(12,2)", null: "8.7%" },
  { name: "is_active", type: "boolean", null: "0%" },
  { name: "plan_tier", type: "enum", null: "0%" },
  { name: "last_login", type: "timestamp", null: "12.3%" },
];

function UploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [columns, setColumns] = useState(defaultColumns);

  useEffect(() => {
    localStorage.setItem("schema_sense_cols", JSON.stringify(columns));
  }, [columns]);

  const handleUpload = (file?: File) => {
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          let newCols: {name: string, type: string, null: string}[] = [];
          if (file.name.endsWith('.csv')) {
            const firstLine = text.split('\n')[0];
            const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, '')).filter(h => h);
            newCols = headers.map(h => ({ name: h, type: "string", null: "0%" }));
          } else if (file.name.endsWith('.json')) {
            const json = JSON.parse(text);
            const firstItem = Array.isArray(json) ? json[0] : json;
            if (firstItem && typeof firstItem === 'object') {
              newCols = Object.keys(firstItem).map(k => ({ name: k, type: typeof firstItem[k], null: "0%" }));
            }
          } else {
             newCols = [
               { name: "id", type: "uuid", null: "0%" },
               { name: "data", type: "string", null: "0%" },
               { name: "created_at", type: "timestamp", null: "0%" }
             ];
          }
          if (newCols.length > 0) {
            setColumns(newCols.slice(0, 8));
          } else {
            setColumns(defaultColumns);
          }
        } catch (err) {
          setColumns(defaultColumns);
        }
      };
      if (file.name.endsWith('.csv')) {
         reader.readAsText(file.slice(0, 1024 * 64));
      } else if (file.size < 5 * 1024 * 1024) {
         reader.readAsText(file);
      } else {
         setColumns(defaultColumns);
      }
    } else {
      setSelectedFile(null);
      setColumns(defaultColumns);
    }
    
    setIsProcessing(true);
    setStarted(false);
    setTimeout(() => {
      setIsProcessing(false);
      setStarted(true);
    }, 3000);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
      e.target.value = "";
    }
  };

  return (
    <div>
      <SectionTitle
        kicker="Step 01 / Upload"
        title={<>Drop your dataset to <span className="text-primary">begin</span>.</>}
        sub="CSV, Parquet, JSON, or a live warehouse connection. SchemaSense profiles the structure on contact."
      />

      <div className="max-w-3xl mx-auto w-full">
        <GlassCard
          className={`relative overflow-hidden p-10 transition-colors ${
            dragOver ? "border-primary/60 bg-primary/5" : ""
          }`}
        >
          {isProcessing ? (
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/5 p-8 text-center relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-1 bg-primary shadow-[0_0_10px_rgba(242,120,92,0.8)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.9, ease: "linear" }}
              />
              
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-primary/50 bg-primary/10"
                >
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                    <Database className="h-8 w-8 text-primary animate-pulse" />
                  </motion.div>
                </motion.div>
              </div>
              
              <div className="font-display text-xl font-bold tracking-tight">Profiling Schema</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {selectedFile ? `Reading ${selectedFile.name}...` : "Reading 2.4M rows..."}
              </div>
              
              <div className="w-full max-w-xs mt-8">
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-mono-tight mb-2">
                  <span>Inferring Data Types</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  >
                    Processing
                  </motion.span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/50">
                  <motion.div 
                    className="h-full bg-primary glow-lime" 
                    initial={{ width: "0%" }} 
                    animate={{ width: "100%" }} 
                    transition={{ duration: 2.8, ease: "circOut" }} 
                  />
                </div>
              </div>
            </div>
          ) : started ? (
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border-2 border-primary/40 bg-primary/5 p-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <CheckCircle2 className="h-16 w-16 text-primary mb-4 mx-auto drop-shadow-[0_0_15px_rgba(242,120,92,0.6)]" />
              </motion.div>
              <div className="font-display text-2xl font-semibold">Profiling Complete</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {selectedFile ? selectedFile.name : "Dataset"} has been successfully ingested and profiled.
              </div>
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => { setStarted(false); setSelectedFile(null); }}
                  className="rounded-full border border-border/60 bg-secondary/40 px-5 py-2.5 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
                >
                  Upload Another
                </button>
                <a 
                  href="/summary" 
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-lime transition-transform hover:scale-[1.02]"
                >
                  View Summary
                </a>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { 
                e.preventDefault(); 
                setDragOver(false); 
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleUpload(e.dataTransfer.files[0]); 
                }
              }}
              onClick={() => document.getElementById("file-upload")?.click()}
              className="flex min-h-[340px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/70 p-8 text-center hover:border-primary/40 transition-colors"
            >
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".csv,.parquet,.json,.xlsx"
                onChange={onFileInput}
              />
              <motion.div
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: [0, -8, 0], opacity: 1 }}
                transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.6 } }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10">
                  <UploadCloud className="h-10 w-10 text-primary" />
                </div>
              </motion.div>
              <div className="font-display text-2xl font-semibold">Drag & drop a file</div>
              <div className="mt-2 text-sm text-muted-foreground">or click to browse · max 5 GB</div>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Pill tone="muted">.csv</Pill>
                <Pill tone="muted">.parquet</Pill>
                <Pill tone="muted">.json</Pill>
                <Pill tone="muted">.xlsx</Pill>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}