import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { MessageSquare, Database, History, Plus, Brain } from "lucide-react";
import { SectionTitle, GlassCard } from "@/components/ui-bits";
import { EmptyState } from "@/components/EmptyState";
import { motion, AnimatePresence } from "motion/react";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { AIInsightsSidebar } from "@/components/chat/AIInsightsSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { MOCK_CONVERSATIONS, ChatConversation } from "@/lib/mockConversationData";
import { getDatasets, getActiveDatasetName, switchDataset } from "@/lib/demoModeService";
import { useWorkspace } from "@/lib/WorkspaceContext";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Ask Your Data · SchemaSense" },
      {
        name: "description",
        content:
          "Interactive AI Agent workspace. Ask questions about your enterprise dataset schemas.",
      },
    ],
  }),
  component: ChatRouteComponent,
});

function ChatRouteComponent() {
  const { hasDataset } = useWorkspace();
  const [datasetName, setDatasetName] = useState("customers.csv");
  const [availableDatasets, setAvailableDatasets] = useState<string[]>([]);

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [triggerPrompt, setTriggerPrompt] = useState<string | null>(null);

  // Collapsible drawers state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  // Load dataset checks and conversation logs
  useEffect(() => {
    try {
      const activeDs = getActiveDatasetName();
      setDatasetName(activeDs);

      // Load available datasets
      const dsList = getDatasets();
      if (dsList.length > 0) {
        setAvailableDatasets(dsList.map((d) => d.name));
      } else {
        setAvailableDatasets(["customers.csv"]);
      }

      // Initialize default conversations
      const savedHistory = localStorage.getItem("schema_sense_all_conversations");
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setConversations(parsedHistory);
        if (parsedHistory.length > 0) {
          setActiveConvId(parsedHistory[0].id);
        }
      } else {
        setConversations(MOCK_CONVERSATIONS);
        setActiveConvId(MOCK_CONVERSATIONS[0].id);
        localStorage.setItem("schema_sense_all_conversations", JSON.stringify(MOCK_CONVERSATIONS));
      }
    } catch (err) {
      console.warn("Could not read conversations from localStorage:", err);
    }
  }, []);

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
  };

  const handleNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: ChatConversation = {
      id: newId,
      title: `Conversation ${conversations.length + 1}`,
      preview: "Empty conversation thread",
      messages: [],
    };

    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveConvId(newId);

    try {
      localStorage.setItem("schema_sense_all_conversations", JSON.stringify(updated));
    } catch (err) {
      console.warn("Could not save new conversation to localStorage:", err);
    }
  };

  const handleMessageSent = (msg: { role: string; text: string }) => {
    if (!activeConvId) return;

    const updated = conversations.map((conv) => {
      if (conv.id === activeConvId) {
        const msgs = [...conv.messages, msg];
        return {
          ...conv,
          preview: msg.role === "user" ? msg.text : conv.preview,
          messages: msgs,
        };
      }
      return conv;
    });

    setConversations(updated);
    try {
      localStorage.setItem("schema_sense_all_conversations", JSON.stringify(updated));
    } catch (err) {
      console.warn("Could not save updated message list to localStorage:", err);
    }
  };

  const handleSelectInsightPrompt = (prompt: string) => {
    setTriggerPrompt(prompt);
  };

  const handleDatasetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextDsName = e.target.value;
    setDatasetName(nextDsName);
    switchDataset(nextDsName);
    window.location.reload(); // Re-sync columns and session schemas
  };

  const activeMessages = conversations.find((c) => c.id === activeConvId)?.messages || [];

  // 1. Show empty state if no dataset is uploaded
  if (!hasDataset) {
    return (
      <div className="py-12 space-y-8">
        <SectionTitle
          kicker="Chat AI"
          title={
            <>
              Ask Your <span className="text-primary">Data.</span>
            </>
          }
          sub="Understand constraints, lineages, and governance attributes using standard natural language queries."
        />
        <div className="mt-8">
          <EmptyState
            title="No Dataset Connected"
            description="Upload a dataset to unlock semantic search, schema lineage queries, and compliance answers."
            features={[
              "Natural language dataset search",
              "Column usage & definitions citations",
              "Automated diagnostic question suggestions",
              "Multi-turn context memory",
            ]}
            onSecondaryAction={() => {
              enableDemoMode();
              refreshWorkspace();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px] border border-border/40 bg-card/10 rounded-2xl overflow-hidden shadow-sm relative">
      {/* ── Header Toolbar ── */}
      <div className="flex items-center justify-between border-b border-border/40 bg-secondary/15 px-5 py-3.5 flex-shrink-0 z-10 relative">
        {/* Left Actions: History Toggle & New Chat */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isHistoryOpen
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border/60 bg-background hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle History"
          >
            <History className="h-4 w-4" />
          </button>

          <button
            onClick={handleNewConversation}
            className="p-2 rounded-xl border border-border/60 bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="New Conversation"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Center: Dataset Selector */}
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-1.5 shadow-sm">
          <Database className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] font-mono-tight uppercase tracking-wider text-muted-foreground select-none">
            Dataset:
          </span>
          <select
            value={datasetName}
            onChange={handleDatasetChange}
            className="bg-transparent text-xs font-mono-tight font-bold text-foreground border-none outline-none cursor-pointer"
          >
            {availableDatasets.map((ds) => (
              <option key={ds} value={ds}>
                {ds}
              </option>
            ))}
          </select>
        </div>

        {/* Right Actions: Collapsible Insights Toggle */}
        <button
          onClick={() => setIsInsightsOpen(!isInsightsOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            isInsightsOpen
              ? "border-primary/30 bg-primary/10 text-primary shadow-[0_0_15px_rgba(242,120,92,0.1)]"
              : "border-border/60 bg-background hover:bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <Brain className="h-3.5 w-3.5" />
          <span>Insights</span>
        </button>
      </div>

      {/* ── Main Workspace Panels Grid (Relative to support slide-over drawers) ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Central Chat Window (Hero Area - always visible, occupies full layout) */}
        <ChatWindow
          initialMessages={activeMessages}
          onNewMessageSent={handleMessageSent}
          onSelectPrompt={triggerPrompt}
          onClearSelectPrompt={() => setTriggerPrompt(null)}
        />

        {/* Backdrop Overlay (closes drawers when clicked) */}
        {(isHistoryOpen || isInsightsOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsHistoryOpen(false);
              setIsInsightsOpen(false);
            }}
            className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-15 cursor-pointer"
          />
        )}

        {/* Left Drawer: Slide-over Conversation History */}
        <AnimatePresence>
          {isHistoryOpen && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 bottom-0 w-64 bg-card/95 backdrop-blur-xl border-r border-border/40 z-20 shadow-2xl flex flex-col"
            >
              <ConversationSidebar
                conversations={conversations}
                activeId={activeConvId}
                onSelect={(id) => {
                  handleSelectConversation(id);
                  setIsHistoryOpen(false); // Auto close on select
                }}
                onNewChat={handleNewConversation}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Drawer: Slide-over Suggested Insights */}
        <AnimatePresence>
          {isInsightsOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-card/95 backdrop-blur-xl border-l border-border/40 z-20 shadow-2xl flex flex-col"
            >
              <AIInsightsSidebar
                onSelectPrompt={(p) => {
                  handleSelectInsightPrompt(p);
                  setIsInsightsOpen(false); // Auto close on select
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
