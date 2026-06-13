import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle } from "@/components/ui-bits";
import { VoiceInputCard } from "@/components/VoiceInputCard";

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
        sub="Query and explore your database schema using natural voice commands."
      />
      <div className="mt-8">
        <VoiceInputCard />
      </div>
    </div>
  );
}