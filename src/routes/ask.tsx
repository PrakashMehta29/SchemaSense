import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { GlassCard, Pill, SectionTitle } from "@/components/ui-bits";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/ask")({
  head: () => ({ meta: [{ title: "Ask AI · SchemaSense" }] }),
  component: Ask,
});

type Msg = { id: string; role: "user" | "ai"; text: string };

const seed: Msg[] = [
  { id: "1", role: "user", text: "What does cust_id mean?" },
  { id: "2", role: "ai", text: "cust_id is a uuid uniquely identifying each customer. It originates in raw.users and propagates to stg_customers and dim_customer. It is non-nullable and tagged as PII." },
  { id: "3", role: "user", text: "Which columns are most at risk of drift?" },
  { id: "4", role: "ai", text: "Top 3: revenue_usd (8.7% null spike), last_login (12.3% nulls today vs 4.1% baseline), and email (format drift detected on 0.3% of rows). I'd open Anomalies → Drift to inspect." },
];

const suggestions = [
  "What does churn_risk mean?",
  "Show me PII columns",
  "Which tables feed mart_finance?",
  "Summarize today's anomalies",
];

function Ask() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const id = crypto.randomUUID();
    setMessages((m) => [...m, { id, role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, {
        id: crypto.randomUUID(),
        role: "ai",
        text: "Indexing schema… here is what I found: that column is referenced in 4 downstream models. Its definition was last refined 2 hours ago and matches the source contract.",
      }]);
    }, 1100);
  };

  return (
    <div>
      <SectionTitle
        kicker="Step 03 / Ask AI"
        title={<>Chat with your <span className="text-primary">schema.</span></>}
        sub="Ask anything about a column, a table, or the lineage between them. SchemaSense answers in real time."
      />

      <GlassCard className="flex h-[68vh] flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/60 bg-card/80 text-foreground"
                }`}>
                  {m.role === "ai" && (
                    <div className="mb-2 flex items-center gap-1.5 font-mono-tight text-[10px] uppercase tracking-wider text-primary">
                      <BrandLogo className="h-4 w-4" /> SchemaSense
                    </div>
                  )}
                  {m.text}
                </div>
              </motion.div>
            ))}
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-1 rounded-2xl border border-border/60 bg-card/80 px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-border/60 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs hover:border-primary/40 hover:text-primary">
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2"
          >
            <Pill tone="lime">AI</Pill>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Ask: "What does cust_id mean?"'
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground glow-lime">
              Send <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}