import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle, GlassCard } from "@/components/ui-bits";
import { Mic } from "lucide-react";

export const Route = createFileRoute("/talkto-speech")({
  head: () => ({ meta: [{ title: "Talk to Speech · SchemaSense" }] }),
  component: TalkToSpeech,
});

function TalkToSpeech() {
  return (
    <div>
      <SectionTitle
        kicker="Intelligence"
        title={<>Talk to <span className="text-primary">Speech.</span></>}
        sub="Interact with the AI via voice commands."
      />
      <div className="mt-8">
        <GlassCard className="p-8 flex flex-col items-center justify-center text-center h-64">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <Mic className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Voice Input Ready</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            This module is currently in development. Soon you will be able to speak directly to the AI to query your schema.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}