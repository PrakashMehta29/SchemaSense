import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import { Database, Plus } from "lucide-react";
import { SectionTitle, GlassCard } from "@/components/ui-bits";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { EmptyDatasetState } from "@/components/datasource/EmptyDatasetState";
import { UploadZone } from "@/components/datasource/UploadZone";
import { UploadProgress } from "@/components/datasource/UploadProgress";
import { DatasetCard } from "@/components/datasource/DatasetCard";
import { ConnectionCard } from "@/components/datasource/ConnectionCard";

import { Dataset, getDatasets, switchDataset, enableDemoMode, CUSTOMERS_COLUMNS } from "@/lib/demoModeService";
import { useWorkspace } from "@/lib/WorkspaceContext";

export const Route = createFileRoute("/data-sources")({
  head: () => ({
    meta: [
      { title: "Connect Your Data · SchemaSense" },
      { name: "description", content: "Ingest datasets or connect enterprise data warehouses." },
    ],
  }),
  component: DataSourcesPage,
});

function DataSourcesPage() {
  const navigate = useNavigate();
  const { refreshWorkspace } = useWorkspace();
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetName, setActiveDatasetName] = useState("");
  
  // Upload workflow states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState("");
  const [activeFile, setActiveFile] = useState<File | null>(null);

  useEffect(() => {
    setDatasets(getDatasets());
    try {
      setActiveDatasetName(localStorage.getItem("schema_sense_active_dataset") || "");
    } catch (_) {}
  }, []);

  const saveDatasetsState = (list: Dataset[]) => {
    setDatasets(list);
    try {
      localStorage.setItem("schema_sense_datasets", JSON.stringify(list));
    } catch (_) {}
  };

  const handleFileIngested = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension === "parquet") {
      toast.error(`.${extension} files are not supported. Please convert your sheet to CSV, Excel, or JSON and try again.`);
      return;
    }
    setActiveFile(file);
    setUploadingFileName(file.name);
    setIsUploading(true);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileIngested(e.target.files[0]);
      e.target.value = ""; // Reset file input
    }
  };

  const handleIngestionComplete = () => {
    setIsUploading(false);
    
    // Default columns
    let inferredColumns = [
      { name: "id", type: "uuid", null: "0%" },
      { name: "name", type: "string", null: "1.2%" },
      { name: "status", type: "string", null: "0%" },
      { name: "created_at", type: "timestamp", null: "0%" },
    ];

    const proceed = (cols: typeof inferredColumns) => {
      const newDs: Dataset = {
        name: uploadingFileName,
        size: activeFile
          ? (activeFile.size > 1024 * 1024
              ? `${(activeFile.size / (1024 * 1024)).toFixed(1)} MB`
              : `${(activeFile.size / 1024).toFixed(1)} KB`)
          : "4.8 MB",
        uploadDate: new Date().toISOString().split("T")[0],
        status: "Active",
        metadataGenerated: false, // Inferences pending
        healthScore: Math.floor(Math.random() * 10) + 85, // 85 - 95%
        columns: cols,
        rows: "250K",
      };

      const updated = [newDs, ...datasets];
      saveDatasetsState(updated);
      
      // Select this uploaded dataset as active
      switchDataset(newDs.name);
      localStorage.setItem("schema_sense_metadata_generated", "0"); // Reset metadata generated flag
      localStorage.removeItem("schema_sense_dictionary_metadata"); // Reset cached definitions

      // Save overview info for /dataset-overview page
      try {
        localStorage.setItem(
          "schema_sense_last_upload_overview",
          JSON.stringify({
            name: newDs.name,
            rows: newDs.rows || "250K",
            columns: newDs.columns.length,
            size: newDs.size,
            uploadDate: newDs.uploadDate,
          })
        );
      } catch (_) {}

      // Force storage write for workspace context
      try {
        localStorage.setItem("schema_sense_cols", JSON.stringify(cols));
        localStorage.setItem("schema_sense_active_dataset", newDs.name);
      } catch (_) {}

      refreshWorkspace(); // Propagate new dataset to all routes

      // Navigate to Dataset Overview to review before generating metadata
      navigate({ to: "/dataset-overview" });
    };

    if (activeFile) {
      const reader = new FileReader();
      const isExcel = activeFile.name.endsWith(".xlsx") || activeFile.name.endsWith(".xls");
      reader.onload = (e) => {
        try {
          let headers: string[] = [];
          if (isExcel) {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            if (rows && rows.length > 0) {
              headers = rows[0].map(h => String(h || '').trim()).filter(h => h);
            }
          } else {
            const text = e.target?.result as string;
            if (text) {
              if (activeFile.name.endsWith(".json")) {
                try {
                  const parsed = JSON.parse(text);
                  const obj = Array.isArray(parsed) ? parsed[0] : parsed;
                  headers = Object.keys(obj);
                } catch (_) {}
              } else {
                // CSV / Text fallback: parse comma-separated header row
                const firstLine = text.split("\n")[0];
                headers = firstLine
                  .split(",")
                  .map((h) => h.trim().replace(/^["']|["']$/g, ""));
              }
            }
          }

          if (headers.length > 0) {
            inferredColumns = headers.map((h) => {
              let colType = "string";
              const lower = h.toLowerCase();
              if (lower.includes("id")) colType = "uuid";
              else if (lower.includes("date") || lower.includes("ts") || lower.includes("time")) colType = "timestamp";
              else if (lower.includes("price") || lower.includes("amount") || lower.includes("salary") || lower.includes("revenue")) colType = "decimal(12,2)";
              else if (lower.includes("status") || lower.includes("type") || lower.includes("role") || lower.includes("tier")) colType = "enum";
              else if (lower.includes("is_") || lower.includes("has_") || lower.includes("active")) colType = "boolean";

              return {
                name: h,
                type: colType,
                null: `${(Math.random() * 5).toFixed(1)}%`,
              };
            });
          }
        } catch (err) {
          console.error("Failed to parse columns from uploaded file:", err);
        }
        proceed(inferredColumns);
      };

      if (isExcel) {
        reader.readAsArrayBuffer(activeFile.slice(0, 1024 * 1024 * 5));
      } else {
        reader.readAsText(activeFile.slice(0, 10000));
      }
    } else {
      proceed(inferredColumns);
    }
  };

  // Render main layout (always active)
  return (
    <div className="space-y-8">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={hiddenFileInputRef}
        className="hidden"
        accept=".csv,.json,.xlsx,.xls"
        onChange={handleFileInputChange}
      />

      {/* Page Header */}
      <SectionTitle
        kicker="Ingestion Control"
        title={<>Connect Your <span className="text-primary">Data.</span></>}
        sub="Upload files or connect databases to automatically generate AI metadata, lineage, governance insights, and natural language search."
      />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        
        {/* Left Column: Upload Zone / Upload Progress & Connectors */}
        <div className="space-y-6">
          {/* Ingest Section */}
          {isUploading ? (
            <UploadProgress fileName={uploadingFileName} onComplete={handleIngestionComplete} />
          ) : (
            <UploadZone onFileSelected={handleFileIngested} />
          )}

          {/* Connect Data Warehouse Section */}
          <GlassCard className="p-8">
            <h3 className="font-mono-tight text-[10px] uppercase text-muted-foreground tracking-widest mb-4 flex items-center gap-1.5">
              <Database className="h-4 w-4 text-primary shrink-0" />
              Connect Data Warehouse
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <ConnectionCard name="PostgreSQL" defaultStatus="Disconnected" />
              <ConnectionCard name="MySQL" defaultStatus="Coming Soon" />
              <ConnectionCard name="Snowflake" defaultStatus="Disconnected" />
              <ConnectionCard name="BigQuery" defaultStatus="Disconnected" />
              <ConnectionCard name="MongoDB" defaultStatus="Coming Soon" />
              <ConnectionCard name="Redshift" defaultStatus="Coming Soon" />
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Recent Datasets Registry list */}
        <GlassCard className="p-6 h-full flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between border-b border-border/20 pb-3.5 mb-4">
            <h3 className="font-mono-tight text-[10px] uppercase text-muted-foreground tracking-widest">
              Recent Datasets
            </h3>
            
            <button
              onClick={() => hiddenFileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded px-2.5 py-1 text-[9px] font-mono-tight uppercase cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>Add File</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 custom-scrollbar pr-1 flex flex-col justify-start">
            {datasets.length > 0 ? (
              datasets.map((ds) => (
                <DatasetCard
                  key={ds.name}
                  dataset={ds}
                  isActive={ds.name === activeDatasetName}
                />
              ))
            ) : (
              <div className="text-center py-10 px-4 space-y-4 border border-dashed border-border/40 rounded-2xl bg-secondary/5 my-auto">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No datasets connected. Ingest a CSV/Excel file or connect a database to get started.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => hiddenFileInputRef.current?.click()}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl py-2 text-xs font-semibold cursor-pointer"
                  >
                    Upload Dataset
                  </button>
                  <button
                    onClick={() => {
                      enableDemoMode();
                      refreshWorkspace();
                    }}
                    className="w-full bg-background border border-border hover:bg-secondary text-foreground rounded-xl py-2 text-xs font-semibold cursor-pointer"
                  >
                    Load Demo Workspace
                  </button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
