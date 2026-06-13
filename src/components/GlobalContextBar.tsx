import React, { useEffect, useState } from "react";
import { Database } from "lucide-react";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { getDatasets, switchDataset } from "@/lib/demoModeService";

export function GlobalContextBar() {
  const {
    hasDataset,
    activeDatasetName,
    refreshWorkspace,
  } = useWorkspace();

  const [datasetsList, setDatasetsList] = useState<string[]>([]);

  useEffect(() => {
    if (hasDataset) {
      const list = getDatasets().map((d) => d.name);
      setDatasetsList(list.length > 0 ? list : [activeDatasetName]);
    }
  }, [hasDataset, activeDatasetName]);

  const handleDatasetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const target = e.target.value;
    if (target && target !== activeDatasetName) {
      switchDataset(target);
      // Let's store a new scan time on swap
      localStorage.setItem("schema_sense_last_scan", "Just now");
      refreshWorkspace();
    }
  };

  if (!hasDataset) return null;

  return (
    <div className="w-full border-b border-border/40 bg-card/20 backdrop-blur-md px-6 py-2.5 flex items-center justify-between gap-4 z-30 relative select-none shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      {/* Active dataset select dropdown */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
          <Database className="h-4.5 w-4.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-mono-tight text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
            Active Dataset
          </span>
          <select
            value={activeDatasetName}
            onChange={handleDatasetChange}
            className="bg-transparent text-xs font-bold text-foreground font-sans border-none outline-none cursor-pointer focus:ring-0 py-0 pl-0 pr-6"
          >
            {datasetsList.map((name) => (
              <option key={name} value={name} className="bg-background text-foreground">
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
