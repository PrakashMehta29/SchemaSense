import React, { useState, useEffect, useRef } from "react";
import { Mic, Send, Trash2, Pause, Play, Volume2 } from "lucide-react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/ui-bits";

type VoiceState = "idle" | "recording" | "paused" | "sent";

interface HistoryItem {
  id: string;
  query: string;
  response: string;
  lang: string;
}

const LANGUAGE_OPTIONS = [
  { code: "en-US", name: "English", text: "This feature is in progress." },
  { code: "hi-IN", name: "Hindi", text: "यह सुविधा अभी प्रगति पर है।" },
  { code: "pa-IN", name: "Punjabi", text: "ਇਹ ਵਿਸ਼ੇਸ਼ਤਾ ਪ੍ਰਗਤੀ ਵਿੱਚ ਹੈ।" },
  { code: "mr-IN", name: "Marathi", text: "हे वैशिष्ट्य प्रगतीपथावर आहे." },
  { code: "ur-PK", name: "Urdu", text: "یہ فیچر ابھی جاری ہے۔" },
  { code: "fr-FR", name: "French", text: "Cette fonctionnalité est en cours de développement." },
  { code: "de-DE", name: "German", text: "Diese Funktion ist in Bearbeitung." },
];

const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
};

export function TextToSpeechSense() {
  const [state, setState] = useState<VoiceState>("idle");
  const stateRef = useRef<VoiceState>("idle"); 
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [duration, setDuration] = useState(0);
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // VAD (Voice Activity Detection) Refs
  const lastSpeechTimeRef = useRef<number>(0);
  const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const historyEndRef = useRef<HTMLDivElement | null>(null);

  const barsCount = 30;
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("voice-history");
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load history", e);
    }

    // Pre-load voices and handle async loading
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    // Generate Dynamic Suggestions
    try {
      const dictStr = localStorage.getItem("schema_sense_dictionary_metadata");
      if (dictStr) {
        const dictMeta = JSON.parse(dictStr);
        const columns = Object.keys(dictMeta);
        
        if (columns.length > 0) {
          const shuffled = [...columns].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 3);
          
          const newSuggestions = selected.map((col, idx) => {
            const meta = dictMeta[col];
            if (idx === 0 && meta.relations && meta.relations.length > 0) {
              return `What is the relation of ${col}?`;
            }
            if (idx === 1 || (!meta.relations || meta.relations.length === 0 && idx === 0)) {
              return `Definition of ${col}`;
            }
            return `What is the risk score of ${col}?`;
          });
          
          setSuggestions(newSuggestions);
        }
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem("voice-history", JSON.stringify(history));
    if (history.length > 0 && state === "sent") {
      setTimeout(() => {
        historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [history]);

  useEffect(() => {
    if (dropdownRef.current) {
      gsap.fromTo(dropdownRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
    }
  }, []);

  const startVAD = () => {
    if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
    lastSpeechTimeRef.current = performance.now();
    vadIntervalRef.current = setInterval(() => {
      if (stateRef.current === "recording") {
        if (performance.now() - lastSpeechTimeRef.current > 3000) {
          pauseRecording();
        }
      }
    }, 1000);
  };

  const stopVAD = () => {
    if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === "recording") {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    const SpeechRec = getSpeechRecognition();
    if (SpeechRec) {
      recognitionRef.current = new SpeechRec();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        // We do NOT block processing based on stateRef.current anymore. 
        // We want to capture the trailing/final results even if auto-paused just milliseconds ago.
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error !== "no-speech") {
           stopRecording();
           setState("idle");
        }
      };
    }
    
    return () => {
      stopRecording();
    };
  }, []);

  const drawVisualizer = () => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      if (stateRef.current === "recording") {
        const step = Math.floor(bufferLength / barsCount);
        let sum = 0;
        
        for (let i = 0; i < barsCount; i++) {
          const value = dataArray[i * step] || 0;
          sum += value;
          const height = 4 + (value / 255) * 36;
          
          if (barsRef.current[i]) {
            gsap.set(barsRef.current[i], { height: height });
          }
        }
        
        const averageVolume = sum / barsCount;
        // If volume is above background noise threshold, update last speech time
        if (averageVolume > 8) {
          lastSpeechTimeRef.current = performance.now();
        }
        
      } else if (stateRef.current === "paused") {
        for (let i = 0; i < barsCount; i++) {
          if (barsRef.current[i]) {
            gsap.set(barsRef.current[i], { height: 4 });
          }
        }
      }
    };
    
    draw();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128; 
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      if (recognitionRef.current) {
        // Sync the listening language with the user's dropdown selection!
        recognitionRef.current.lang = selectedLang;
        try { recognitionRef.current.start(); } catch(e) {}
      }

      setState("recording");
      setTranscript("");
      setAiResponse("");
      setDuration(0);
      
      startVAD();
      setTimeout(drawVisualizer, 100);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone permission is required to use this feature.");
    }
  };

  const stopRecording = () => {
    stopVAD();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  const pauseRecording = () => {
    stopVAD();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    setState("paused");
  };

  const resumeRecording = () => {
    if (recognitionRef.current) {
       try { recognitionRef.current.start(); } catch(e) {}
    }
    setState("recording");
    startVAD();
  };

  const cancelRecording = () => {
    stopRecording();
    setState("idle");
    setTranscript("");
    setDuration(0);
  };

  const speakText = (text: string, langCode: string = "en-US") => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        if (langCode.startsWith("en")) {
          const googleEn = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en"));
          if (googleEn) utterance.voice = googleEn;
        } else {
          const googleLang = voices.find(v => v.name.includes("Google") && v.lang.startsWith(langCode.split('-')[0]));
          if (googleLang) utterance.voice = googleLang;
          else {
            const fallbackVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
            if (fallbackVoice) utterance.voice = fallbackVoice;
          }
        }
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const resetState = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setState("idle");
  };

  const processQuery = (queryText: string): string => {
    if (!queryText) return "I didn't catch that. Please try asking again.";
    
    let dictMeta: Record<string, any> = {};
    let govAssets: any[] = [];
    
    try {
      const dictStr = localStorage.getItem("schema_sense_dictionary_metadata");
      if (dictStr) dictMeta = JSON.parse(dictStr);
      const govStr = localStorage.getItem("schema_sense_governance_assets");
      if (govStr) govAssets = JSON.parse(govStr);
    } catch(e) {}

    const text = queryText.toLowerCase();
    
    // 1. Detect Intent
    const isGov = text.includes("governance") || text.includes("risk") || text.includes("pii") || text.includes("tag") || text.includes("sensitive") || text.includes("score") || text.includes("compliance");
    const isDict = text.includes("dictionary") || text.includes("meaning") || text.includes("definition") || text.includes("type") || text.includes("null") || text.includes("unique");
    const isLin = text.includes("lineage") || text.includes("depends") || text.includes("relation") || text.includes("upstream") || text.includes("downstream") || text.includes("source");
    const isQual = text.includes("quality") || text.includes("health") || text.includes("anomaly") || text.includes("valid");

    // 2. Extract Column Entity
    const availableColumns = Object.keys(dictMeta);
    let matchedCol = "";
    for (const col of availableColumns) {
      if (text.includes(col.toLowerCase())) {
        matchedCol = col;
        break;
      }
    }

    // Second try custom context tags overlap
    if (!matchedCol) {
      for (const col of availableColumns) {
        const ctx = dictMeta[col]?.context?.toLowerCase() || "";
        if (ctx.length > 3 && text.length > 3) {
           const words = text.split(" ");
           for (const w of words) {
             if (w.length > 4 && ctx.includes(w)) {
               matchedCol = col;
               break;
             }
           }
           if (text.includes(ctx) || ctx.includes(text)) {
             matchedCol = col;
           }
        }
        if (matchedCol) break;
      }
    }

    // 3. Formulate Response
    if (matchedCol) {
      const meta = dictMeta[matchedCol];
      const gov = govAssets.find((g: any) => g.columnName === matchedCol);

      if (isGov && gov) {
        return `[Governance] The column '${matchedCol}' has a risk score of ${gov.riskScore}. It is tagged as ${gov.tags.join(", ")}. Risk reason: ${gov.riskReason}`;
      } else if (isLin && meta) {
        const rels = meta.relations && meta.relations.length > 0 ? meta.relations.join(" and ") : "no known relations";
        return `[Lineage] The column '${matchedCol}' has ${rels}.`;
      } else if (isQual && meta) {
        return `[Quality] The column '${matchedCol}' has a null rate of ${meta.nullPct} and a uniqueness of ${meta.uniquePct}.`;
      } else {
        // Default to dictionary
        return `[Dictionary] '${matchedCol}' is a ${meta.type} field. It means: ${meta.meaning}`;
      }
    } else {
      // No specific column matched
      if (isGov) {
         const piiCount = govAssets.filter((g: any) => g.tags.includes("PII")).length;
         return `[Governance] You currently have ${govAssets.length} governed assets, with ${piiCount} tagged as PII. Please specify a column name for details.`;
      } else if (isDict) {
         return `[Dictionary] There are ${availableColumns.length} columns documented in your schema. Please ask about a specific column like '${availableColumns[0] || 'email'}'.`;
      } else if (isLin) {
         return `[Lineage] To check lineage, please mention a specific column name to see its upstream and downstream relations.`;
      } else if (isQual) {
         return `[Quality] The overall dataset health looks stable. Ask about a specific column for null and validation rates.`;
      }
    }

    const exampleCol = availableColumns.length > 0 ? availableColumns[0] : "email";
    return `I couldn't identify a specific module or column in your query. Please try asking about your dataset, for example: 'What is the risk score for ${exampleCol}?' or 'Show me the definition for ${exampleCol}'.`;
  };

  const handleSend = () => {
    stopRecording();
    setState("sent");
    
    const selectedOption = LANGUAGE_OPTIONS.find(opt => opt.code === selectedLang) || LANGUAGE_OPTIONS[0];
    
    // Generate AI response via our local query engine
    const query = transcript || "No speech detected";
    const responseText = processQuery(query);
    
    setAiResponse(responseText);
    speakText(responseText, selectedOption.code);

    setHistory(prev => [
      ...prev, 
      { 
        id: Date.now().toString(), 
        query: query, 
        response: responseText, 
        lang: selectedOption.code 
      }
    ]);
  };

  const handleDirectQuery = (queryText: string) => {
    const selectedOption = LANGUAGE_OPTIONS.find(opt => opt.code === selectedLang) || LANGUAGE_OPTIONS[0];
    const responseText = processQuery(queryText);
    
    setTranscript(queryText);
    setState("sent");
    setAiResponse(responseText);
    speakText(responseText, selectedOption.code);

    setHistory(prev => [
      ...prev, 
      { 
        id: Date.now().toString(), 
        query: queryText, 
        response: responseText, 
        lang: selectedOption.code 
      }
    ]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("voice-history");
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <GlassCard className="relative p-8 flex flex-col items-center justify-center text-center w-full min-h-[300px]">
        
        <div ref={dropdownRef} className="absolute top-4 right-4 z-10">
          <Select value={selectedLang} onValueChange={setSelectedLang}>
            <SelectTrigger className="bg-secondary/80 backdrop-blur-md border-primary/20 text-xs h-9 rounded-full px-4 shadow-sm hover:shadow-md transition-shadow font-medium">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10">
              {LANGUAGE_OPTIONS.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} className="text-xs rounded-md">
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {state === "idle" && (
          <div className="flex flex-col items-center pt-4">
            <button 
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6 text-primary-foreground transition-all shadow-[0_4px_14px_rgba(var(--primary),0.4)] hover:scale-105 hover:shadow-[0_6px_20px_rgba(var(--primary),0.6)]"
            >
              <Mic className="w-10 h-10" />
            </button>
            <h3 className="text-xl font-bold mb-2">Tap to Speak</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Ask the Data Assistant to query your data schema.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 max-w-md mt-4">
              {suggestions.length > 0 ? suggestions.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDirectQuery(chip)}
                  className="text-[11px] font-mono-tight bg-secondary/60 hover:bg-primary hover:text-primary-foreground transition-colors border border-border/50 rounded-full px-3 py-1.5 shadow-sm"
                >
                  {chip}
                </button>
              )) : (
                <span className="text-xs text-muted-foreground italic">Connect a dataset to see suggestions</span>
              )}
            </div>
          </div>
        )}

        {(state === "recording" || state === "paused") && (
          <div className="flex flex-col gap-6 w-full max-w-md pt-8">
            {transcript && (
              <div className="bg-primary/10 text-primary p-4 rounded-2xl rounded-br-sm ml-auto max-w-[85%] text-sm">
                {transcript}
              </div>
            )}
            
            <div className="flex items-center gap-3 bg-card border shadow-lg rounded-full px-4 h-14 w-full animate-in slide-in-from-bottom-4 duration-300">
              <Button variant="ghost" size="icon" onClick={cancelRecording} className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 rounded-full w-10 h-10">
                <Trash2 className="w-5 h-5" />
              </Button>
              
              <div className="text-sm font-mono-tight text-foreground font-medium shrink-0 w-12 text-center animate-pulse">
                {formatTime(duration)}
              </div>
              
              <div className="flex-1 flex items-center justify-center gap-[3px] h-10 px-2 overflow-hidden">
                {Array.from({ length: barsCount }).map((_, i) => (
                  <div 
                    key={i} 
                    ref={el => { barsRef.current[i] = el; }} 
                    className={`w-[3px] rounded-full transition-colors ${state === "paused" ? "bg-muted-foreground h-1" : "bg-primary h-1"}`}
                  />
                ))}
              </div>

              {state === "recording" ? (
                <Button variant="ghost" size="icon" onClick={pauseRecording} className="text-primary hover:bg-primary/10 shrink-0 rounded-full w-10 h-10">
                  <Pause className="w-5 h-5 fill-current" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" onClick={resumeRecording} className="text-primary hover:bg-primary/10 shrink-0 rounded-full w-10 h-10">
                  <Play className="w-5 h-5 fill-current" />
                </Button>
              )}

              <Button size="icon" onClick={handleSend} className="bg-primary text-primary-foreground shrink-0 rounded-full w-10 h-10 shadow-md hover:scale-105 transition-transform">
                <Send className="w-4 h-4 ml-[2px]" />
              </Button>
            </div>
            {state === "paused" && <p className="text-xs text-muted-foreground animate-pulse">Auto-paused due to silence.</p>}
          </div>
        )}

        {state === "sent" && (
          <div className="flex flex-col gap-6 w-full max-w-md pt-8 min-h-[200px]">
            <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-br-sm ml-auto max-w-[85%] text-sm flex flex-col gap-2 relative group">
              <p>{transcript}</p>
              <button 
                onClick={() => speakText(transcript, "en-US")} 
                className="absolute -left-10 bottom-2 text-primary bg-primary/10 hover:bg-primary/20 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Replay Your Speech"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-secondary/50 border text-foreground p-4 rounded-2xl rounded-bl-sm mr-auto max-w-[85%] text-sm flex items-start gap-3 relative group">
              <div className="w-8 h-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-0.5">
                {aiResponse ? <Mic className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
              </div>
              <div className="flex-1 mt-1">
                {aiResponse ? (
                  <div className="animate-in fade-in duration-500">
                    <p className="leading-relaxed">{aiResponse}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground animate-pulse">Thinking...</p>
                )}
              </div>
              {aiResponse && (
                <button 
                  onClick={() => speakText(aiResponse, selectedLang)} 
                  className="absolute -right-10 bottom-2 text-foreground bg-secondary hover:bg-secondary/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Replay Response"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {aiResponse && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" className="rounded-full shadow-sm" onClick={resetState}>
                  Ask Another Question
                </Button>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {history.length > 0 && (
        <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Interaction History</span>
            <div className="h-[1px] flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-6">
            {history.map((item, index) => (
              <GlassCard key={item.id} className={`p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500`} style={{ animationDelay: `${index * 100}ms` }}>
                
                <div className="bg-primary/5 border border-primary/10 text-foreground p-4 rounded-2xl rounded-br-sm ml-auto max-w-[85%] text-sm flex gap-3 relative">
                  <div className="flex-1">
                    <p className="font-medium text-xs text-primary mb-1">You</p>
                    <p>{item.query}</p>
                  </div>
                  <button 
                    onClick={() => speakText(item.query, "en-US")} 
                    className="text-primary hover:text-primary/70 shrink-0 self-end"
                    title="Replay Your Query"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-secondary/50 border text-foreground p-4 rounded-2xl rounded-bl-sm mr-auto max-w-[85%] text-sm flex items-start gap-3 relative">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="flex-1 mt-1">
                     <p className="font-medium text-xs text-muted-foreground mb-1">SchemaSense</p>
                    <p className="leading-relaxed">{item.response}</p>
                  </div>
                  <button 
                    onClick={() => speakText(item.response, item.lang)} 
                    className="text-muted-foreground hover:text-foreground shrink-0 self-end"
                    title="Replay Response"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            ))}
            <div ref={historyEndRef} />
          </div>

          <div className="flex justify-center pt-4">
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-muted-foreground hover:text-destructive">
              Clear History
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
