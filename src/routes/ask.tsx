import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Mic, Copy, Check, Terminal } from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/ui-bits";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask AI · SchemaSense" },
      {
        name: "description",
        content: "Chat with your schema in real time. Ask about columns, lineage, drift and more.",
      },
    ],
  }),
  component: Ask,
});

// ─── Types ────────────────────────────────────────────────────────────────────
type Msg = {
  id: string;
  role: "user" | "ai";
  text: string;
  hasCode?: boolean;
  code?: string;
  codeLang?: string;
};

// ─── Seed messages ─────────────────────────────────────────────────────────────
const seed: Msg[] = [
  {
    id: "1",
    role: "user",
    text: "What does cust_id mean?",
  },
  {
    id: "2",
    role: "ai",
    text: "cust_id is a UUID that uniquely identifies each customer. It originates in raw.users and propagates downstream to stg_customers and dim_customer. It is non-nullable and flagged as PII.",
  },
  {
    id: "3",
    role: "user",
    text: "Show me the SQL to find columns with >10% nulls",
  },
  {
    id: "4",
    role: "ai",
    text: "Here's a query you can run against your information schema:",
    hasCode: true,
    codeLang: "sql",
    code: `SELECT
  column_name,
  table_name,
  ROUND(
    100.0 * SUM(CASE WHEN column_name IS NULL THEN 1 ELSE 0 END)
    / COUNT(*), 2
  ) AS null_pct
FROM information_schema.columns
JOIN your_table USING (column_name)
GROUP BY 1, 2
HAVING null_pct > 10
ORDER BY null_pct DESC;`,
  },
];

// ─── Quick-action prompts ──────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Find PII columns",
  "Check null rates",
  "Which tables feed mart_finance?",
  "Top drift risks today",
  "Explain churn_risk column",
  "Show schema lineage for orders",
];

// ─── AI reply pool ─────────────────────────────────────────────────────────────
const AI_REPLIES: Msg[] = [
  {
    id: "",
    role: "ai",
    text: "Scanning schema index… Found 3 columns matching your query. Top match: email in dim_customer — last drift event 14 minutes ago.",
  },
  {
    id: "",
    role: "ai",
    text: "Indexing lineage graph… orders_2026 flows through stg_orders → fact_orders → mart_finance. Total 4 hop depth, 6 downstream dependents.",
  },
  {
    id: "",
    role: "ai",
    text: "PII audit complete. Flagged columns: email, phone_number, cust_id. Recommend applying column-level encryption before next export.",
  },
  {
    id: "",
    role: "ai",
    text: "Here's the breakdown by null rate:",
    hasCode: true,
    codeLang: "json",
    code: `{
  "revenue_usd": "8.7% (↑ 3.1% vs baseline)",
  "last_login":  "12.3% (↑ 8.2% vs baseline)",
  "churn_risk":  "4.0% (within threshold)",
  "email":       "0.2% (format drift on 0.3% of rows)"
}`,
  },
];

// ─── Code block component ─────────────────────────────────────────────────────
function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative mt-3 overflow-hidden rounded-lg border border-slate-700/60">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-mono-tight text-[10px] uppercase tracking-wider text-slate-400">
            {lang ?? "code"}
          </span>
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 font-mono-tight text-[10px] text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-200"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-green-400"
              >
                <Check className="h-3 w-3" /> Copied
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> Copy
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      {/* Code body */}
      <pre className="overflow-x-auto bg-slate-900 px-4 py-3">
        <code className="font-mono-tight text-xs leading-relaxed text-slate-200 whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}

// ─── Chat bubble ──────────────────────────────────────────────────────────────
function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground shadow-[0_2px_12px_rgba(242,120,92,0.25)]"
            : "border border-border/60 bg-card/90 text-foreground"
        }`}
      >
        {!isUser && (
          <div className="mb-2 flex items-center gap-1.5 font-mono-tight text-[10px] uppercase tracking-wider text-primary">
            <BrandLogo className="h-3.5 w-3.5" />
            SchemaSense AI
          </div>
        )}
        <p className="leading-relaxed">{msg.text}</p>
        {msg.hasCode && msg.code && <CodeBlock code={msg.code} lang={msg.codeLang} />}
      </div>
    </motion.div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start"
    >
      <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/90 px-4 py-3">
        <span className="font-mono-tight text-[10px] text-muted-foreground mr-1">AI</span>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.14 }}
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function Ask() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyIdx = useRef(0);

  // Read voice preference from DOM dark class (same pattern as settings page)
  const isVoiceEnabled =
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("voice-enabled")
      : false;

  // Also read from localStorage as a simple cross-route state store
  const [voiceEnabled] = useState(() => {
    try {
      return localStorage.getItem("ss_voice") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = useCallback(
    (text: string) => {
      if (!text.trim() || typing) return;
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text }]);
      setInput("");
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const reply = {
          ...AI_REPLIES[replyIdx.current % AI_REPLIES.length],
          id: crypto.randomUUID(),
        };
        replyIdx.current += 1;
        setMessages((m) => [...m, reply]);
      }, 1200);
    },
    [typing],
  );

  const toggleListening = () => {
    setListening((v) => !v);
    // Simulates mic active → auto-insert a dummy transcript after 2s
    if (!listening) {
      setTimeout(() => {
        setListening(false);
        setInput("Find all columns with high null rates");
        inputRef.current?.focus();
      }, 2000);
    }
  };

  return (
    <div>
      <SectionTitle
        kicker="Ask AI"
        title={
          <>
            Chat with your <span className="text-primary">schema.</span>
          </>
        }
        sub="Ask anything about a column, lineage, drift, or data quality. SchemaSense answers instantly."
      />

      <GlassCard className="flex flex-col overflow-hidden" style={{ height: "70vh" }}>
        {/* ── Message thread ── */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
            {typing && <TypingIndicator key="typing" />}
          </AnimatePresence>
        </div>

        {/* ── Bottom input area ── */}
        <div className="border-t border-border/60 p-4 space-y-3">
          {/* Quick action chips */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-md border border-border/50 bg-secondary/40 px-3 py-1.5 font-mono-tight text-[11px] text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/8 hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/70 px-4 py-2.5 transition-all focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10"
          >
            {/* AI badge */}
            <div className="flex-shrink-0 flex items-center gap-1.5 font-mono-tight text-[10px] uppercase tracking-wider text-primary border-r border-border/60 pr-3 mr-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
              AI
            </div>

            {/* Text field */}
            <input
              ref={inputRef}
              id="ask-ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                listening ? "Listening…" : 'Ask: "Find PII columns" or "Explain churn_risk"'
              }
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              disabled={listening}
            />

            {/* Mic button — only if voice is enabled in Settings */}
            {voiceEnabled && (
              <motion.button
                type="button"
                onClick={toggleListening}
                whileTap={{ scale: 0.9 }}
                className={`relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md transition-all ${
                  listening
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
                aria-label={listening ? "Stop listening" : "Start voice input"}
              >
                {/* Pulsing ring when listening */}
                {listening && (
                  <motion.span
                    className="absolute inset-0 rounded-md border-2 border-primary"
                    animate={{ scale: [1, 1.25, 1], opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
                <Mic className="h-4 w-4 relative z-10" />
              </motion.button>
            )}

            {/* Send button */}
            <motion.button
              type="submit"
              disabled={!input.trim() || typing}
              whileTap={{ scale: 0.92 }}
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md transition-all ${
                input.trim() && !typing
                  ? "bg-primary text-primary-foreground shadow-[0_2px_10px_rgba(242,120,92,0.3)] hover:opacity-90"
                  : "text-muted-foreground/40 cursor-not-allowed"
              }`}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </motion.button>
          </form>

          {/* Hint */}
          <p className="font-mono-tight text-[10px] text-muted-foreground/50 text-center">
            Press <kbd className="rounded border border-border px-1 py-0.5 text-[9px]">Enter</kbd>{" "}
            to send · AI responses are illustrative
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
