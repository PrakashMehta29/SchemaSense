import React from "react";
import { MessageSquare, Plus, Clock, Terminal } from "lucide-react";
import { ChatConversation } from "@/lib/mockConversationData";

interface ConversationSidebarProps {
  conversations: ChatConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

export function ConversationSidebar({ conversations, activeId, onSelect, onNewChat }: ConversationSidebarProps) {
  return (
    <aside className="w-64 h-full flex-shrink-0 border-r border-border/40 bg-secondary/15 flex flex-col p-4">
      {/* New Conversation Button */}
      <button
        onClick={onNewChat}
        className="flex items-center justify-center gap-2 w-full rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20 active:scale-[0.98] mb-6 shadow-sm cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        New Conversation
      </button>

      {/* Title */}
      <div className="flex items-center gap-2 text-[10px] font-mono-tight text-muted-foreground uppercase tracking-widest px-2 mb-3">
        <Clock className="h-3.5 w-3.5" />
        <span>Recent Activity</span>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
        {conversations.map((conv) => {
          const isActive = activeId === conv.id;
          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left rounded-xl p-3 border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                isActive
                  ? "border-primary/20 bg-primary/8 text-primary shadow-[inset_0_0_12px_rgba(242,120,92,0.03)]"
                  : "border-transparent text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2 font-bold truncate">
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </div>
              <span className="text-[10px] text-muted-foreground/80 line-clamp-1 truncate font-mono-tight">
                {conv.preview}
              </span>
            </button>
          );
        })}
        {conversations.length === 0 && (
          <div className="text-[11px] text-muted-foreground/60 italic text-center py-6">
            No active conversation logs.
          </div>
        )}
      </div>

      {/* Sidebar Info footer */}
      <div className="mt-auto border-t border-border/30 pt-4 flex flex-col gap-2">
        <div className="rounded-xl border border-border/30 bg-background/50 p-3 flex flex-col gap-1 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono-tight">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse glow-lime shrink-0" />
            <Terminal className="h-3 w-3 shrink-0" />
            Context Memory Enabled
          </div>
          <span className="text-[9px] text-muted-foreground/85 font-mono-tight mt-0.5">
            AI tracks nouns to maintain multi-turn answers.
          </span>
        </div>
      </div>
    </aside>
  );
}
