import React from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useChatVoice } from "./ChatVoiceProvider";

interface VoicePlaybackControlsProps {
  messageId: string;
}

export function VoicePlaybackControls({ messageId }: VoicePlaybackControlsProps) {
  const {
    activeSpeakingMessageId,
    ttsStatus,
    isSpeaking,
    isPaused,
    playbackTime,
    playbackDuration,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
  } = useChatVoice();

  // Only display if this message is currently speaking/active
  if (activeSpeakingMessageId !== messageId) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const progressPercent = playbackDuration > 0 ? (playbackTime / playbackDuration) * 100 : 0;

  return (
    <div className="mt-3.5 p-3.5 rounded-2xl border border-primary/20 bg-primary/5 select-none space-y-2.5 max-w-sm animate-in slide-in-from-top-2 duration-300">
      {/* Status & Timing */}
      <div className="flex items-center justify-between text-xs font-mono-tight text-foreground font-semibold">
        <div className="flex items-center gap-1.5 text-primary">
          <Volume2 className="h-3.5 w-3.5 animate-pulse" />
          <span>Speaking</span>
        </div>
        <div className="text-muted-foreground">
          {formatTime(playbackTime)} / {formatTime(playbackDuration)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-1 bg-border rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-100 ease-out shadow-[0_0_8px_rgba(242,120,92,0.4)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 pt-0.5">
        {isSpeaking ? (
          <button
            onClick={pauseSpeaking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground hover:bg-secondary transition-all cursor-pointer font-semibold"
          >
            <Pause className="h-3 w-3 fill-current" />
            <span>Pause</span>
          </button>
        ) : isPaused ? (
          <button
            onClick={resumeSpeaking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/10 text-xs text-primary hover:bg-primary/20 transition-all cursor-pointer font-semibold animate-pulse"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Resume</span>
          </button>
        ) : null}

        <button
          onClick={stopSpeaking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/20 bg-destructive/5 text-xs text-destructive hover:bg-destructive/10 transition-all cursor-pointer font-semibold"
        >
          <Square className="h-3 w-3 fill-current" />
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
}
