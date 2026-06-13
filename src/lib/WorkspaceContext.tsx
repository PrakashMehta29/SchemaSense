/**
 * WorkspaceContext
 * ----------------
 * Single source of truth for dataset / column state across all routes.
 *
 * Pattern:
 *  1. AppShell wraps its children with <WorkspaceProvider>.
 *  2. Every route that previously ran its own localStorage useEffect now
 *     calls useWorkspace() instead — zero extra reads, always in sync.
 *  3. After writing to localStorage (e.g. upload complete, demo mode load),
 *     call refreshWorkspace() from any component to push the new state to
 *     all consumers without a page reload.
 *  4. The provider also listens to the native "storage" event so changes
 *     made in other browser tabs stay synchronised.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { DatasetColumn } from "./demoModeService";

// ─── Shape ───────────────────────────────────────────────────────────────────

interface WorkspaceState {
  /** True once at least one column array is stored in localStorage */
  hasDataset: boolean;
  /** The active dataset name (schema_sense_active_dataset) */
  activeDatasetName: string;
  /** The parsed column definitions for the active dataset */
  columns: DatasetColumn[];
  /** True when metadata has been generated (schema_sense_metadata_generated === "1") */
  metadataGenerated: boolean;
  /** Dictionary metadata parsed globally */
  metadata: Record<string, any>;
  /** Health score of the active dataset */
  healthScore: number;
  /** Number of PII columns detected */
  piiCount: number;
  /** Timestamp of the last metadata scan */
  lastScanTime: string;
  /**
   * Call this from any component after you write to localStorage to
   * propagate the new state to all route consumers immediately.
   */
  refreshWorkspace: () => void;
}

const defaultState: WorkspaceState = {
  hasDataset: false,
  activeDatasetName: "",
  columns: [],
  metadataGenerated: false,
  metadata: {},
  healthScore: 89,
  piiCount: 0,
  lastScanTime: "2 minutes ago",
  refreshWorkspace: () => {},
};

const WorkspaceContext = createContext<WorkspaceState>(defaultState);

// ─── Helper – reads all relevant keys from localStorage ───────────────────────

function readWorkspaceFromStorage(): Omit<WorkspaceState, "refreshWorkspace"> {
  try {
    const colsRaw = localStorage.getItem("schema_sense_cols");
    const columns: DatasetColumn[] = colsRaw ? JSON.parse(colsRaw) : [];
    const hasDataset = Array.isArray(columns) && columns.length > 0;

    const activeDatasetName = localStorage.getItem("schema_sense_active_dataset") ?? "";

    const metadataGenerated = localStorage.getItem("schema_sense_metadata_generated") === "1";

    const metaRaw = localStorage.getItem("schema_sense_dictionary_metadata");
    const metadata = metaRaw ? JSON.parse(metaRaw) : {};

    let piiCount = 0;
    Object.values(metadata).forEach((col: any) => {
      if (
        col &&
        (col.pii === true || col.sensitivity === "Critical" || col.sensitivity === "High")
      ) {
        piiCount++;
      }
    });

    let healthScore = 89;
    const datasetsRaw = localStorage.getItem("schema_sense_datasets");
    if (datasetsRaw && activeDatasetName) {
      try {
        const datasets = JSON.parse(datasetsRaw);
        const activeDs = datasets.find((d: any) => d.name === activeDatasetName);
        if (activeDs && activeDs.healthScore) {
          healthScore = activeDs.healthScore;
        }
      } catch (_) {}
    }

    const lastScanTime = localStorage.getItem("schema_sense_last_scan") || "2 minutes ago";

    return {
      hasDataset,
      activeDatasetName,
      columns,
      metadataGenerated,
      metadata,
      healthScore,
      piiCount,
      lastScanTime,
    };
  } catch {
    return {
      hasDataset: false,
      activeDatasetName: "",
      columns: [],
      metadataGenerated: false,
      metadata: {},
      healthScore: 89,
      piiCount: 0,
      lastScanTime: "2 minutes ago",
    };
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<WorkspaceState, "refreshWorkspace">>({
    hasDataset: false,
    activeDatasetName: "",
    columns: [],
    metadataGenerated: false,
    metadata: {},
    healthScore: 89,
    piiCount: 0,
    lastScanTime: "2 minutes ago",
  });

  const refreshWorkspace = useCallback(() => {
    setState(readWorkspaceFromStorage());
  }, []);

  // Hydrate states from localStorage after mounting on client side
  useEffect(() => {
    setState(readWorkspaceFromStorage());
  }, []);

  // Sync when another tab writes to localStorage
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      const relevantKeys = [
        "schema_sense_cols",
        "schema_sense_active_dataset",
        "schema_sense_metadata_generated",
        "schema_sense_datasets",
        "schema_sense_demo_active",
      ];
      if (e.key === null || relevantKeys.includes(e.key)) {
        setState(readWorkspaceFromStorage());
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, []);

  return (
    <WorkspaceContext.Provider value={{ ...state, refreshWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useWorkspace(): WorkspaceState {
  return useContext(WorkspaceContext);
}
