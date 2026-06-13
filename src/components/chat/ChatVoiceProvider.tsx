import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export type STTStatus = "idle" | "listening" | "recording" | "transcribing" | "completed" | "error";
export type TTSStatus = "idle" | "reading" | "paused" | "completed";

interface ChatVoiceContextProps {
  // STT States & Functions
  sttStatus: STTStatus;
  transcript: string;
  setTranscript: (text: string) => void;
  startListening: () => void;
  stopListening: () => void;
  cancelListening: () => void;
  volumeLevels: number[];
  sttError: string;

  // TTS States & Functions
  ttsStatus: TTSStatus;
  isSpeaking: boolean;
  isPaused: boolean;
  activeSpeakingMessageId: string | null;
  playbackTime: number;
  playbackDuration: number;
  speakText: (text: string, messageId: string, lang?: string) => void;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;
  stopSpeaking: () => void;
}

const ChatVoiceContext = createContext<ChatVoiceContextProps | undefined>(undefined);

const BARS_COUNT = 20;

export function ChatVoiceProvider({ children }: { children: React.ReactNode }) {
  // STT internal state
  const [sttStatus, setSttStatus] = useState<STTStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [volumeLevels, setVolumeLevels] = useState<number[]>(new Array(BARS_COUNT).fill(4));
  const [sttError, setSttError] = useState("");

  // TTS internal state
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>("idle");
  const [activeSpeakingMessageId, setActiveSpeakingMessageId] = useState<string | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // Speech Recognition Refs
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);

  // VAD Refs
  const lastSpeechTimeRef = useRef<number>(0);
  const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // TTS Ref
  const ttsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Helper: check speech recognition support
  const getSpeechRecognition = () => {
    if (typeof window === "undefined") return null;
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Speech to Text (STT) Logic
  // ──────────────────────────────────────────────────────────────────────────

  const cleanUpSTT = () => {
    // Stop VAD
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    // Stop animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    // Stop SpeechRecognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
    }
    // Stop microphone stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    // Close AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    // Reset volume levels
    setVolumeLevels(new Array(BARS_COUNT).fill(4));
  };

  const startListening = async () => {
    cleanUpSTT();
    setTranscript("");
    setSttError("");

    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) {
      toast.error("Speech recognition is not supported in this browser.");
      setSttStatus("error");
      setSttError("Speech recognition not supported");
      return;
    }

    try {
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up web audio analyser for waveform rendering and VAD
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      // Set up recognition
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      recognitionRef.current = rec;

      setSttStatus("listening");

      rec.onstart = () => {
        setSttStatus("recording");
        lastSpeechTimeRef.current = performance.now();
        startVAD();
        startWaveformAnimation();
      };

      let finalTranscript = "";
      rec.onresult = (event: any) => {
        let interimText = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript + interimText);
        lastSpeechTimeRef.current = performance.now();
      };

      rec.onerror = (event: any) => {
        if (event.error !== "no-speech") {
          console.error("Speech recognition error:", event.error);
          setSttStatus("error");
          setSttError(event.error);
          toast.error(`Voice input error: ${event.error}`);
          cleanUpSTT();
        }
      };

      rec.onend = () => {
        setSttStatus("transcribing");
        // Short delay to simulate transcription before completion
        setTimeout(() => {
          setSttStatus("completed");
          toast.success("Voice recognized successfully");
          cleanUpSTT();
        }, 800);
      };

      rec.start();
    } catch (err) {
      console.error("Microphone access blocked:", err);
      toast.error("Microphone permission required to use voice input.");
      setSttStatus("idle");
    }
  };

  const startVAD = () => {
    lastSpeechTimeRef.current = performance.now();
    vadIntervalRef.current = setInterval(() => {
      // 3 seconds of silence auto-stops the mic
      if (performance.now() - lastSpeechTimeRef.current > 3000) {
        stopListening();
      }
    }, 1000);
  };

  const startWaveformAnimation = () => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (sttStatus === "error" || sttStatus === "idle") return;
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const step = Math.floor(bufferLength / BARS_COUNT);
      const newLevels: number[] = [];
      let sum = 0;

      for (let i = 0; i < BARS_COUNT; i++) {
        const value = dataArray[i * step] || 0;
        sum += value;
        // Map 0-255 frequency amplitude to 4px - 40px height range
        const height = 4 + (value / 255) * 36;
        newLevels.push(height);
      }

      // If average volume is significant, update VAD timer
      const averageVolume = sum / BARS_COUNT;
      if (averageVolume > 8) {
        lastSpeechTimeRef.current = performance.now();
      }

      setVolumeLevels(newLevels);
    };

    draw();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setSttStatus("transcribing");
  };

  const cancelListening = () => {
    cleanUpSTT();
    setTranscript("");
    setSttStatus("idle");
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Text to Speech (TTS) Logic
  // ──────────────────────────────────────────────────────────────────────────

  const cleanUpTTS = () => {
    if (ttsIntervalRef.current) {
      clearInterval(ttsIntervalRef.current);
      ttsIntervalRef.current = null;
    }
    currentUtteranceRef.current = null;
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    cleanUpTTS();
    setTtsStatus("idle");
    setActiveSpeakingMessageId(null);
    setPlaybackTime(0);
    setPlaybackDuration(0);
  };

  const pauseSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setTtsStatus("paused");
    }
  };

  const resumeSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setTtsStatus("reading");
    }
  };

  const speakText = (text: string, messageId: string, lang = "en-US") => {
    stopSpeaking(); // Cancel any existing speech first

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Text to speech is not supported in this browser.");
      return;
    }

    // Estimate speaking duration (words / 2.3 average words per second)
    const wordsCount = text.split(/\s+/).filter(Boolean).length;
    const estDuration = Math.max(1, Math.round(wordsCount / 2.3));
    setPlaybackDuration(estDuration);
    setPlaybackTime(0);
    setActiveSpeakingMessageId(messageId);
    setTtsStatus("reading");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    currentUtteranceRef.current = utterance;

    // Google/Custom Voice Selection logic
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find(
        (v) => v.name.includes("Google") && v.lang.startsWith(lang.split("-")[0]),
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else {
        const fallbackVoice = voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
        if (fallbackVoice) utterance.voice = fallbackVoice;
      }
    }

    utterance.onstart = () => {
      toast.info("Reading response aloud");
      let timeElapsed = 0;

      // Start elapsed timer
      ttsIntervalRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          timeElapsed += 0.1;
          setPlaybackTime(Math.min(timeElapsed, estDuration));
        }
      }, 100);
    };

    utterance.onboundary = (event) => {
      // Sync progress via character indexes
      if (event.name === "word") {
        const progressRatio = event.charIndex / text.length;
        setPlaybackTime(progressRatio * estDuration);
      }
    };

    utterance.onend = () => {
      setTtsStatus("completed");
      toast.success("Playback complete");
      stopSpeaking();
    };

    utterance.onerror = (event) => {
      if (event.error !== "interrupted") {
        console.error("TTS speech error:", event);
        toast.error("An error occurred during voice playback.");
        stopSpeaking();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Clean up all hooks on unmount
  useEffect(() => {
    return () => {
      cleanUpSTT();
      cleanUpTTS();
    };
  }, []);

  return (
    <ChatVoiceContext.Provider
      value={{
        sttStatus,
        transcript,
        setTranscript,
        startListening,
        stopListening,
        cancelListening,
        volumeLevels,
        sttError,

        ttsStatus,
        isSpeaking: ttsStatus === "reading",
        isPaused: ttsStatus === "paused",
        activeSpeakingMessageId,
        playbackTime,
        playbackDuration,
        speakText,
        pauseSpeaking,
        resumeSpeaking,
        stopSpeaking,
      }}
    >
      {children}
    </ChatVoiceContext.Provider>
  );
}

export function useChatVoice() {
  const context = useContext(ChatVoiceContext);
  if (context === undefined) {
    throw new Error("useChatVoice must be used within a ChatVoiceProvider");
  }
  return context;
}
