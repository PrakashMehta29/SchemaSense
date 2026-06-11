import React, { useState, useEffect, useRef } from "react";
import { Send, Mic, MessageSquare, Loader2, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ThinkingState } from "./ThinkingState";
import { AIResponseCard } from "./AIResponseCard";
import { SourcePanel } from "./SourcePanel";
import { QuickActionsBar } from "./QuickActionsBar";
import { simulateAIService, ThinkingStage, MockAIResponse } from "@/lib/chatService";
import { BrandLogo } from "@/components/BrandLogo";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  thinkingStages?: ThinkingStage[];
  contextCard?: MockAIResponse["contextCard"];
  sources?: string[];
}

interface ChatWindowProps {
  initialMessages?: Message[];
  onNewMessageSent?: (msg: Message) => void;
  onSelectPrompt?: string | null;
  onClearSelectPrompt?: () => void;
}

export function ChatWindow({ initialMessages = [], onNewMessageSent, onSelectPrompt, onClearSelectPrompt }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  const toggleListening = () => {
    if (isProcessing) return;

    if (!recognition) {
      // Fallback typing simulation if SpeechRecognition is not supported / blocked
      if (isListening) {
        setIsListening(false);
      } else {
        setIsListening(true);
        const sampleQuestions = [
          "Which columns are undocumented?",
          "What does customer_ltv mean?",
          "Where does revenue_usd come from?",
        ];
        const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
        setTimeout(() => {
          setInput(randomQuestion);
          setIsListening(false);
        }, 2200);
      }
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Handle outside prompt triggers (e.g. from insights sidebar)
  useEffect(() => {
    if (onSelectPrompt) {
      send(onSelectPrompt);
      if (onClearSelectPrompt) onClearSelectPrompt();
    }
  }, [onSelectPrompt]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const send = (text: string) => {
    if (!text.trim() || isProcessing) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      timestamp,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (onNewMessageSent) onNewMessageSent(userMsg);

    setInput("");
    setIsProcessing(true);

    const aiMsgId = crypto.randomUUID();
    let currentStages: ThinkingStage[] = [];

    // Append a placeholder AI message with thinking stages
    setMessages((prev) => [
      ...prev,
      {
        id: aiMsgId,
        role: "ai",
        text: "",
        timestamp,
        isStreaming: true,
        thinkingStages: [],
      },
    ]);

    simulateAIService(
      text,
      (updatedStages) => {
        currentStages = updatedStages;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId ? { ...msg, thinkingStages: updatedStages } : msg
          )
        );
      },
      (streamedText) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? { ...msg, text: streamedText, thinkingStages: undefined }
              : msg
          )
        );
      },
      (finalResponse) => {
        const finalMsg: Message = {
          id: aiMsgId,
          role: "ai",
          text: finalResponse.answer,
          timestamp,
          isStreaming: false,
          contextCard: finalResponse.contextCard,
          sources: finalResponse.sources,
        };

        setMessages((prev) =>
          prev.map((msg) => (msg.id === aiMsgId ? finalMsg : msg))
        );
        if (onNewMessageSent) onNewMessageSent(finalMsg);
        setIsProcessing(false);
      }
    );
  };

  const handleRegenerate = (originalPrompt: string, aiMsgId: string) => {
    // Remove the previous AI message and re-send the user's prompt
    setMessages((prev) => prev.filter((msg) => msg.id !== aiMsgId));
    setIsProcessing(false);
    send(originalPrompt);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">
      {/* ── Scrollable Messages Thread ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar flex flex-col"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <SuggestedQuestions onSelect={send} />
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto w-full">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              
              // Find the corresponding user prompt for regeneration
              const userPrompt = !isUser && idx > 0 ? messages[idx - 1].text : "";

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-start gap-3.5 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {/* Icon */}
                    <div className="shrink-0">
                      {isUser ? (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/80 border text-[10px] font-bold font-mono">
                          U
                        </span>
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary glow-lime shrink-0">
                          <BrandLogo className="h-4.5 w-4.5" />
                        </span>
                      )}
                    </div>

                    {/* Bubble */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] font-mono-tight text-muted-foreground uppercase tracking-wider">
                          {isUser ? "User Client" : "SchemaSense AI"}
                        </span>
                        <span className="text-[9px] text-muted-foreground/60">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`rounded-2xl border px-4.5 py-3 text-sm leading-relaxed ${
                          isUser
                            ? "bg-primary text-primary-foreground border-primary/30 shadow-[0_2px_12px_rgba(242,120,92,0.15)]"
                            : "bg-card/75 border-border/40 text-foreground backdrop-blur-md shadow-sm"
                        }`}
                      >
                        {/* Thinking stages loader block */}
                        {msg.thinkingStages && msg.thinkingStages.length > 0 ? (
                          <ThinkingState stages={msg.thinkingStages} />
                        ) : (
                          <>
                            <p className="whitespace-pre-line">{msg.text}</p>

                            {/* Streaming/Thinking loading indicator bar */}
                            {msg.isStreaming && !msg.text && (
                              <div className="flex items-center gap-1.5 py-1.5">
                                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                <span className="text-[11px] text-muted-foreground">Thinking...</span>
                              </div>
                            )}

                            {/* Context Card inline rendering */}
                            {msg.contextCard && <AIResponseCard card={msg.contextCard} />}

                            {/* Citations / Sources Panel */}
                            {msg.sources && <SourcePanel sources={msg.sources} />}

                            {/* Quick Action Toolbar */}
                            {!isUser && !msg.isStreaming && (
                              <QuickActionsBar
                                text={msg.text}
                                onRegenerate={() => handleRegenerate(userPrompt, msg.id)}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Prompt Input Bar ── */}
      <div className="border-t border-border/40 p-4 bg-secondary/15 flex-shrink-0">
        <div className="max-w-3xl mx-auto space-y-2.5">
          {/* Quick Suggestions Chips above Prompt Box when messages exist */}
          {messages.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-1.5">
              {[
                "What does customer_ltv mean?",
                "Which datasets contain PII?",
                "Where does revenue_usd come from?",
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="bg-background border border-border/60 hover:border-primary/30 text-[10px] text-muted-foreground hover:text-primary rounded-full px-3 py-1 transition-all cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="relative flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/80 p-4 transition-all focus-within:border-primary/45 focus-within:ring-2 focus-within:ring-primary/10 shadow-md max-w-3xl w-full mx-auto"
          >
            {/* Input field (now a textarea or large input for Claude/ChatGPT style!) */}
            <textarea
              ref={inputRef as any}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder='Ask anything about your data... e.g. "What does customer_ltv mean?"'
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 text-foreground resize-none pr-12 min-h-[50px] max-h-[160px] pb-6"
              disabled={isProcessing}
            />

            {/* Listening Waveform overlay */}
            {isListening && (
              <div className="absolute left-4 bottom-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full px-3 py-1 text-[11px] font-mono-tight select-none animate-pulse">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
                <span>Listening... Speak now</span>
                {/* Bouncing audio waveform */}
                <div className="flex items-end gap-0.5 h-3 ml-1.5 shrink-0">
                  {[0.4, 1.0, 0.6, 1.2, 0.5, 0.8].map((val, idx) => (
                    <motion.div
                      key={idx}
                      className="w-[1.5px] bg-red-500 rounded-full"
                      initial={{ height: "3px" }}
                      animate={{ height: ["3px", `${val * 10}px`, "3px"] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: idx * 0.08,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between border-t border-border/20 pt-3 mt-1.5">
              {/* Left actions: AI Indicator status */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 font-mono-tight text-[10px] uppercase tracking-wider text-primary bg-primary/5 border border-primary/20 rounded-md px-2 py-0.5 select-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  AI Agent
                </div>
                {isProcessing && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
                    Thinking...
                  </span>
                )}
              </div>

              {/* Right actions: Mic & Send Buttons */}
              <div className="flex items-center gap-2">
                {/* Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isProcessing}
                  className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                    isListening
                      ? "border-red-500/30 bg-red-500/15 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)] animate-pulse"
                      : "border-border/60 bg-background text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                  title="Voice Input"
                >
                  <Mic className="h-4.5 w-4.5" />
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isProcessing || isListening}
                  className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl transition-all cursor-pointer ${
                    input.trim() && !isProcessing && !isListening
                      ? "bg-primary text-primary-foreground shadow-[0_2px_12px_rgba(242,120,92,0.25)] hover:opacity-95"
                      : "text-muted-foreground/40 bg-secondary/25 cursor-not-allowed border border-transparent"
                  }`}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>

          <p className="font-mono-tight text-[10px] text-muted-foreground/40 text-center">
            Memory enabled · context resolved recursively · Press <kbd className="rounded border border-border px-1 py-0.5 text-[9px]">Enter</kbd> to send
          </p>
        </div>
      </div>
    </div>
  );
}
