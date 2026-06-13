import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import { Database, Plus } from "lucide-react";
import { SectionTitle, GlassCard } from "@/components/ui-bits";

import { EmptyDatasetState } from "@/components/datasource/EmptyDatasetState";
import { UploadZone } from "@/components/datasource/UploadZone";
import { UploadProgress } from "@/components/datasource/UploadProgress";
import { DatasetCard } from "@/components/datasource/DatasetCard";
import { ConnectionCard } from "@/components/datasource/ConnectionCard";

import { Dataset, DatasetColumn, getDatasets, switchDataset, enableDemoMode, CUSTOMERS_COLUMNS } from "@/lib/demoModeService";
import * as xlsx from "xlsx";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { toast } from "sonner";

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
  const [parsedColumns, setParsedColumns] = useState<DatasetColumn[]>([]);

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

  const handleFileIngested = async (file: File) => {
    if (!file.name.match(/\.(csv|xlsx|json)$/i)) {
      toast.error("File not supported", {
        description: "Only .csv, .xlsx, and .json formats are strictly supported.",
      });
      return;
    }

    setUploadingFileName(file.name);
    setIsUploading(true);
    setParsedColumns([]); // Reset

    try {
      let extractedCols: any[] = [];
      
        let dataSample: any[] = [];
      if (file.name.endsWith(".xlsx")) {
        const buffer = await file.arrayBuffer();
        const workbook = xlsx.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (firstSheetName) {
          const sheet = workbook.Sheets[firstSheetName];
          const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
          if (data && data.length > 0) {
            const headers = data[0] || [];
            extractedCols = headers.filter(Boolean).map((h: any) => ({
              name: String(h).trim(),
              type: "string",
              null: "0%",
            }));
            if (data.length > 1) {
                dataSample = xlsx.utils.sheet_to_json(sheet).slice(0, 5);
            }
          }
        }
      } else {
        // Fallback for CSV / JSON via FileReader
        const text = await file.text();
        if (file.name.endsWith(".json")) {
          const data = JSON.parse(text);
          const firstItem = Array.isArray(data) ? data[0] : data;
          if (firstItem && typeof firstItem === "object") {
            extractedCols = Object.keys(firstItem).map((k) => ({
              name: k,
              type: typeof firstItem[k] === "number" ? "number" : "string",
              null: "0%",
            }));
            dataSample = (Array.isArray(data) ? data : [data]).slice(0, 5);
          }
        } else {
          // Simple CSV parsing
          const lines = text.split("\n").filter(Boolean);
          if (lines.length > 0) {
            const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
            extractedCols = headers.filter(Boolean).map((h) => ({
              name: h,
              type: "string",
              null: "0%",
            }));
            
            dataSample = lines.slice(1, 6).map(line => {
                const values = line.split(",").map(v => v.trim().replace(/^["']|["']$/g, ""));
                let rowObj: any = {};
                headers.forEach((h, i) => { rowObj[h] = values[i]; });
                return rowObj;
            });
          }
        }
      }

      try {
         localStorage.setItem("schema_sense_dataset_sample", JSON.stringify(dataSample));
      } catch (e) {}

      if (extractedCols.length > 0) {
        setParsedColumns(extractedCols);
      } else {
        toast.error("The file is not supported or corrupted");
        setIsUploading(false);
      }
    } catch (err) {
      console.warn("Could not parse file headers", err);
      toast.error("The file is not supported or corrupted");
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileIngested(e.target.files[0]);
      e.target.value = ""; // Reset file input
    }
  };

  const handleIngestionComplete = () => {
    setIsUploading(false);
    
    // Use parsed columns or fallback
    const cols = parsedColumns.length > 0 ? parsedColumns : [
      { name: "id", type: "uuid", null: "0%" },
      { name: "name", type: "string", null: "1.2%" },
      { name: "status", type: "string", null: "0%" },
      { name: "created_at", type: "timestamp", null: "0%" },
    ];

    // Build a mock dataset object
    const newDs: Dataset = {
      name: uploadingFileName,
      size: "4.8 MB",
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
    refreshWorkspace(); // Propagate new dataset to all routes

    // Automatically navigate to dictionary page to run AI generation
    navigate({ to: "/dictionary" });
  };

  // Render main layout (always active)
  return (
    <div className="space-y-8">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={hiddenFileInputRef}
        className="hidden"
        accept=".csv,.parquet,.json,.xlsx"
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
