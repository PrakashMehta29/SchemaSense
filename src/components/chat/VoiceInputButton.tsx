import React from "react";
import { Mic, Loader2, Square } from "lucide-react";
import { useChatVoice } from "./ChatVoiceProvider";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export function VoiceInputButton({ disabled }: { disabled?: boolean }) {
  const { sttStatus, startListening, stopListening } = useChatVoice();

  const handleMicClick = () => {
    if (sttStatus === "listening" || sttStatus === "recording") {
      stopListening();
    } else {
      startListening();
    }
  };

  const isRecording = sttStatus === "recording";
  const isListening = sttStatus === "listening";
  const isTranscribing = sttStatus === "transcribing";

  // Compute button styles based on state
  let btnClasses =
    "border-border/60 bg-background text-muted-foreground hover:text-foreground hover:bg-secondary";
  if (isRecording) {
    btnClasses =
      "border-red-500/30 bg-red-500/15 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-pulse";
  } else if (isListening) {
    btnClasses = "border-primary/30 bg-primary/15 text-primary animate-pulse";
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleMicClick}
            disabled={disabled || isTranscribing}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all cursor-pointer select-none shrink-0 ${btnClasses} disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label={
              isRecording
                ? "Stop voice recording"
                : isTranscribing
                  ? "Transcribing speech"
                  : "Start voice input"
            }
          >
            {isTranscribing ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : isRecording ? (
              <Square className="h-4 w-4 fill-current animate-pulse text-red-500" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="text-xs p-2 bg-background border text-foreground rounded-lg shadow-md z-55"
        >
          {isRecording
            ? "Stop Recording (Autostops on silence)"
            : isTranscribing
              ? "Converting voice to text..."
              : "Ask with Voice"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
