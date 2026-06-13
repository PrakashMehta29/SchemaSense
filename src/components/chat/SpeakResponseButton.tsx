import React from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import { useChatVoice } from "./ChatVoiceProvider";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface SpeakResponseButtonProps {
  text: string;
  messageId: string;
}

export function SpeakResponseButton({ text, messageId }: SpeakResponseButtonProps) {
  const { activeSpeakingMessageId, ttsStatus, speakText, stopSpeaking } = useChatVoice();

  const isCurrentMessageSpeaking = activeSpeakingMessageId === messageId;
  const isReading = isCurrentMessageSpeaking && ttsStatus === "reading";

  const handleSpeakToggle = () => {
    if (isCurrentMessageSpeaking) {
      stopSpeaking();
    } else {
      speakText(text, messageId);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleSpeakToggle}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none ${
              isCurrentMessageSpeaking
                ? "border-primary/30 bg-primary/10 text-primary shadow-[0_0_10px_rgba(242,120,92,0.1)]"
                : "border-transparent text-muted-foreground/75 hover:text-foreground hover:bg-secondary/60 hover:border-border/30"
            }`}
            aria-label={
              isCurrentMessageSpeaking ? "Stop listening to response" : "Listen to response"
            }
          >
            {isCurrentMessageSpeaking ? (
              <>
                <VolumeX className="h-3.5 w-3.5 text-primary" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5" />
                <span>Listen</span>
              </>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="text-xs p-1.5 bg-background border text-foreground rounded-lg shadow-md"
        >
          {isCurrentMessageSpeaking ? "Stop voice playback" : "Read response aloud"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
