import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings2, Bell, Plug, Globe, Moon, Mic, Activity,
  Slack, Database, CheckCircle2, AlertCircle, Loader2, Check,
} from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · SchemaSense" },
      { name: "description", content: "Configure your SchemaSense preferences, notifications, and database connections." },
    ],
  }),
  component: SettingsPage,
});

// ─── Reusable Toggle ─────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, id }: { enabled: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
        enabled ? "bg-primary border-primary" : "bg-muted border-border"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md ring-0 mt-0.5 ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({
  id, label, description, enabled, onChange, icon: Icon,
}: {
  id: string; label: string; description: string;
  enabled: boolean; onChange: (v: boolean) => void;
  icon: React.ElementType;
}) {
  return (
    <motion.div
      layout
      className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/40 px-5 py-4 transition-colors hover:bg-secondary/30"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${enabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">{description}</div>
        </div>
      </div>
      <Toggle id={id} enabled={enabled} onChange={onChange} />
    </motion.div>
  );
}

// ─── Styled Input ─────────────────────────────────────────────────────────────
function SettingsInput({
  label, id, type = "text", placeholder, value, onChange, mono,
}: {
  label: string; id: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 backdrop-blur-sm transition-all focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 ${mono ? "font-mono-tight" : ""}`}
      />
    </div>
  );
}

// ─── Tab definitions ─────────────────────────────────────────────────────────
type TabId = "general" | "notifications" | "connections";
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "general",       label: "General Preferences", icon: Settings2 },
  { id: "notifications", label: "Notifications",        icon: Bell      },
  { id: "connections",   label: "Connections",          icon: Plug      },
];

// ─── Save button with confirmation animation ──────────────────────────────────
function SaveButton({ label, onSave }: { label: string; onSave: () => void }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleClick = () => {
    setStatus("saving");
    setTimeout(() => {
      setStatus("saved");
      onSave();
      setTimeout(() => setStatus("idle"), 2000);
    }, 600);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={status !== "idle"}
      whileTap={status === "idle" ? { scale: 0.97 } : {}}
      className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
        status === "saved"
          ? "bg-green-500 text-white shadow-[0_4px_20px_rgba(34,197,94,0.4)]"
          : "bg-primary text-primary-foreground shadow-[0_4px_16px_rgba(242,120,92,0.3)] hover:opacity-90 hover:scale-[1.02]"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {status === "saving" && (
          <motion.span
            key="saving"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </motion.span>
        )}
        {status === "saved" && (
          <motion.span
            key="saved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Saved!
          </motion.span>
        )}
        {status === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");

  // General
  const [language, setLanguage]   = useState("en");
  const [darkMode,  setDarkMode]  = useState(() => {
    try {
      const saved = localStorage.getItem("ss_dark_mode");
      // Default to dark mode if no preference saved yet
      return saved === null ? true : saved === "1";
    } catch { return true; }
  });
  const [voice, setVoice] = useState(() => {
    try { return localStorage.getItem("ss_voice") === "1"; }
    catch { return false; }
  });

  // Sync dark mode with root class AND persist to localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      try { localStorage.setItem("ss_dark_mode", "1"); } catch {}
    } else {
      document.documentElement.classList.remove("dark");
      try { localStorage.setItem("ss_dark_mode", "0"); } catch {}
    }
  }, [darkMode]);

  // Persist voice preference so Ask AI page can read it
  useEffect(() => {
    try { localStorage.setItem("ss_voice", voice ? "1" : "0"); }
    catch { }
  }, [voice]);

  // Notifications
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [dailyDigest,    setDailyDigest]    = useState(false);
  const [slackInteg,     setSlackInteg]     = useState(false);

  // Connections
  const [dbHost,     setDbHost]     = useState("");
  const [dbPort,     setDbPort]     = useState("5432");
  const [dbUser,     setDbUser]     = useState("");
  const [dbPassword, setDbPassword] = useState("");
  const [connStatus, setConnStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");

  const handleTestConnection = () => {
    setConnStatus("testing");
    setTimeout(() => {
      // Simulate success if host & user filled, error otherwise
      setConnStatus(dbHost && dbUser ? "ok" : "error");
      setTimeout(() => setConnStatus("idle"), 3500);
    }, 2200);
  };

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "zh", label: "中文 (Chinese)" },
    { value: "ar", label: "العربية (Arabic)" },
    { value: "ja", label: "日本語 (Japanese)" },
    { value: "pt", label: "Português" },
  ];

  return (
    <div>
      <SectionTitle
        kicker="Settings"
        title={<>Configure <span className="text-primary">SchemaSense.</span></>}
        sub="Manage your preferences, notification channels, and database connection settings."
      />

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* ── Left sidebar nav ─────────────────────────────────────────── */}
        <aside className="lg:w-56 flex-shrink-0">
          <GlassCard className="p-2">
            <nav className="flex flex-col gap-1">
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`settings-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-left transition-all ${
                      active
                        ? "bg-primary/12 text-primary border border-primary/20 shadow-[inset_0_0_16px_rgba(242,120,92,0.07)]"
                        : "text-muted-foreground border border-transparent hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="settings-active-pill"
                        className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <tab.icon className={`relative z-10 h-4 w-4 flex-shrink-0 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </GlassCard>
        </aside>

        {/* ── Right panel ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              {/* ── GENERAL PREFERENCES ─────────────────────────── */}
              {activeTab === "general" && (
                <GlassCard className="p-6 md:p-8">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Settings2 className="h-4 w-4" />
                    </div>
                    <h2 className="font-display text-xl font-bold">General Preferences</h2>
                  </div>

                  <div className="flex flex-col gap-6">
                    {/* Language */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="language-select" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Globe className="h-3.5 w-3.5" />
                        Language Selection
                      </label>
                      <div className="relative">
                        <select
                          id="language-select"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-border bg-background/60 px-4 py-3 pr-10 text-sm font-medium text-foreground backdrop-blur-sm transition-all focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                          {languages.map((l) => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4.427 6.143a.75.75 0 0 1 1.06 0L8 8.657l2.513-2.514a.75.75 0 1 1 1.06 1.06l-3.043 3.044a.75.75 0 0 1-1.06 0L4.427 7.203a.75.75 0 0 1 0-1.06z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Sets the display language across all SchemaSense modules.</p>
                    </div>

                    <div className="h-px bg-border/60" />

                    {/* Dark mode */}
                    <ToggleRow
                      id="toggle-dark-mode"
                      label="Dark Mode"
                      description="Switch the entire interface to a rich dark theme."
                      enabled={darkMode}
                      onChange={setDarkMode}
                      icon={Moon}
                    />

                    {/* Voice input */}
                    <ToggleRow
                      id="toggle-voice"
                      label="Enable Voice Input"
                      description="Use microphone for hands-free schema queries via Ask AI."
                      enabled={voice}
                      onChange={setVoice}
                      icon={Mic}
                    />

                    <div className="mt-2 flex justify-end">
                      <SaveButton label="Save Preferences" onSave={() => {}} />
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* ── NOTIFICATIONS ─────────────────────────────────── */}
              {activeTab === "notifications" && (
                <GlassCard className="p-6 md:p-8">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Bell className="h-4 w-4" />
                    </div>
                    <h2 className="font-display text-xl font-bold">Notifications</h2>
                  </div>

                  <div className="flex flex-col gap-3">
                    <ToggleRow
                      id="toggle-critical-alerts"
                      label="Critical Schema Alerts"
                      description="Get notified instantly when high-severity schema drift or null spikes are detected."
                      enabled={criticalAlerts}
                      onChange={setCriticalAlerts}
                      icon={Bell}
                    />
                    <ToggleRow
                      id="toggle-daily-digest"
                      label="Daily Health Digest"
                      description="Receive a daily summary of schema health, column changes, and anomaly counts."
                      enabled={dailyDigest}
                      onChange={setDailyDigest}
                      icon={Activity}
                    />
                    <ToggleRow
                      id="toggle-slack"
                      label="Slack Integration"
                      description="Push critical alerts and digest reports directly to a configured Slack channel."
                      enabled={slackInteg}
                      onChange={setSlackInteg}
                      icon={Slack}
                    />
                  </div>

                  {slackInteg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Slack Webhook URL</p>
                        <input
                          id="slack-webhook"
                          type="url"
                          placeholder="https://hooks.slack.com/services/T00000000/…"
                          className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-mono-tight text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <SaveButton label="Save Notifications" onSave={() => {}} />
                  </div>
                </GlassCard>
              )}

              {/* ── CONNECTIONS ───────────────────────────────────── */}
              {activeTab === "connections" && (
                <GlassCard className="p-6 md:p-8">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Plug className="h-4 w-4" />
                    </div>
                    <h2 className="font-display text-xl font-bold">Connections</h2>
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* Inline pill indicator */}
                    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-4 py-3">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Database connection</span>
                      <span className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono-tight text-[10px] uppercase tracking-wider transition-colors ${
                        connStatus === "ok"      ? "border-green-500/40 bg-green-500/10 text-green-600" :
                        connStatus === "error"   ? "border-destructive/40 bg-destructive/10 text-destructive" :
                        connStatus === "testing" ? "border-primary/40 bg-primary/10 text-primary animate-pulse" :
                        "border-border bg-secondary text-muted-foreground"
                      }`}>
                        {connStatus === "ok" ? "Connected" : connStatus === "error" ? "Failed" : connStatus === "testing" ? "Testing…" : "Not connected"}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <SettingsInput
                          id="db-host"
                          label="Database Host"
                          placeholder="db.example.com or 192.168.1.1"
                          value={dbHost}
                          onChange={setDbHost}
                          mono
                        />
                      </div>
                      <SettingsInput
                        id="db-port"
                        label="Port"
                        placeholder="5432"
                        value={dbPort}
                        onChange={setDbPort}
                        mono
                      />
                      <SettingsInput
                        id="db-user"
                        label="User"
                        placeholder="postgres"
                        value={dbUser}
                        onChange={setDbUser}
                        mono
                      />
                      <div className="sm:col-span-2">
                        <SettingsInput
                          id="db-password"
                          label="Password"
                          type="password"
                          placeholder="••••••••••••"
                          value={dbPassword}
                          onChange={setDbPassword}
                        />
                      </div>
                    </div>

                    {/* Status feedback */}
                    <AnimatePresence>
                      {connStatus === "ok" && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2.5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600"
                        >
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                          Connection successful! Database is reachable.
                        </motion.div>
                      )}
                      {connStatus === "error" && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                        >
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          Connection failed. Please check host and credentials.
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xs text-muted-foreground">Credentials are stored locally and never transmitted without TLS.</p>
                      <button
                        id="test-connection-btn"
                        onClick={handleTestConnection}
                        disabled={connStatus === "testing"}
                        className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                          connStatus === "testing"
                            ? "bg-primary/20 text-primary cursor-not-allowed"
                            : "bg-primary text-primary-foreground shadow-[0_4px_16px_rgba(242,120,92,0.3)] hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                      >
                        {connStatus === "testing" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Testing…
                          </>
                        ) : (
                          <>
                            <Plug className="h-4 w-4" />
                            Test Connection
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
