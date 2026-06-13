import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Database, CheckCircle2, UploadCloud } from "lucide-react";
import { S as SectionTitle, G as GlassCard, P as Pill } from "./ui-bits-DiJjH9oN.js";
const defaultColumns = [{
  name: "cust_id",
  type: "uuid",
  null: "0%"
}, {
  name: "email",
  type: "string",
  null: "2.1%"
}, {
  name: "signup_ts",
  type: "timestamp",
  null: "0%"
}, {
  name: "country",
  type: "string",
  null: "0.4%"
}, {
  name: "revenue_usd",
  type: "decimal(12,2)",
  null: "8.7%"
}, {
  name: "is_active",
  type: "boolean",
  null: "0%"
}, {
  name: "plan_tier",
  type: "enum",
  null: "0%"
}, {
  name: "last_login",
  type: "timestamp",
  null: "12.3%"
}];
function UploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [columns, setColumns] = useState(defaultColumns);
  useEffect(() => {
    localStorage.setItem("schema_sense_cols", JSON.stringify(columns));
  }, [columns]);
  const handleUpload = (file) => {
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          let newCols = [];
          if (file.name.endsWith(".csv")) {
            const firstLine = text.split("\n")[0];
            const headers = firstLine.split(",").map((h) => h.trim().replace(/^"|"$/g, "")).filter((h) => h);
            newCols = headers.map((h) => ({
              name: h,
              type: "string",
              null: "0%"
            }));
          } else if (file.name.endsWith(".json")) {
            const json = JSON.parse(text);
            const firstItem = Array.isArray(json) ? json[0] : json;
            if (firstItem && typeof firstItem === "object") {
              newCols = Object.keys(firstItem).map((k) => ({
                name: k,
                type: typeof firstItem[k],
                null: "0%"
              }));
            }
          } else {
            newCols = [{
              name: "id",
              type: "uuid",
              null: "0%"
            }, {
              name: "data",
              type: "string",
              null: "0%"
            }, {
              name: "created_at",
              type: "timestamp",
              null: "0%"
            }];
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
      if (file.name.endsWith(".csv")) {
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
    }, 3e3);
  };
  const onFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
      e.target.value = "";
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { kicker: "Step 01 / Upload", title: /* @__PURE__ */ jsxs(Fragment, { children: [
      "Drop your dataset to ",
      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "begin" }),
      "."
    ] }), sub: "CSV, Parquet, JSON, or a live warehouse connection. SchemaSense profiles the structure on contact." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[1.2fr_1fr]", children: [
      /* @__PURE__ */ jsx(GlassCard, { className: `relative overflow-hidden p-10 transition-colors ${dragOver ? "border-primary/60 bg-primary/5" : ""}`, children: isProcessing ? /* @__PURE__ */ jsxs("div", { className: "flex min-h-[340px] flex-col items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/5 p-8 text-center relative overflow-hidden", children: [
        /* @__PURE__ */ jsx(motion.div, { className: "absolute top-0 left-0 h-1 bg-primary shadow-[0_0_10px_rgba(242,120,92,0.8)]", initial: {
          width: "0%"
        }, animate: {
          width: "100%"
        }, transition: {
          duration: 2.9,
          ease: "linear"
        } }),
        /* @__PURE__ */ jsxs("div", { className: "relative mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse" }),
          /* @__PURE__ */ jsx(motion.div, { animate: {
            rotate: 360
          }, transition: {
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }, className: "relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-primary/50 bg-primary/10", children: /* @__PURE__ */ jsx(motion.div, { animate: {
            rotate: -360
          }, transition: {
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }, children: /* @__PURE__ */ jsx(Database, { className: "h-8 w-8 text-primary animate-pulse" }) }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-display text-xl font-bold tracking-tight", children: "Profiling Schema" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm text-muted-foreground", children: selectedFile ? `Reading ${selectedFile.name}...` : "Reading 2.4M rows..." }),
        /* @__PURE__ */ jsxs("div", { className: "w-full max-w-xs mt-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-mono-tight mb-2", children: [
            /* @__PURE__ */ jsx("span", { children: "Inferring Data Types" }),
            /* @__PURE__ */ jsx(motion.span, { initial: {
              opacity: 0
            }, animate: {
              opacity: 1
            }, transition: {
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse"
            }, children: "Processing" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-border/50", children: /* @__PURE__ */ jsx(motion.div, { className: "h-full bg-primary glow-lime", initial: {
            width: "0%"
          }, animate: {
            width: "100%"
          }, transition: {
            duration: 2.8,
            ease: "circOut"
          } }) })
        ] })
      ] }) : started ? /* @__PURE__ */ jsxs("div", { className: "flex min-h-[340px] flex-col items-center justify-center rounded-xl border-2 border-primary/40 bg-primary/5 p-8 text-center", children: [
        /* @__PURE__ */ jsx(motion.div, { initial: {
          scale: 0.8,
          opacity: 0
        }, animate: {
          scale: 1,
          opacity: 1
        }, transition: {
          type: "spring",
          stiffness: 200,
          damping: 20
        }, children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-16 w-16 text-primary mb-4 mx-auto drop-shadow-[0_0_15px_rgba(242,120,92,0.6)]" }) }),
        /* @__PURE__ */ jsx("div", { className: "font-display text-2xl font-semibold", children: "Profiling Complete" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 text-sm text-muted-foreground", children: [
          selectedFile ? selectedFile.name : "Dataset",
          " has been successfully ingested and profiled."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex gap-3", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => {
            setStarted(false);
            setSelectedFile(null);
          }, className: "rounded-full border border-border/60 bg-secondary/40 px-5 py-2.5 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors", children: "Upload Another" }),
          /* @__PURE__ */ jsx("a", { href: "/summary", className: "rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-lime transition-transform hover:scale-[1.02]", children: "View Summary" })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { onDragOver: (e) => {
        e.preventDefault();
        setDragOver(true);
      }, onDragLeave: () => setDragOver(false), onDrop: (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleUpload(e.dataTransfer.files[0]);
        }
      }, onClick: () => document.getElementById("file-upload")?.click(), className: "flex min-h-[340px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/70 p-8 text-center hover:border-primary/40 transition-colors", children: [
        /* @__PURE__ */ jsx("input", { type: "file", id: "file-upload", className: "hidden", accept: ".csv,.parquet,.json,.xlsx", onChange: onFileInput }),
        /* @__PURE__ */ jsxs(motion.div, { initial: {
          y: -8,
          opacity: 0
        }, animate: {
          y: [0, -8, 0],
          opacity: 1
        }, transition: {
          y: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          },
          opacity: {
            duration: 0.6
          }
        }, className: "relative mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-full bg-primary/30 blur-2xl" }),
          /* @__PURE__ */ jsx("div", { className: "relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10", children: /* @__PURE__ */ jsx(UploadCloud, { className: "h-10 w-10 text-primary" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-display text-2xl font-semibold", children: "Drag & drop a file" }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm text-muted-foreground", children: "or click to browse · max 5 GB" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
          /* @__PURE__ */ jsx(Pill, { tone: "muted", children: ".csv" }),
          /* @__PURE__ */ jsx(Pill, { tone: "muted", children: ".parquet" }),
          /* @__PURE__ */ jsx(Pill, { tone: "muted", children: ".json" }),
          /* @__PURE__ */ jsx(Pill, { tone: "muted", children: ".xlsx" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(GlassCard, { className: "p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("div", { className: "font-mono-tight text-[11px] uppercase tracking-[0.2em] text-muted-foreground", children: "Detected columns" }),
          /* @__PURE__ */ jsx(Pill, { tone: isProcessing ? "lime" : started ? "lime" : "muted", children: isProcessing ? "Scanning..." : started ? "Complete" : "Idle" })
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "mt-4 divide-y divide-border/60", children: columns.map((c, i) => /* @__PURE__ */ jsxs(motion.li, { initial: {
          opacity: 0,
          x: -10
        }, animate: started ? {
          opacity: 1,
          x: 0
        } : {
          opacity: 0.25,
          x: -10
        }, transition: {
          delay: started ? i * 0.12 : 0,
          duration: 0.4
        }, className: "flex items-center justify-between py-2.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono-tight text-sm", children: c.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono-tight", children: c.type }),
            /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: c.null })
          ] })
        ] }, c.name)) })
      ] })
    ] })
  ] });
}
export {
  UploadPage as component
};
