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
        sub="Interact with the AI via voice commands."
      />
      <div className="mt-8">
        <VoiceInputCard />
      </div>
    </div>
  );
}