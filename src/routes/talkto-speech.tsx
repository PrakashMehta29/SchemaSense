import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle } from "@/components/ui-bits";
import { LlmSchemaSense } from "@/components/LlmSchemaSense";

export const Route = createFileRoute("/talkto-speech")({
  head: () => ({ meta: [{ title: "Data Assistant · SchemaSense" }] }),
  component: TalkToSpeech,
});

function TalkToSpeech() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle
        kicker="Interactive Mode"
        title={<>Data <span className="text-primary">Assistant.</span></>}
        sub="Interact with your data catalog via voice or text."
      />
      <div className="mt-8">
        <LlmSchemaSense />
      </div>
    </div>
  );
}