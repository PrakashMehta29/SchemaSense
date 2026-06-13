import React, { useState, useEffect } from "react";
import {
  X,
  Database,
  Terminal,
  Shield,
  CheckCircle,
  AlertCircle,
  Play,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  databaseName: string;
  onConnectSuccess: (params: {
    host: string;
    port: number;
    dbName: string;
    username: string;
  }) => void;
}

export function ConnectionDialog({
  isOpen,
  onClose,
  databaseName,
  onConnectSuccess,
}: ConnectionDialogProps) {
  const isMongo = databaseName.toLowerCase().includes("mongo");
  const isMysql = databaseName.toLowerCase().includes("mysql");

  const [host, setHost] = useState(isMongo ? "mongodb://localhost:27017" : "localhost");
  const [port, setPort] = useState(isMysql ? 3306 : isMongo ? 27017 : 5432);
  const [dbName, setDbName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Set typical defaults based on database selection
      setHost(isMongo ? "mongodb://localhost:27017" : "127.0.0.1");
      setPort(isMysql ? 3306 : isMongo ? 27017 : 5432);
      setDbName(isMysql ? "mysql_production" : isMongo ? "mongodb_schemas" : "postgres_db");
      setUsername("admin");
      setPassword("");
      setTestStatus("idle");
      setLogs([]);
      setCurrentStep(0);
    }
  }, [isOpen, databaseName, isMongo, isMysql]);

  const testSteps = [
    `Initializing secure connection handshake to ${databaseName}...`,
    `Verifying network route and IP tables...`,
    `Handshaking via SSL/TLS encryption layer: SECURE`,
    `Authenticating credentials for user principal...`,
    `Querying catalog schemas and relationship indexes...`,
    `Inferences loaded! Porting telemetry metadata in real-time...`,
  ];

  const handleTestAndConnect = () => {
    if (!dbName || !username) {
      setTestStatus("error");
      setLogs(["[ERROR] Validation failed. Database Name and Username are required fields."]);
      return;
    }

    setTestStatus("testing");
    setLogs([testSteps[0]]);
    setCurrentStep(1);
  };

  useEffect(() => {
    if (testStatus !== "testing") return;

    if (currentStep < testSteps.length) {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, testSteps[currentStep]]);
        setCurrentStep((prev) => prev + 1);
      }, 550);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setTestStatus("success");
        setLogs((prev) => [
          ...prev,
          `[SUCCESS] Connection authorized! Ready to catalog data in real-time.`,
        ]);
        // Trigger success callback
        setTimeout(() => {
          onConnectSuccess({
            host,
            port,
            dbName,
            username,
          });
          onClose();
        }, 1200);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [testStatus, currentStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-background p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/20 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Connect to <span className="text-primary font-bold">{databaseName}</span>
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Configure relational database triggers & live schema lineage tracking.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-border/40 bg-secondary/10 p-1.5 text-muted-foreground hover:bg-secondary/20 hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* State Panel */}
        {testStatus === "testing" || testStatus === "success" ? (
          /* Live Terminal Simulation */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 animate-pulse">
                <Terminal className="h-4 w-4 text-emerald-500" />
                Live Connection Stream
              </span>
              <span className="flex items-center gap-1.5 rounded border border-emerald-500/20 bg-emerald-500/15 px-2 py-0.5 font-mono-tight text-[8px] uppercase tracking-widest text-emerald-500 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                ACTIVE SOCKET
              </span>
            </div>

            <div className="bg-zinc-950 font-mono text-[9px] text-zinc-300 p-4 rounded-xl min-h-[180px] flex flex-col justify-end max-h-[220px] overflow-y-auto border border-white/5 space-y-1.5 scroll-smooth custom-scrollbar">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${log.startsWith("[SUCCESS]") ? "text-emerald-400 font-bold" : log.startsWith("[ERROR]") ? "text-rose-500 font-bold" : "text-zinc-300"}`}
                >
                  <span className="text-zinc-500 mr-1.5 select-none">&gt;</span>
                  {log}
                </div>
              ))}
              {testStatus === "testing" && (
                <div className="flex items-center gap-2 text-zinc-500 italic mt-1">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span>Negotiating connection packets...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Configuration Input Fields */
          <div className="space-y-4">
            {testStatus === "error" && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-rose-500 animate-slide-up">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="text-[10px] leading-relaxed">
                  {logs[0] ||
                    "Connection verification failed. Please check Host name or login credentials."}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5 col-span-2">
                <label className="text-[9px] font-mono-tight uppercase tracking-wider text-muted-foreground block">
                  {isMongo ? "Connection URI" : "Database Host"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder={isMongo ? "mongodb://localhost:27017" : "127.0.0.1"}
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground font-mono focus:border-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              {!isMongo && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono-tight uppercase tracking-wider text-muted-foreground block">
                    Port
                  </label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground font-mono focus:border-primary/50 focus:outline-none"
                  />
                </div>
              )}

              <div className={`space-y-1.5 ${isMongo ? "col-span-2" : ""}`}>
                <label className="text-[9px] font-mono-tight uppercase tracking-wider text-muted-foreground block">
                  {isMongo ? "Default Database Name" : "Database Name"}
                </label>
                <input
                  type="text"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder="e.g. schema_store"
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground font-semibold focus:border-primary/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono-tight uppercase tracking-wider text-muted-foreground block">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground font-semibold focus:border-primary/50 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono-tight uppercase tracking-wider text-muted-foreground block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground font-mono focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-border/20 pt-4 mt-2.5 flex items-center justify-between gap-3">
              <span className="text-[9px] text-muted-foreground leading-relaxed flex items-center gap-1">
                <Shield className="h-3 w-3 text-primary shrink-0" />
                TLS/SSL verification is fully forced.
              </span>
              <button
                onClick={handleTestAndConnect}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-4.5 py-2 text-xs cursor-pointer select-none transition-all shadow-md active:scale-[0.98]"
              >
                <span>Connect Warehouse</span>
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
