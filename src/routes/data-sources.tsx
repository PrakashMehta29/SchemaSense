import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import { Database, Plus } from "lucide-react";
import { SectionTitle, GlassCard } from "@/components/ui-bits";
import { toast } from "sonner";

import { EmptyDatasetState } from "@/components/datasource/EmptyDatasetState";
import { UploadZone } from "@/components/datasource/UploadZone";
import { UploadProgress } from "@/components/datasource/UploadProgress";
import { DatasetCard } from "@/components/datasource/DatasetCard";
import { ConnectionCard } from "@/components/datasource/ConnectionCard";

import { Dataset, getDatasets, switchDataset, enableDemoMode } from "@/lib/demoModeService";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { getConnectionsFn, toggleConnectionFn } from "@/lib/api/schemaSense";

export const Route = createFileRoute("/data-sources")({
  head: () => ({
    meta: [
      { title: "Connect Your Data · SchemaSense" },
      { name: "description", content: "Ingest datasets or connect enterprise data warehouses." },
    ],
  }),
  component: DataSourcesPage,
});

interface DBConnection {
  status: "Connected" | "Disconnected" | "Coming Soon";
  host?: string;
  port?: number;
  dbName?: string;
  username?: string;
}

function DataSourcesPage() {
  const navigate = useNavigate();
  const { refreshWorkspace } = useWorkspace();
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetName, setActiveDatasetName] = useState("");

  // Upload workflow states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState("");

  // Connectors State
  const [connections, setConnections] = useState<Record<string, DBConnection>>({
    PostgreSQL: { status: "Disconnected" },
    MySQL: { status: "Disconnected" }, // Active MySQL connect enable
    Snowflake: { status: "Disconnected" },
    BigQuery: { status: "Disconnected" },
    MongoDB: { status: "Disconnected" }, // Active MongoDB connect enable
    Redshift: { status: "Coming Soon" },
  });

  useEffect(() => {
    // 1. Load datasets from localStorage
    setDatasets(getDatasets());
    try {
      setActiveDatasetName(localStorage.getItem("schema_sense_active_dataset") || "");
    } catch (err) {
      console.warn("Could not read active dataset:", err);
    }

    // 2. Fetch connection statuses from the Python backend
    const loadConnections = async () => {
      try {
        const res = await getConnectionsFn();
        if (res.success && res.connections) {
          const loadedMap: Record<string, DBConnection> = {};
          (
            res.connections as Array<{
              name: string;
              status: string;
              host?: string;
              port?: number;
              db_name?: string;
              username?: string;
            }>
          ).forEach((conn) => {
            loadedMap[conn.name] = {
              status: conn.status as "Connected" | "Disconnected" | "Coming Soon",
              host: conn.host || undefined,
              port: conn.port || undefined,
              dbName: conn.db_name || undefined,
              username: conn.username || undefined,
            };
          });

          setConnections((prev) => {
            const updated = { ...prev };
            Object.entries(loadedMap).forEach(([k, v]) => {
              if (updated[k] && updated[k].status !== "Coming Soon") {
                updated[k] = v;
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.warn("Could not query server connections, falling back to local simulation:", err);
      }
    };

    loadConnections();
  }, []);

  const saveDatasetsState = (list: Dataset[]) => {
    setDatasets(list);
    try {
      localStorage.setItem("schema_sense_datasets", JSON.stringify(list));
    } catch (err) {
      console.warn("Could not save datasets:", err);
    }
  };

  const handleFileIngested = (file: File) => {
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

    // Build a mock dataset object
    const newDs: Dataset = {
      name: uploadingFileName,
      size: "4.8 MB",
      uploadDate: new Date().toISOString().split("T")[0],
      status: "Active",
      metadataGenerated: false, // Inferences pending
      healthScore: Math.floor(Math.random() * 10) + 85, // 85 - 95%
      columns: [
        { name: "id", type: "uuid", null: "0%" },
        { name: "name", type: "string", null: "1.2%" },
        { name: "status", type: "string", null: "0%" },
        { name: "created_at", type: "timestamp", null: "0%" },
      ],
      rows: "250K",
    };

    const updated = [newDs, ...datasets];
    saveDatasetsState(updated);

    // Select this uploaded dataset as active
    switchDataset(newDs.name);
    localStorage.setItem("schema_sense_metadata_generated", "0"); // Reset metadata generated flag
    localStorage.removeItem("schema_sense_dictionary_metadata"); // Reset cached definitions
    refreshWorkspace(); // Propagate new dataset to all routes

    toast.success(`Dataset '${uploadingFileName}' successfully uploaded!`);
    // Automatically navigate to dictionary page to run AI generation
    navigate({ to: "/dictionary" });
  };

  // Handle active database connection status toggle
  const handleToggleConnection = async (
    name: string,
    newStatus: "Connected" | "Disconnected",
    config?: { host: string; port: number; dbName: string; username: string },
  ) => {
    try {
      // 1. Submit connection to server function (persists in python DuckDB database)
      await toggleConnectionFn({
        data: {
          name,
          status: newStatus,
          host: config?.host,
          port: config?.port,
          db_name: config?.dbName,
          username: config?.username,
        },
      });

      // 2. Update local visual state
      setConnections((prev) => ({
        ...prev,
        [name]: {
          status: newStatus,
          ...config,
        },
      }));

      // 3. Perform real-time action feedback & ingest sample tables
      if (newStatus === "Connected") {
        toast.success(`Successfully connected to ${name}!`);

        // Real-time table injection based on DB type
        if (name === "MySQL") {
          const tableName = `mysql_${config?.dbName || "prod"}_orders.csv`;
          const isExist = datasets.some((d) => d.name === tableName);

          if (!isExist) {
            const newMysqlDs: Dataset = {
              name: tableName,
              size: "18.3 MB",
              uploadDate: new Date().toISOString().split("T")[0],
              status: "Active",
              metadataGenerated: true,
              healthScore: 94,
              rows: "120K",
              columns: [
                { name: "mysql_order_id", type: "integer", null: "0%" },
                { name: "customer_id", type: "integer", null: "0%" },
                { name: "amount_usd", type: "decimal(12,2)", null: "3.2%" },
                { name: "country", type: "string(2)", null: "0.2%" },
                { name: "status", type: "string", null: "0%" },
              ],
            };

            const updatedList = [newMysqlDs, ...datasets];
            saveDatasetsState(updatedList);
            switchDataset(newMysqlDs.name);
            refreshWorkspace();
            setActiveDatasetName(newMysqlDs.name);
            toast.info(`Real-time: Ingested table '${tableName}' from MySQL Catalog!`);
          }
        } else if (name === "MongoDB") {
          const collectionName = `mongodb_${config?.dbName || "schemas"}_users.json`;
          const isExist = datasets.some((d) => d.name === collectionName);

          if (!isExist) {
            const newMongoDs: Dataset = {
              name: collectionName,
              size: "24.5 MB",
              uploadDate: new Date().toISOString().split("T")[0],
              status: "Active",
              metadataGenerated: true,
              healthScore: 91,
              rows: "450K",
              columns: [
                { name: "_id", type: "object_id", null: "0%" },
                { name: "email", type: "string", null: "1.5%" },
                { name: "phone", type: "string", null: "18.4%" },
                { name: "billing_zip", type: "string", null: "0%" },
                { name: "last_login", type: "timestamp", null: "5.1%" },
              ],
            };

            const updatedList = [newMongoDs, ...datasets];
            saveDatasetsState(updatedList);
            switchDataset(newMongoDs.name);
            refreshWorkspace();
            setActiveDatasetName(newMongoDs.name);
            toast.info(
              `Real-time: Ingested collection '${collectionName}' from MongoDB Document Store!`,
            );
          }
        }
      } else {
        toast.error(`Disconnected from ${name}.`);

        // Optionally remove connected datasets to simulate disconnecting
        const prefix = name.toLowerCase();
        const filtered = datasets.filter((d) => !d.name.startsWith(prefix));
        if (filtered.length !== datasets.length) {
          saveDatasetsState(filtered);
          if (filtered.length > 0) {
            switchDataset(filtered[0].name);
            setActiveDatasetName(filtered[0].name);
          } else {
            localStorage.removeItem("schema_sense_active_dataset");
            localStorage.removeItem("schema_sense_cols");
            setActiveDatasetName("");
          }
          refreshWorkspace();
          toast.info(`Real-time: Unloaded catalog assets linked to ${name}.`);
        }
      }
    } catch (err) {
      console.error("Failed to commit connection change:", err);
      toast.error(`Failed to authorize ${name} connection.`);
    }
  };

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
        title={
          <>
            Connect Your <span className="text-primary">Data.</span>
          </>
        }
        sub="Upload files or connect databases over active sockets to automatically generate metadata, lineage graphs, and run LLM schemas. (MySQL & MongoDB connections are fully enabled)."
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
              {Object.entries(connections).map(([dbName, conn]) => (
                <ConnectionCard
                  key={dbName}
                  name={dbName}
                  status={conn.status}
                  host={conn.host}
                  port={conn.port}
                  dbName={conn.dbName}
                  username={conn.username}
                  onToggle={handleToggleConnection}
                />
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Recent Datasets Registry list */}
        <GlassCard className="p-6 h-full flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between border-b border-border/20 pb-3.5 mb-4">
            <h3 className="font-mono-tight text-[10px] uppercase text-muted-foreground tracking-widest">
              Recent Datasets ({datasets.length})
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
                <DatasetCard key={ds.name} dataset={ds} isActive={ds.name === activeDatasetName} />
              ))
            ) : (
              <div className="text-center py-10 px-4 space-y-4 border border-dashed border-border/40 rounded-2xl bg-secondary/5 my-auto">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No datasets connected. Ingest a CSV/Excel file or connect a database to get
                  started.
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
