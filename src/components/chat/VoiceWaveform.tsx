import React from "react";
import { useChatVoice } from "./ChatVoiceProvider";
import { motion } from "motion/react";

export function VoiceWaveform() {
  const { sttStatus, volumeLevels } = useChatVoice();

  if (sttStatus !== "listening" && sttStatus !== "recording") return null;

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-2xl flex items-center justify-between px-6 py-4 z-20 border border-primary/20 shadow-[inset_0_0_20px_rgba(242,120,92,0.02)] select-none">
      <div className="flex items-center gap-3">
        {/* Pulsing state dot */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
        <span className="text-xs font-mono-tight font-semibold text-foreground tracking-wide">
          {sttStatus === "listening" ? "Initializing microphone..." : "Listening... Speak now"}
        </span>
      </div>

      {/* Waveform Visualization Bars */}
      <div className="flex items-end gap-[3px] h-10 px-2 overflow-hidden max-w-[50%]">
        {volumeLevels.map((height, i) => (
          <motion.div
            key={i}
            className={`w-[3px] rounded-full shrink-0 ${
              sttStatus === "listening" ? "bg-muted-foreground" : "bg-primary shadow-[0_0_8px_rgba(242,120,92,0.3)]"
            }`}
            animate={{ height: `${height}px` }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
